import mongoose from 'mongoose';
import userService from '../services/usersService.js';
import validators from '../utils/validators.js';
import password from '../utils/password.js';

// Get all users
const getAllUsers = async (req, res) => {

    const userSearch = req.query?.params;
    const valid = validators.validateUserSearch(userSearch);
    if(!valid){
        return res.status(400).send({errorMsg: 'Invalid search query'});
    }
    const query = {
        $or: [
            { userName: { $regex: userSearch, $options: 'i' } },
            { firstName: { $regex: userSearch, $options: 'i' } },
            { lastName: { $regex: userSearch, $options: 'i' } }
        ]
    };
    const users = await userService.getAllUsers(query);
    if(users.errorMsg) {
        return res.status(500).send({errorMsg: users.errorMsg});
    }
    return res.status(200).send(users);
};

// Get a user by id
const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if(user.errorMsg) {
        return res.status(500).send({errorMsg: user.errorMsg});
    }
    const { _id, firstName, lastName, userName, email, friends, createdAt } = user;
    const user1 = { _id, firstName, lastName, userName, email, friends, createdAt };
    return res.status(200).send(user1);
};


// Get the active user
const getActiveUser = async (req, res) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if(!user){
        return res.status(404).send({errorMsg: `User not found`});
    }
    if(user.errorMsg) {
        return res.status(500).send({errorMsg: user.errorMsg});
    }

    // await user.populate('friends').execPopulate;
    return res.status(200).send(user);
};


// Create a user
const createUser = async (req, res) => {
    const status = 'create';
    // Validate the request body
    let {body, file} = req;

    const errors = await validators.validateForm(body, status);
     // Check if there are any errors
     if (errors.length > 0) {
         console.log(`res.status(400).send({ errorMsg: errors }`, errors );        
        return res.status(400).send({ errorMsg: errors });
    }

    // Check if user uploaded a profile picrure
    // If true, convert the image to base64 and add it to the body for DB storage
    //Saving the image in base64 format is not recommended for performance reasons, but it is done here for simplicity
    //For real large scale applications, it is recommended to save the image in a file storage service like AWS S3 or similar
    // and save the URL in the database instead of the image itself. 
    if (file) {
        // console.log(`file.buffer:::::::::::::::`, file.buffer);
        body.profilePicture = file.buffer.toString('base64');
        // console.log(`body.profilePicture`, body.profilePicture);        
        body.profilePictureMimeType = file.mimetype;
        console.log(`file.mimetype`, file.mimetype);        
    }

    // Hash the password
    body.password = await password.hashPassword(body.password);


    // Create the user
    const user = await userService.createUser(body);
    if(user.errorMsg) {
        return res.status(500).send({errorMsg: user.errorMsg});
    }
    return res.status(201).send(user);
};


// Update a user
const updateUser = async (req, res) => {
    const status = 'update';
    const { id } = req.params;
    if(id !== req.body.id) {
        return res.status(403).send({errorMsg: 'You are not authorized to perform this action'});
    }
    // Validate the request body
    const {body} = req;
    const errors = validators.validateForm(body, status);

     // Check if there are any errors
     if (errors.length > 0) {
        return res.status(400).send({ errorMsg: errors });
    }
    
    // Hash the password if it was updated by the user
    if(body.password){
        body.password = await password.hashPassword(body.password);
    }

    // Update the user
    const user = await userService.updateUser(id, req.body);
    if(user.errorMsg) {
        return res.status(500).send({errorMsg: user.errorMsg});
    }
    return res.status(200).send(user);
};


const deleteUser = async(req, res) => {
    const { id } = req.params;
    const user = await userService.deleteUser(id);
    if(user.errorMsg) {
        return res.status(500).send({errorMsg: user.errorMsg});
    }
    return res.status(200).send(user);
}


const getUsersFriends = async (req, res) => {
    const { id } = req.params;

    // Read an optional text query for filtering friends by name/username
    const q = (req.query?.params?.q || '').trim();

    // Parse the requested page size; clamp to [1..50] with a default of 20
    const rawLimit = parseInt(req.query?.params?.limit) || 50;
    console.log(`req.query?.params`, req.query?.params.limit);
    console.log(`rawLimit`, rawLimit);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 50;

    // Read the cursor parts: 'after' is an ISO timestamp; 'afterId' is ObjectId for tie-breaking
    const after = req.query?.params?.cursor?.after || null;
    const afterId = req.query?.cursor?.afterId || null;

    // Validate the required 'id' parameter to ensure it's a proper ObjectId
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({ errorMsg: 'Invalid or missing id' });
    }

    // If the client provided a tie-breaker id, validate it too
    if (afterId && !mongoose.isValidObjectId(afterId)) {
        return res.status(400).send({ errorMsg: 'Invalid afterId' });
    }
    
    const user = await userService.getUserById(id);
    console.log(`id1: ${id}`);
    if(!user){
        console.log(`User not found`);
        return res.status(404).send({errorMsg: `User not found`});
    }
    if(user.errorMsg) {
        return res.status(500).send({errorMsg: user.errorMsg});
    }

    // We'll build a MongoDB filter for the populated 'friends' based on search + cursor
    const andConds = [];

    // If there's a search term, add a case-insensitive OR across typical identity fields
    if (q) {
      andConds.push({
        $or: [
          { userName:  { $regex: q, $options: 'i' } },
          { firstName: { $regex: q, $options: 'i' } },
          { lastName:  { $regex: q, $options: 'i' } },
        ]
      });
    }

    // If we received a cursor, convert 'after' into a Date and build the "older than" condition
    if (after) {
        // Parse the ISO date; if it's invalid, tell the client
        const afterDate = new Date(after);
        if (Number.isNaN(afterDate.getTime())) {
          return res.status(400).send({ errorMsg: 'Invalid after (must be ISO date string)' });
        }
  
        // We sort results by { createdAt: -1, _id: -1 } meaning "newest first".
        // The next page should be items *strictly older* than the cursor:
        //   (createdAt < afterDate) OR (createdAt == afterDate AND _id < afterId)
        // If afterId is missing, we only use the createdAt branch.
        const cursorOr = [{ createdAt: { $lt: afterDate } }];
        if (afterId) {
          cursorOr.push({ createdAt: afterDate, _id: { $lt: new mongoose.Types.ObjectId.createFromTime(afterId) } });
        }
  
        // Push the OR condition into our AND list to combine with search filters
        andConds.push({ $or: cursorOr });
    }
  
    // If we collected any conditions, wrap them into an $and; otherwise use an empty filter
    const match = andConds.length ? { $and: andConds } : {};

    const checkForMore = limit + 1;
    let hasMore = false;
    let nextCursor = null;

    // Now populate the 'friends' reference with our filter, sort, and limit
    await user.populate([{
        // The path in the User schema that contains ObjectId refs to other Users
        path: 'friends',
        // Apply our combined search+cursor filter to the referenced User documents
        match,
        // Sort newest first by createdAt, then by _id (stable ordering when createdAt ties)
        options: { sort: { createdAt: -1, _id: -1 }, limit : checkForMore },
        // Select only fields the client UI needs (keeps payload slim)
        select: '_id firstName lastName userName email profilePicture profilePictureMimeType status createdAt'
    }]);

    const friends = user.friends || [];
    if(user.friends.length > limit) {
        user.friends.pop();
        hasMore = true;
        const last = friends[friends.length - 1];
        nextCursor = {
            after: last.createdAt?.toISOString?.() || new Date().toISOString(),
            afterId: String(last._id)
        };
    }


    console.log(`id2: ${id}`);
    return res.status(200).send({
        friends,
        hasMore,
        nextCursor,
    });
}


//Handle user socket
const socketGetAllUsers = async (filters) =>{
    return await userService.getAllUsers(filters);
}
  

export default {
    getAllUsers,
    getUserById,
    getActiveUser,
    createUser,
    updateUser,
    deleteUser,
    getUsersFriends,
    socketGetAllUsers,
};
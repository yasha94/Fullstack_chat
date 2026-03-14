import User  from '../models/userModel.js';

// Get All
/*consider to add an additioanal parameter of array 
that will contain the fields to return.
In case you'll have time to implement user experiance 
that allows you to hide certien fields of his information like hide email and phone number*/
const getAllUsers = (query, select) => {
    return User.find(query, select || '_id firstName lastName userName email status profilePicture profilePictureMimeType friends lastSeen phoneNumber createdAt')
        .sort({ firstName: 1 }); // 1 for ascending, -1 for descending
};

// Get By ID
const getUserById = (id) => {
    return User.findById(id, 'firstName lastName userName email friends lastSeen');
};
 
// Get By Email
const getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email: email }, '_id userName email password status profilePicture profilePictureMimeType');
        return user;
    } catch (error) {
        return { errorMsg: 'An error occurred while retrieving user' };
    }
};

// Create
const createUser = (obj) => {
    return User.create(obj);
};

// Update
const updateUser = (id, obj) => {
    return User.findByIdAndUpdate(id, obj);
};

// Delete
const deleteUser = (id) => {
    return User.findByIdAndDelete(id);
};

//save user document
const saveUser = (user) => {
    return user.save();
};

export default {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  saveUser,
};

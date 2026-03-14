import multer from 'multer';
import validators from '../utils/validators.js';
import usersService from '../services/usersService.js';
import jwtToken from '../utils/jwt.js';
import onlineSockets from '../utils/onlineSockets.js';


const login = async (req, res) => {
    const { body } = req;

    const user = await usersService.getUserByEmail(body.email);
    console.log(`user ${user}`);
    if (user === null || user.errorMsg ) {
        if(user === null){
            return res.status(400).send({ errorMsg: `Email or password are not correct` });
        }
        return res.status(500).send({ errorMsg: user.errorMsg });
    }
    // if(user.status.toLowerCase() === "online"){
    //     return res.status(400).send({ errorMsg: `User is already online` });
    // }
    
    // Validate the password and email
    const errors = await validators.validateLoginForm(body, user.password, user.email);
    console.log(`user password ${user.password}`);
    console.log(`user _id ${user._id}`);
    console.log(`user status ${user.status}`);
    console.log(`user email ${user.email}`);
    console.log(`body password ${body.password}`);
    console.log(`errors length: ${errors.length}`);

    if (errors.length > 0) {
        console.log(`errors: ${errors}`);
        return res.status(400).send({ errorMsg: errors });
    }
    
    // Generate JWT token
    const token = jwtToken.generateToken(user);
    res.setHeader('Authorization', `Bearer ${token}`);
    res.cookie('jwt', `Bearer ${token}`, {httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 24 * 60 * 60 * 1000});
    res.setHeader('Access-Control-Expose-Headers', 'Authorization')
    const uu = await usersService.updateUser(user._id, {status: "online"});
    if(uu.errorMsg){
        console.log(`4444444444444444444444444 ${uu.errorMsg}`);
    }
    console.log(`user status ${user.status}`);
    
    
    
    // Respond with the user info and token
    return res.status(200).send({ user, token });
};

const logOut = async (req, res) => {
    if(!req.user.id){
        return res.status(400).send({logedOut: "User is already logged out", })
    }
    const date = new Date();
    const str = date.toLocaleString("he-IL");
    const nDate = new Date(str);
    console.log("str");
    console.log(str);
    res.setHeader('Authorization', ` `);
    await usersService.updateUser(req.user.id, {status: "offline", lastSeen: nDate});
    onlineSockets.delete(req.user.id);
    return res.status(200).send({logedOut: "logged out successfuly", })
}

export default { login, logOut };

import jwt from 'jsonwebtoken';
import validators from './validators.js';
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.JWT_SECRET);

const privateKey = validators.validateRsa(process.env.JWT_SECRET);
console.log(`privateKey: ${privateKey}`);
const expiresIn = '15h';

const generateToken = (user) => {
    const j = jwt.sign(
        {
        id: user._id,
        email: user.email,
        username: user.userName,
        },
        privateKey,
        {
        expiresIn: expiresIn,
        }
    );
    console.log(`------------------> jwt token jen`, j);
    return j;
};

const verifyToken = (token) => {
    const date = new Date();
    console.log(`date`, date);
    try{
        return jwt.verify(token, privateKey);
    }
    catch(err){
        console.log(`Token verification failed!!!!!!!! -----`);
        console.log( token);
        console.log(`Token verification failed!!!!!!!! -----`);
        return {errorMsg: `Token verification failed: ${err}`}
    }
}

const refreshToken = (token) => {
    return jwt.sign(
        {
        id: token.id,
        email: token.email,
        username: token.userName,
        },
        privateKey,
        {
        expiresIn: expiresIn,
        }
    );
};

const decodeToken = (token) => {
    return jwt.decode(token, privateKey);
};

export default {
    generateToken,
    verifyToken,
    refreshToken,
    decodeToken,
};
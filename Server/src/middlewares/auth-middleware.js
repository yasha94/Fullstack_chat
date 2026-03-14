import jwtToken from '../utils/jwt.js';
import validators from '../utils/validators.js';

const authenticateIoConnection = (socket, next) => {
    console.log("STARTING AUTHENTICATION");
    // const token = socket.handshake.auth.token;
    const token = socket.handshake.auth.token ? socket.handshake.auth.token : socket.handshake.headers.auth;

    //Validates the token header and body
    const isValidT = validators.isValidToken(token);
    if(isValidT.errorMsg){
        console.log("TOKEN IS NOT VALID");
        console.log(`socket will disconnect`);
        socket.authenticated = false;
        socket.errorMsg = isValidT.errorMsg;
        next();
        return;
    }
    console.log("TOKEN IS VALID");

    const decoded = jwtToken.verifyToken(isValidT);
    if (decoded.errorMsg) {
        socket.authenticated = false;
        socket.errorMsg = decoded.errorMsg;
        next();
        return;
    }
    console.log(`decoded --------------------------------------`);
    console.log(decoded);
    socket.authenticated = true;
    socket.user = decoded; // Save decoded user info to socket object
    next();
}


const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    console.log(`token ${token}`);
    //Validates the token header and body
    const isValidT = validators.isValidToken(token);
    console.log(`isValidT: ${isValidT}`);
    
    if(isValidT.errorMsg){
        return res.status(401).json({ message: `Authentication error: ${isValidT.errorMsg}`});
    }

    const decoded = jwtToken.verifyToken(isValidT);
    if(decoded.errorMsg){
        return res.status(401).json({ message: `Authentication error: ${decoded.errorMsg}`});
    }
    req.user = decoded;
    console.log(`req.user`);
    console.log(req.user);
    
    
    const newToken = jwtToken.refreshToken(decoded);
    res.setHeader('Authorization', `Bearer ${newToken}`);
    
    next();
};
export default {authenticateIoConnection, authMiddleware};
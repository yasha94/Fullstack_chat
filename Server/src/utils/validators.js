import password from './password.js';
import userService from '../services/usersService.js';

const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(String(email).toLowerCase());
  };  

const validatePassword = (password) => {
    const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"£$%^&*()-=])[A-Za-z\d!"£$%^&*()-=]{8,16}$/.test(String(password));
    return isValid;
};

const validateUsername = (username) => {
    const isValid = /^[a-zA-Z][a-zA-Z0-9_\-@#$]{3,16}$/.test(String(username));
    return isValid;
};

const validateFirstName = (firstName) => {
    const isValid = /^[a-zA-Z]{3,16}$/.test(String(firstName));
    return isValid;
};

const validateLastName = (lastName) => {
    const isValid = /^[a-zA-Z]{3,16}$/.test(String(lastName));
    return isValid;
};

const validateUserSearch = (search) => {
    const isValid = /^[a-z][a-z0-9_\-@#$]{1,15}$/i.test(String(search));
    return isValid;
};


//validate create/update user form
const validateForm = async (form, status) => {
    const errors = [];
    const isUserNameUsed = await userService.getAllUsers({ userName: form.userName });
    if (!form.firstName) {
        errors.push('First name is required');
    }
    else if(!validateFirstName(form.firstName)) {
        errors.push('First name is not valid');
    }
    // Last name
    if (!form.lastName) {
        errors.push('Last name is required');
    }
    else if (!validateLastName(form.lastName)) {
        errors.push('Last name is not valid');
    }
    //User name
    if (!form.userName) {
        errors.push('Username is required');
    }
    else if (!validateUsername(form.userName)) {
        errors.push('Username is not valid');
    }
    /*
    Validates:
        password was sent.
        password between 8 and 16 chars
        password has at least one of the chars: [UPPER_CASE, lower_case, number, special_sign]
    e.g.
        12345678aA! -> V
        12345678 -> X
    */
    if (!form.password) {
        errors.push('Password is required');
    }
    else if (!validatePassword(form.password)) {
        errors.push('Password is not valid');
    }
    // Validates varify password was sent
    if (!form.confirmPassword) {
        errors.push('Verify password is required');
    }
    // Validates matching password and verifyPassword
    if (form.password !== form.confirmPassword) {
        errors.push('Passwords do not match');
    }
    else if(status === 'update' &&  isUserNameUsed.length > 0 && isUserNameUsed[0] !== form.userName) {
        errors.push('username is already used');
    }
    /*
    Validations only needed Fields for creating a user
    Validates:
        email in correct email format
    e.g.
        mail@mail.com -> V
        mail@.commail@mail.com -> X
    */
    if(status.toLowerCase() === 'create'){
        const isEmailUsed = await userService.getAllUsers({ email: form.email });
        console.log(`isEmailUsed OUTSIDE OF IF STATMENT ${isEmailUsed}`);
        if (!form.email) {
            errors.push('Email is required');
        }
        else if (!validateEmail(form.email)) {
            errors.push('Email is not valid');
        }
        if(isEmailUsed.length > 0 || isUserNameUsed.length > 0) {
            errors.push('Email or username is already used');
            console.log(`isEmailUsed ${isEmailUsed}`);
            console.log(`isUserNameUsed ${isUserNameUsed}`);
        }
    }
    return errors;
};

const validateRsa = (rsa) => {
    return rsa.replace(/\\n/gm, '\n');
};

const validateLoginForm = async (form, hashed, email) => {
    const errors = [];
    if (!form.email) {
        errors.push('Email is required');
    }
    else if (!validateEmail(form.email)) {
        errors.push('Email is not valid');
    }
    if (!form.password) {
        errors.push('Password is required');
    }
    else if (!validatePassword(form.password)) {
        errors.push('Password is not valid');
    }
    if(!await password.comparePasswords(form.password, hashed) || form.email !== email) {
        errors.push('Email or password are not correct');
        console.log(`Email or password are not correct`);
    }
    return errors;
};

/*Makes sure there is a token.
If there is a token,
splits it to check the token is valid with header and body
also checking first part of token to make sure it is Bearer*/
const isValidToken = (token) => {
    if (!token) {
       return {errorMsg: 'Authentication error: No token provided' };
    }

    const authParts = token.split(' ');
    console.log(`authParts: ${authParts}`);
    const isValid = authParts && authParts.length === 2 && authParts[0] === 'Bearer';
    if (!isValid) {
       return {errorMsg: 'Authentication error: Invalid token format' };
    }
    return authParts[1];
}


export default {
    validateEmail,
    validatePassword,
    validateUsername,
    validateFirstName,
    validateLastName,
    validateForm,
    validateRsa,
    validateLoginForm,
    isValidToken,
    validateUserSearch,
};
const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s!@#$%^&*()=+`/'":;~,<>?.{}]+\.[^\s@!@#$%^&*()=+`/'":;~,<>?.-_-{}]{1,30}$/;
    return emailPattern.test(String(email));
};  

const validatePassword = (password) => {
    const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"£$%^&*()-=])[A-Za-z\d!"£$%^&*()-=]{8,16}$/.test(String(password));
    return isValid;
};

const validateUserName = (userName) => {
    const isValid = /^[a-zA-Z][a-zA-Z0-9_\-@#$]{3,16}$/.test(String(userName));
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

const validatePhoneNumber = (phoneNumber) => {
    const isValid = /^[0-9]{10}$/.test(String(phoneNumber));
    return isValid;

}

//validate create/update user form
const validateForm = async (form, status) => {
    const errors = [];
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
    else if (!validateUserName(form.userName)) {
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
    /*
    Validations only needed Fields for creating a user
    Validates:
        email in correct email format
    e.g.
        mail@mail.com -> V
        mail@.commail@mail.com -> X
    */
    if(status.toLowerCase() === 'create'){
        if (!form.email) {
            errors.push('Email is required');
        }
        else if (!validateEmail(form.email)) {
            errors.push('Email is not valid');
        }
    }
    return errors;
};


export {validateForm,
        validateEmail,
        validatePassword,
        validateUserName,
        validateFirstName,
        validateLastName,
        validatePhoneNumber,
};
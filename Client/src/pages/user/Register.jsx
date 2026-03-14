import Swal from 'sweetalert2'
import { useState, useEffect, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Form from '../../components/shared/form/Form';
import Input from '../../components/shared/input/Input';
import Button from '../../components/shared/Button';
import { validateForm, validateEmail, validatePassword, validateUserName, validateFirstName, validateLastName, validatePhoneNumber} from '../../utils/validators';
import { faCheck, faXmark, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import {faCircleCheck} from '@fortawesome/free-regular-svg-icons';
import register from '../../services/user/register';
import useAppTheme from '../../hooks/useAppTheme';



const Register = () => {
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const errRef = useRef();
    const navigate = useNavigate();

    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [userNameError, setUserNameError] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [passwordsDontMatchError, setPasswordsDontMatchError] = useState();

    const [firstNameIcon, setFirstNameIcon] = useState("");
    const [lastNameIcon, setLastNameIcon] = useState('');
    const [userNameIcon, setUserNameIcon] = useState('');
    const [phoneNumberIcon, setPhoneNumberIcon] = useState('');
    const [emailIcon, setEmailIcon] = useState('');
    const [passwordIcon, setPasswordIcon] = useState('');
    const [confirmPasswordIcon, setConfirmPasswordIcon] = useState('');
    
    const [formData, setFormData] = useState({});   
    const [errorMsg, setErrorMsg] = useState();
    const [data, setData] = useState();

    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);

    const {appTheme} = useAppTheme();

    const registerFormData = [
        {
            'type': 'search',
            'label': 'First name',
            'required': true,
            'placeholder': 'Enter your first name',
            'id': 'first-name',
            'name': 'firstName',
            'component': Input,
            'showLabel': true,
            'error': firstNameError,
            'icon': {'icon': firstNameIcon.icon, 'color': firstNameIcon.color, 'size': firstNameIcon.size},
            'ref': firstNameRef,
            'style': {backgroundColor: appTheme ? '#211f30 ' : '#a8a6b8', color: appTheme ? '#a8a6b8' : '#211f30 '},
        },
        {
            'type': 'text',
            'label': 'Last name',
            'required': true,
            'placeholder': 'Enter your last name',
            'id': 'last-name',
            'name': 'lastName',
            'component': Input,
            'showLabel': true,
            'error': lastNameError,  
            'icon': {'icon': lastNameIcon.icon, 'color': lastNameIcon.color},    
            'ref': lastNameRef,
            'style': {backgroundColor: appTheme ? '#211f30 ' : '#a8a6b8', color: appTheme ? '#a8a6b8' : '#211f30 '},
        },
        {
            'type': 'text',
            'label': 'User name',
            'required': true,
            'placeholder': 'Enter your user name',
            'id': 'user-name',
            'name': 'userName',
            'component': Input,
            'showLabel': true,
            'error': userNameError,   
            'icon': {'icon': userNameIcon.icon, 'color': userNameIcon.color},
            'style': {backgroundColor: appTheme ? '#211f30 ' : '#a8a6b8', color: appTheme ? '#a8a6b8' : '#211f30 '},
        },
        {
            'type': 'email',
            'label': 'Email',
            'required': true,
            'placeholder': 'Enter your email',
            'id': 'r-email',
            'name': 'email',
            'component': Input,
            'showLabel': true,
            'error': emailError,
            'icon': {'icon': emailIcon.icon, 'color': emailIcon.color},
            'style': {backgroundColor: appTheme ? '#211f30 ' : '#a8a6b8', color: appTheme ? '#a8a6b8' : '#211f30 '},
        },
        {
            'type': 'tel',
            'label': 'Phone number',
            'required': true,
            'placeholder': 'Enter your phone number',
            'id': 'phone-number',
            'name': 'phoneNumber',
            'component': Input,
            'showLabel': true,
            'error': phoneNumberError,
            'icon': {'icon': phoneNumberIcon.icon, 'color': phoneNumberIcon.color},
            'style': {backgroundColor: appTheme ? '#211f30 ' : '#a8a6b8', color: appTheme ? '#a8a6b8' : '#211f30 '},
        },
        {
            'type': 'file',
            'label': 'Profile picture',
            'id': 'profile-picture',
            'name': 'profilePicture',
            'component': Input,
            'showLabel': true,
            // 'style': { width: '40.5%'},
            // 'icon': icon,   
            'style': { color: appTheme ? '#a8a6b8' : '#211f30 ', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'},
            // 'value': '',
        },
        // {
        //     'type': 'button',
        //     'label': 'Profile picture',
        //     'id': 'profile-picture-button',
        //     'name': 'profilePictureButton',
        //     // 'component': Button,
        //     'showLabel': true,
        //     // 'style': { width: '40.5%'},
        //     // 'icon': icon,   
        //     'style': { color: appTheme ? '#a8a6b8' : '#211f30 ', maxWidth: '150px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'},
        //     // 'value': '',
        // },
        {
            'type': 'password',
            'label': 'Password',
            'required': true,
            'placeholder': 'password',
            'id': 'r-password',
            'name': 'password',
            'component': Input,
            'showLabel': true,
            'error': passwordError,
            'icon': {'icon': passwordIcon.icon, 'color': passwordIcon.color}, 
            'style': {backgroundColor: appTheme ? '#211f30 ' : '#a8a6b8', color: appTheme ? '#a8a6b8' : '#211f30 '},
        },
        {
            'type': 'password',
            'label': 'Confirm password',
            'required': true,
            'placeholder': 'Confirm password',
            'id': 'confirm-password',
            'name': 'confirmPassword',
            // 'component': Input,
            'showLabel': true,
            'error': confirmPasswordError,  
            'icon': {'icon': confirmPasswordIcon.icon, 'color': confirmPasswordIcon.color}, 
            'style': {backgroundColor: appTheme ? '#211f30 ' : '#a8a6b8', color: appTheme ? '#a8a6b8' : '#211f30 '},
        },
        {
            'type': 'submit',
            'label': 'Submit',
            'placeholder': 'Submit',
            'id': 'submit-register-form',
            'name': 'submitRegisterForm',
            'component': Button,
            'showLabel': false,
            'style': { backgroundColor: appTheme ? '#a8a6b8' : '#211f30 ', color: appTheme ? '#211f30 ' : '#a8a6b8', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer'},    
        },
        {
            'type': 'reset',
            'label': 'Reset',
            'placeholder': 'Reset',
            'id': 'reset-register-form',
            'name': 'resetRegisterForm',
            'component': Button,
            'showLabel': false,
            'style': { backgroundColor: appTheme ? '#a8a6b8' : '#211f30 ', color: appTheme ? '#211f30 ' : '#a8a6b8', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer'},    
        },
    ];

    const handleOnBlur = (e) => {
        const { value, name} = e.target;
        if(name === "firstName"){
            if(!value){
                setFirstNameIcon({'icon': faXmark, color: '#cc0000'});
                setFirstNameError({
                    'data': ["First name is required", "Must contain between 3 and 24 charecters", "Must containt only letters"],
                })            
            }
        }
        if(name === "lastName"){
            if(!value){
                setLastNameIcon({'icon': faXmark, color: '#cc0000'});
                setLastNameError({
                    'data': ["Last name is required", "Must contain between 3 and 24 charecters", "Must containt only letters"],
                })            
            }
        }
        if(name === "userName"){
            if(!value){
                setUserNameIcon({'icon': faXmark, color: '#cc0000'});
                setUserNameError({
                    'data': ["Must begin with a letter", "User name is required", "Must contain between 4 and 24 charecters"],
                })            
            }
        }
        if(name === "email"){
            if(!value){
                setEmailIcon({'icon': faXmark, color: '#cc0000'});
                setEmailError({
                    'data': ["Email is required", "Must contain correct format of mail", "for example", "example@example.com"],
                })            
            }
        }
        if(name === "phoneNumber"){
            if(!value){
                setPhoneNumberIcon({'icon': faXmark, color: '#cc0000'});
                setPhoneNumberError({
                    'data': ["Phone number is required", "Must contain 10 charecters", "Must containt only numbers"],
                })            
            }
        }
        if(name === "password"){
            if(!value){
                setPasswordIcon({'icon': faXmark, color: '#cc0000'});
                setPasswordError({
                    'data': ["Password is required", "Must contain between", "8 and 24 charecters", "MUST CONTAIN:", "UPPERCASE, lowercase, numbers and special charcters"],
                })            
            }
        }
        if(name === "confirmPassword"){
            if(!value){
                setConfirmPasswordIcon({'icon': faXmark, color: '#cc0000'});
                setConfirmPasswordError({
                    'data': ["ConfirmPassword is required"],
                })            
            }
        }
    }

    useEffect(() => {
        if(!formData.firstName){
            // setFirstNameError({
            //     'data': ["First name is required", "Must contain between 3 and 24 charecters", "Must containt only letters"],
            //     'style': {display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', listStyleType: 'none', color: 'white', backgroundColor: "#EED202", width: 'fit-content', borderRadius: '5px', marginLeft: '39%', marginRight: '21%', paddingLeft: '10%', paddingRight: '10%', fontSize: '12px', fontWeight: 'bold'}
            // })
            setFirstNameIcon({'icon': faCircleInfo, color: '#EED202', size: 'lg'});
            setFirstNameError('');
        }
        else if(!validateFirstName(formData.firstName)){
            setFirstNameError({
                'data': ["First name is required", "Must contain between 3 and 24 charecters", "Must containt only letters"],
            })
            setFirstNameIcon({'icon': faXmark, color: '#cc0000'});
        }
        else{
            setFirstNameError('')
            setFirstNameIcon({'icon': faCircleCheck, color: '#4BB543'});
        }
        if(!formData.lastName){
            setLastNameIcon({'icon': faCircleInfo, color: '#EED202'});
            // setLastNameError("Last    name is requiered")
        }
        else if(!validateLastName(formData.lastName)){
            setLastNameIcon({'icon': faXmark, color: '#cc0000'});
            // setLastNameError("Last name is not valid")                
        }
        else{
            setLastNameIcon({'icon': faCircleCheck, color: '#4BB543'});
            setLastNameError('')
        }
        if(!formData.userName){
            setUserNameIcon({'icon': faCircleInfo, color: '#EED202'});
            // setUserNameError("User    name is requiered")
        }
        else if(!validateUserName(formData.userName)){
            setUserNameIcon({'icon': faXmark, color: '#cc0000'});
            // setUserNameError("User name is not valid")                
        }
        else{
            setUserNameIcon({'icon': faCircleCheck, color: '#4BB543'});
            setUserNameError('')
        }
        if(!formData.email){
            setEmailIcon({'icon': faCircleInfo, color: '#EED202'});
            // setEmailError("Email     is requiered")
        }
        else if(!validateEmail(formData.email)){
            setEmailIcon({'icon': faXmark, color: '#cc0000'})
            // setEmailError("Email is not valid")                
        }
        else{
            setEmailIcon({'icon': faCircleCheck, color: '#4BB543'});
            setEmailError('')
        }
        if(!formData.phoneNumber){
            setPhoneNumberIcon({'icon': faCircleInfo, color: '#EED202'});
            // setPhoneNumberError("    Phone number is requiered")
        }
        else if(!validatePhoneNumber(formData.phoneNumber)){
            setPhoneNumberIcon({'icon': faXmark, color: '#cc0000'})
            // setPhoneNumberError("Phone number is not valid")                
        }
        else{
            setPhoneNumberIcon({'icon': faCircleCheck, color: '#4BB543'});
            setPhoneNumberError('')
        }
        if(!formData.password){
            setPasswordIcon({'icon': faCircleInfo, color: '#EED202'});
            // setPasswordError("Pas    sword is requiered")
        }
        else if(!validatePassword(formData.password)){
            setPasswordIcon({'icon': faXmark, color: '#cc0000'});
            // setPasswordError("Password is not valid")                
        }
        else{
            setPasswordIcon({'icon': faCircleCheck, color: '#4BB543'});
            setPasswordError('')
        }
        if(!formData.confirmPassword){
            setConfirmPasswordIcon({'icon': faCircleInfo, color: '#EED202'})
            setConfirmPasswordError("")
        }
        else if((formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) || !validatePassword(formData.password)){
            setConfirmPasswordIcon({'icon': faXmark, color: '#cc0000'});
            setConfirmPasswordError({
                ...confirmPasswordError, 'data': ['no match']
            });
        }
        else{
            setConfirmPasswordIcon({'icon': faCircleCheck, color: '#4BB543'});
            setConfirmPasswordError('')
        }
    }, [formData])

    const followPictureChange = (e) => {
        
    }

    let F;
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        // if((preview === null || preview === '') && (file === null || file === '')){
        //     e.target.value = '';
        // }
        if (selected) {            
            setFile(selected);
            F = selected;
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result); // base64 string
            };
            reader.readAsDataURL(selected);
        }
    };

    const handleChange = (e) => {
        const { value, name} = e.target;
        if(name === 'profilePicture'){
            handleFileChange(e);
            setFormData({...formData, [name]: F});
            console.log(`file::::::::::`, file);            
            console.log(`F::::::::::`, F);            
            console.log(`Preview::::::::::`, preview);            
            console.log(`formData:::::`, formData);
            return;
        }
        setFormData({...formData, [name]: value});
        console.log(`formData:::::`, formData);
        // console.log(`label: ${label}, value: ${value}`);
    };
    
    // Handles the form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = (await register(formData));
        console.log(`formData:`, formData);
        if(data.errorMsg){
            setErrorMsg(data.errorMsg);
            console.log(`Error in registration:`, errorMsg);
        }
        else{
            console.log(`new user data:`, data);
            setData(data);
            console.log(`This is inside form success!!! this is data returning from AXIOS!!!!!`);
            console.log(data);
            console.log(`This is inside form success!!! this is data returning from AXIOS!!!!!`);
            setErrorMsg('');
            navigate("/login")
        }
    };

    useEffect(() => {
        firstNameRef.current.focus();
    }, []);

    const errorDivH = 
        firstNameError ||
        lastNameError ||
        userNameError ||
        emailError ||
        phoneNumberError ||
        passwordError || 
        confirmPasswordError;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
            <h1 style={{height: 'fit-content'}}>Register</h1>
            <Form formData={registerFormData} onChange={handleChange} onBlur={handleOnBlur} onClick={handleSubmit} encType={'multipart/form-data'}/>
            {preview && 
                Swal.fire({
                    title: 'Profile picture preview',
                    text: 'This will be your profile picture',
                    imageUrl: preview,
                    imageWidth: 200,
                    imageHeight: 200,
                    imageAlt: 'Profile picture preview',
                    confirmButtonText: 'OK',
                    confirmButtonColor: appTheme ? '#a8a6b8' : '#211f30',
                    background: appTheme ? '#211f30' : '#a8a6b8',
                    color: appTheme ? '#a8a6b8' : '#211f30',
                    icon: 'info',
                    iconColor: appTheme ? '#a8a6b8' : '#211f30',
                    showCloseButton: false,
                    customClass: {
                        popup: 'swal-popup',
                        title: 'swal-title',
                        content: 'swal-content',
                        confirmButton: 'swal-confirm-button',
                        closeButton: 'swal-close-button',
                    },
                    showLoaderOnConfirm: true,
                    showDenyButton: true,
                    denyButtonText: 'Choose another picture',
                    denyButtonColor: appTheme ? '#a8a6b8' : '#211f30',                    
                    allowOutsideClick: () => !Swal.isLoading(),
                    focusConfirm: true,
                    preConfirm: () => {
                        // Swal.fire({
                        //     text: 'Profile picture selected successfully',
                        //     icon: 'warning',
                        //     showDenyButton: true,
                        //     denyButtonText: 'Choose another picture',
                        // })
                        setPreview(null);
                        // return true;
                    },
                    preDeny: () => {
                        setPreview(null);
                        setFile(null);
                        setFormData({...formData, 'profilePicture': null});
                    }                    
                })
            }
            <ul style={{color: '#cc0000', listStyleType: 'none', paddingRight: '17%'}}>
                {errorMsg &&
                    Array.isArray(errorMsg) ? errorMsg.map(errM => {                    
                        return <li  data-error={errM} key={errM}>{errM}</li>
                    }) 
                    :
                    <li data-error={errorMsg}>{errorMsg}</li>
                }
            </ul>
        </div>
    );
};

export default Register;
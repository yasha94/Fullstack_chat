import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation} from 'react-router-dom';
import Form from '../../components/shared/form/Form';
import Input from '../../components/shared/input/Input';
import Button from '../../components/shared/Button';
import { faXmark, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import login from '../../services/auth/login';
import useAuth from '../../hooks/useAuth';
import useAppTheme from '../../hooks/useAppTheme';
import useSocket from '../../hooks/useSocket';
import '../../components/shared/input/Input.css'

const Login = () => {
    const { auth, setAuth } = useAuth();
    const { connectSocket } = useSocket();
    const { appTheme } = useAppTheme();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const userNameRef = useRef();

    const [userNameIcon, setUserNameIcon] = useState('');
    const [passwordIcon, setPasswordIcon] = useState('');

    const [errorMsg, setErrorMsg] = useState();

    const [UserFormInput, setUserFormInput] = useState({});
    
    const formFields = [
        {
            'type': 'email',
            'label': 'Email',
            'required': true,
            'placeholder': 'Enter your email here',
            'id': 'login-email',
            'name': 'email',
            'component': Input,
            'showLabel': true,
            // 'error': [userNameError],   
            'icon': {'icon': faCircleInfo, 'color': "#EED202"},
            'ref': userNameRef,
            'autoComplete': 'off',
            'autoCorrect': 'off',
            'spellCheck': 'off',
            'style': {backgroundColor: appTheme ? '#211f30 ' : '#a8a6b8', color: appTheme ? '#a8a6b8' : '#211f30 '},
        },
        {
            'type': 'password',
            'label': 'Password',
            'required': true,
            'placeholder': 'password',
            'id': 'login-password',
            'name': 'password',
            'component': Input,
            'showLabel': true,
            // 'error': [passwordError],
            'icon': {'icon': faCircleInfo, 'color': "#EED202"},
            'autoComplete': false,
            'autoCorrect': false,
            'spellCheck': false,
            'style': {backgroundColor: appTheme ? '#211f30 ' : '#a8a6b8', color: appTheme ? '#a8a6b8' : '#211f30 '},
        },
        {
            'type': 'submit',
            'label': 'Submit',
            'placeholder': 'Submit',
            'id': 'submit-login-form',
            'name': 'submitLoginForm',
            'component': Button,
            'showLabel': false,
            'style': { backgroundColor: appTheme ? '#a8a6b8' : '#211f30 ', color: appTheme ? '#211f30 ' : '#a8a6b8', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer'},    
        },
        {
            'type': 'reset',
            'label': 'Reset',
            'placeholder': 'Reset',
            'id': 'reset-login-form',
            'name': 'resetLoginForm',
            'component': Button,
            'showLabel': false,
            'style': { backgroundColor: appTheme ? '#a8a6b8' : '#211f30 ', color: appTheme ? '#211f30 ' : '#a8a6b8', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer'},    
        },
    ];

    const handleChange = (e) => {
        const { value, name} = e.target;
        setUserFormInput({...UserFormInput, [name]: value});
    };

    const handleOnBlur = (e) => {

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = await login(UserFormInput);
        console.log(`login data`, data);            
        if(data.errorMsg){
            setErrorMsg(data.errorMsg);
            console.log(`Error in registration:`, data.errorMsg);
        }
        else{
            setAuth({user: data.data?.user, accessToken: data.data?.token, isAuthenticated: true});
            console.log(`user in Login component`, data.data);
            connectSocket('http://localhost:3000', `Bearer ${data.data?.token}`);
            navigate(from, {replace: true});
            console.log(`login data.data.user`, data.data.user);
            console.log(`login data.data.token`, data.data.token);
            console.log(`login headers`, data.headers.get('Authorization'));            
            console.log(`auth`, auth);            
        }

    }

    useEffect(() => {
        userNameRef.current.focus();
    }, []);


    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <h1>Login</h1>
            <Form formData={formFields} onChange={handleChange} onBlur={handleOnBlur} onClick={handleSubmit}/>
            {errorMsg && <p>{errorMsg}</p>}
        </div>
    );
}

export default Login;
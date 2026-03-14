import Form from '../shared/form/Form';
import TextErea from '../shared/TextErea';
import Button from '../../components/shared/Button';
import { useState } from 'react';

const SendMessage = () => {
    const [message, setMessage] = useState('');
    
    const sendMessageFormData = [
        {
            'type': 'text',
            'required': true,
            'placeholder': 'Enter your message',
            'id': 'send-message',
            'name': 'sendMessage',
            'component': TextErea,
            'showLabel': false,  
        },
        {
            'type': 'submit',
            'label': 'Submit',
            'placeholder': 'Submit',
            'id': 'submit-message',
            'name': 'submitMessage',
            'component': Button,
            'showLabel': false,      
        },
        {
            'type': 'reset',
            'label': 'Reset',
            'placeholder': 'Reset',
            'id': 'reset-message',
            'name': 'resetMessage',
            'component': Button,
            'showLabel': false,      
        },
    ];

    const handleChange = (message) => {
        setMessage(message);
    };

    const onClick = () => {
        
    }
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '10vh'}}>
            <Form formData={sendMessageFormData} onChange={handleChange}/>
        </div>
    );
    
};

export default SendMessage;
import { useNavigate } from 'react-router-dom';
import useAppTheme from '../../hooks/useAppTheme';

const WelcomePage = () => {
    const navigate = useNavigate();
    const {appTheme} = useAppTheme();

    const handleJoinChatVerse = () => {
        navigate('/register');
    };

    const onMouseOver = (e) => {
        e.currentTarget.style.backgroundColor = appTheme ? '#a8a6b8' : '#211f30';
        e.currentTarget.style.color = appTheme ? '#211f30' : '#a8a6b8';
    }

    const onMouseOut = (e) => {
        e.currentTarget.style.backgroundColor = appTheme ? '#211f30' : '#a8a6b8';
        e.currentTarget.style.color = appTheme ? '#a8a6b8' : '#211f30';
    }

    return (
        <div style={{
            height: '78vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem',
            background: appTheme? 'linear-gradient(to right, #211f30, #a8a6b8, #211f30)' : 'linear-gradient(to right, #a8a6b8, #211f30, #a8a6b8)',
            // color: '#fff',
            color: appTheme? '#211f30' : '#a8a6b8',
            transition: 'background 3s ease, color 1.5s ease',
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋 Welcome to ChatVerse!</h1>
            <p style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '2rem' }}>
                This is a real-time chat platform built with 💜 using React, Node.js, and Socket.IO.
                Connect with friends, send instant messages, and enjoy a smooth chatting experience.
            </p>
            <button
                onClick={handleJoinChatVerse}
                style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    backgroundColor: appTheme? '#211f30' : '#a8a6b8',
                    color: appTheme? '#a8a6b8' : '#211f30',
                    border: 'none',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    transition: 'all 1s ease',
                }}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
            >
                Join ChatVerse
            </button>
        </div>
    );
};

export default WelcomePage;

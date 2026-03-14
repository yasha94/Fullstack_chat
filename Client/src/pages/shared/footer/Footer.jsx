import { useContext, useState } from 'react';
import AppThemeContext from '../../../context/AppThemeProvider';

import { faCheck, faXmark, faCircleInfo, faWandMagic} from '@fortawesome/free-solid-svg-icons';
import {faCircleCheck, faLightbulb} from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Footer = () => {
    const {appTheme, toggleTheme} = useContext(AppThemeContext);
    const [ animation, setAnimation] = useState(false);

    return (
        <div title={appTheme ? 'Light mode' : 'Dark mode'} style={{ backgroundColor: appTheme? '#211f30 ': '#a8a6b8 ', opacity: '0.5', borderRadius: '5px', boxShadow: '5px red', width: '100%', padding: '15px 15px', alignItems: 'right', justifyContent: 'right', display: 'flex', borderTop: appTheme? '0.5px solid #a8a6b8': '0.5px solid #211f30',
            }}>
            <button style={{backgroundColor: 'transparent', width: 'fit-content', height: 'fit-content', border: 'none', borderRadius: '50%'}} onClick={toggleTheme} onMouseOver={() => setAnimation(true)} onMouseLeave={() => setAnimation(false)}><FontAwesomeIcon icon={faLightbulb} size='2xl' beat={animation} style={{color: appTheme? "FFD43B": '#333'}} /></button>
        </div>
    );
};

export default Footer;
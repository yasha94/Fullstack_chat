import { createContext, useState } from 'react'
import App from '../App';

const AppThemeContext = createContext({});

export const AppThemeProvider = ({children}) => {
    const [appTheme, setAppTheme] = useState(true);

    const toggleTheme = () => {
        // setAppTheme((prevTheme) => ({
        //     ...prevTheme,
        //     isDarkMode: !prevTheme.isDarkMode
        // }));
        setAppTheme( prevAppTheme => !prevAppTheme);
    }

    return (
        <AppThemeContext.Provider value={{appTheme, toggleTheme}}>
            {children}
        </AppThemeContext.Provider>
    )
}

export default AppThemeContext;
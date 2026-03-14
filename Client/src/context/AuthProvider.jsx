import { createContext, useState } from 'react'
import { useLocation } from 'react-router-dom';

const authContext = createContext({});

export const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState({});
    const location = useLocation();

    const checkAuth = (res) => {
        if (res?.status === 401 && res.data?.errorMsg?.includes('Authentication error')) {
            setAuth({
                user: null,
                accessToken: null,
                isAuthenticated: false,
            });
        } else {
            setAuth({
                user: res.data?.user,
                accessToken: res.data?.accessToken,
                isAuthenticated: true,
            });
        }
    };

    return (
        <authContext.Provider value={{auth, setAuth, checkAuth, location}}> 
            {children}
        </authContext.Provider>
    )
}

export default authContext;
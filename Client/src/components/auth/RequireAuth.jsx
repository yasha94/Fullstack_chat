import { useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const RequireAuth = () => {
    const { auth } = useAuth();
    const location = useLocation();

    return (
        auth?.isAuthenticated
            ? <Outlet/> 
            : <Navigate to={'/login'} state={{ from: location }} replace={true}/>
    )
}

export default RequireAuth;
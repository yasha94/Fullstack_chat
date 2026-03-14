import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/user/Register';
import HomePage from '../pages/homePage/HomePage';
import WelcomePage from '../pages/welcomePage/WelcomePage';
import RequireAuth from '../components/auth/RequireAuth';
import useAuth from '../hooks/useAuth';
import Users from '../components/users/users/Users';
import User from '../components/users/user/User';
import FriendRequests from '../pages/friendRequests/friendRequests';
import Friends from '../components/friends/Friends';


const MainRoutes = () => {
    const {auth} = useAuth();
    console.log(`mainrouts auth`, auth);
    return (
        <Routes>
            <Route path="/" element={auth.isAuthenticated ? <HomePage/> : <WelcomePage/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>


            <Route element={<RequireAuth/>}>
                <Route path="/users/:userId" element={<User/>}/>
                <Route path='/Friend-requests' element={<FriendRequests/>}/>
                <Route path="/users" element={<Users/>}/>
                <Route path='/friends' element={<Friends/>}/>            
            </Route>
        </Routes>
    )
}

export default MainRoutes;


/**
 * EXAMPLE USAGE:
 * return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />}>
        <Route path="*" element={<ContactRoutes />} />
      </Route>
      <Route path="/products" element={<Products />} />
      <Route path="/product/*" element={<ProductRoutes />} />
      <Route path="/user" element={<User />} />
      <Route path="/user-data" element={<UserData />} />
    </Routes>
 * );
 */

/**
 *    const ContactRoutes = () => {
        return (
            <Routes>
            <Route path="email" element={<ContactEmail />} />
            <Route path="phone" element={<ContactPhone />} />
            </Routes>
          );
 *    };
 */

        
/**
 *    const ProductRoutes = () => {
        return (
            <Routes>
            <Route path=":id/:name" element={<Product />} />
            </Routes>
          );
 *    };
 */
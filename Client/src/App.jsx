import './App.css'
import MainRoutes from './routes/MainRoutes';
import NavBar from './pages/shared/navBar/NavBar';
import Footer from './pages/shared/footer/Footer';
import useAppTheme from './hooks/useAppTheme';
import { listenToNewFriendRequests } from './services/socketServices/socketFriendRequests/friendRequestsSocketListeners'; 


function App() {
  const {appTheme} = useAppTheme();
  const themeClassName = appTheme ? "darkThemeClass" : 'lightThemeClass';
  listenToNewFriendRequests();
  return (
    <div className={`main-chat-div ${themeClassName}` } style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '100vh', width: '100%'}}> 
      <NavBar/>
      <div style={{paddingTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: '100%', marginTop: '27px'}}>
        <MainRoutes/>
      </div>
      <Footer/>
    </div>
  )
}

export default App

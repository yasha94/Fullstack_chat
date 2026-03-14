import { useState } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import FriendRequestsNotifications from '../../../components/notifications/friendRequestsNotifications/friendRequestsNotifications';
import useAuth from '../../../hooks/useAuth';
import useAppTheme from '../../../hooks/useAppTheme';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

import './NavBar.css';

import SearchUsers from '../../../components/users/searchUsers/SearchUsers';

const NavBar = () => {
    const [ openUserMenu, setOpenUserMenu] = useState(false);
    const navigate = useNavigate();
    const { appTheme} = useAppTheme();
    const {auth} = useAuth();
    const imageUrl = `data:${auth.user?.profilePictureMimeType};base64,${auth.user?.profilePicture}`;
    console.log(`imageUrl`, auth);

  const isDark = !!appTheme;
  const colors = {
    bg: isDark ? "#211f30" : "#a8a6b8",
    fg: isDark ? "#a8a6b8" : "#211f30",
    bgHover: isDark ? "#2b2742" : "#b8b6c6",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  };

  const handleLogout = async () => {
    try {
      // optional: await api.post('/auth/logout')
      onLogout?.(); // clear tokens/context
      navigate("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const userMenuStyle = {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    top: "72%", // right under the form
    right: 156,
    marginTop: "2px",
    marginLeft: "16px",
    width: "fit-content",
    maxWidth: "360px",
    maxHeight: "200px",
    overflowY: "auto",
    backgroundColor: appTheme ? "#1b1b1f" : "#ffffff",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
    zIndex: 1000,
    padding: "4px 6px",
  };

  return (
    <header
      className="navBar"
      style={{
        width: "100%",
        position: "fixed",
        top: 0,
        zIndex: 100,
        backgroundColor: colors.bg,
        color: colors.fg,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <nav className="navInner" aria-label="Primary">
        {auth?.isAuthenticated ? (
          <>
            <div className="left">
              <Link to="/" className="brand" aria-label="Home">
                ChatVerse
              </Link>
            </div>

            <div className="center">
              <SearchUsers />
            </div>

            <div className="right">    
              <FriendRequestsNotifications/>                

              {/* <Link
                to={`/users/${auth.user?.userName}`}
                className="avatarWrap"
                aria-label={`${auth.user?.userName} profile`}
                title={`${auth.user?.userName} profile`}
              >              
              </Link> */}
              {auth.user?.profilePicture ? 
              <Avatar src={imageUrl} sx={{marginRight: 0, width: 38, height: 38, cursor: "pointer"}} onClick={() => setOpenUserMenu(!openUserMenu)}/> 
              : 
              <Avatar 
                onClick={() => setOpenUserMenu(!openUserMenu)} 
                sx={{marginRight: 0, width: 35, height: 35, backgroundColor: appTheme ? '#a8a6b8' : '#2c2a3c', color: appTheme ? '#2c2a3c' : '#a8a6b8', cursor: "pointer"}} 
                aria-label={`${auth.user?.userName} profile`}
                title={`${auth.user?.userName} profile`}
              />}

              {openUserMenu && 
              <div style={userMenuStyle}>
                <button
                  className="btn"
                  style={{ backgroundColor: colors.fg, color: colors.bg, width: "100%", borderBottom: `1px solid black`, borderRadius: 0 }}
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  User profile
                </button>
                <button
                  className="btn"
                  style={{ backgroundColor: colors.fg, color: colors.bg, width: "100%", borderBottom: `1px solid black`, borderRadius: 0 }}
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  TODO USER SETTINGS
                </button>
                <button
                  className="btn"
                  style={{ backgroundColor: colors.fg, color: colors.bg, width: "100%", borderRadius: 0 }}
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
              }
            </div>
          </>
        ) : (
          <>
            <div className="left">
              <Link to="/" className="brand" aria-label="Home">
                ChatVerse
              </Link>
            </div>

            <div className="right">
              <Link
                to="/login"
                className="btn ghost"
                style={{
                  color: colors.fg,
                  borderColor: colors.fg,
                }}
              >
                Login
              </Link>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}

export default NavBar;
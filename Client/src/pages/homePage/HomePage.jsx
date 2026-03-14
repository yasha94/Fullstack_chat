import { useState } from "react";
import Friends from "../../components/friends/Friends";
import Chat from "../../components/chat/Chat";
import RecentChats from "../../components/chat/RecentChats";
import Badge from '@mui/material/Badge';
import MessageIcon from '@mui/icons-material/Message';
import GroupIcon from '@mui/icons-material/Group';
import Avatar from "@mui/material/Avatar";
import useChats from "../../hooks/useChats";
import useAppTheme from "../../hooks/useAppTheme";
import useAuth from "../../hooks/useAuth";

const HomePage = () => {
    const [showFriends, setShowFriends] = useState(false);
    const {appTheme} = useAppTheme();
    const {chat, setChat, friend, setFriend} = useChats();
    const {auth} = useAuth();

    const isDark = !!appTheme;
    const colors = {
        bg: isDark ? "#211f30" : "#a8a6b8",
        fg: isDark ? "#a8a6b8" : "#211f30",
        bgHover: isDark ? "#2b2742" : "#b8b6c6",
        border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    };

    const statusColor =
        friend?.status === "online"
        ? "#22c55e"
        : friend?.status === "away"
        ? "#eab308"
        : "#6b7280";

    const statusDotStyle = {
        width: "9px",
        height: "9px",
        borderRadius: "999px",
        backgroundColor: statusColor,
    };


    return (
        <div style={{
            width: '100%',
        }}>
            {/*inner nav bars*/}
            <div style={{
                    display: 'flex',
                }}
            >
                {/*left*/}
                <div style={{flex: 1, borderRight: `1px solid ${colors.border}`, display: 'flex', boxShadow: `1px 0px 2px ${colors.border}`}}> 
                    <div style={{width: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around', fontSize: '20px', fontWeight: 'bold', padding: '7px 0px'}}>
                        <Badge title="Friends" style={{cursor: 'pointer'}} onClick={() => setShowFriends(true)}>
                            <GroupIcon sx={{height: '30px', width: '30px', color: showFriends && "#c0a8e1" }}/>
                        </Badge>
                        <Badge title="Messages" style={{cursor: 'pointer'}}  onClick={() => {
                            setShowFriends(false);
                            }}>
                            <MessageIcon sx={{height: '30px', width: '30px', color: !showFriends && "#c0a8e1" }}/>
                        </Badge>
                    </div>
                </div>
                {/*right*/}
                <div style={{flex: 3, display: 'flex'}}>
                    {chat && friend && <div style={{width: '100%', borderBottom: chat? `1px solid ${colors.border}` : 0, boxShadow: chat ? `0 1px 2px ${colors.border}` : 0,  display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '7px 15px'}}>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            {friend?.profilePictureMimeType ? 
                            <Avatar 
                                src={
                                `data:${friend.profilePictureMimeType};base64,${friend.profilePicture}`
                                }
                                sx={{
                                width: 40,
                                height: 40,
                                fontSize: "0.9rem",
                                }}
                            />
                            :
                            <Avatar                                 
                                sx={{
                                width: 40,
                                height: 40,
                                fontSize: "0.9rem",
                                }}
                            />
                            }
                            <div style={{paddingLeft: 10}}>
                                <div >
                                    {friend.userName || friend.firstName || ""}
                                </div>
                                {friend?.status && (
                                <div style={{fontSize: '12px', color: colors.fg}}>
                                    {friend.status}
                                    <span style={statusDotStyle} />
                                </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <button onClick={() => {
                                setChat(null)
                                setFriend(null)
                                }
                            }>X</button>
                        </div>
                    </div>}           
                </div>
            </div>          
            <div style={{
                    display: 'flex',
                }}
            >
                {/*left*/}
                <div style={{flex: 1, flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', borderRight: `1px solid ${colors.border}`, boxShadow: `1px 0 2px ${colors.border}`, height: '69vh', display: 'flex', flexDirection: 'column', zIndex: 100}}> 
                    {showFriends ? <Friends/> : <RecentChats/>}
                </div>
                {/*right*/}
                <div style={{flex: 3, display: 'flex', flexDirection: 'column'}}>
                    <Chat />
                </div>  
            </div>
        </div>
    );
};

export default HomePage;



// return (
//     <div style={{
//             height: '100vh',
//             display: 'flex',
//             alignItems: 'flex-start',
//             width: '100%',
//         }}
//     >
//         <div style={{flex: 1, justifySelf: 'auto', borderRight: '1px solid gray', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start'}}> 
//             <div style={{width: '100%', height: '14%', borderBottom: '1px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold'}}>
//                 Mini menu
//             </div>
//             <Friends/>
//         </div>
//         <div style={{flex: 3, justifySelf: 'auto', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', margin: '50px 0px', padding: '10px 0px'}}>
//             <div style={{width: '100%', height: '30.5px', borderBottom: '1px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold'}}>
//                 Mini menu
//             </div>
//             <div style={{height: '75%'}}>chat component will appear here</div>
//             <textarea placeholder="Start a new conversation..." style={{width: '100%', borderRadius: '10px', padding: '10px', fontSize: '16px', border: '1px solid gray', resize: 'none'}} />
//         </div>  
//     </div>
// );
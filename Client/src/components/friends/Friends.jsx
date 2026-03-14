import { useEffect, useState, useCallback } from "react";
import useAuth from "../../hooks/useAuth";
import { getById } from "../../services/crud/crud";
import useAppTheme from "../../hooks/useAppTheme";
import Avatar from '@mui/material/Avatar';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from "react-router-dom";

import InfiniteScroll from 'react-infinite-scroll-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner} from '@fortawesome/free-solid-svg-icons';


const FRIENDS_URL = 'users/friends';

const Friends = () => {
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [cursor, setCursor] = useState(null);    // ISO date string
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const { auth } = useAuth();
    const { appTheme } = useAppTheme();

    useEffect(() => {
        const loadInitialFriends = async () => {
          if (loading) return;
          setLoading(true);
          try {
            const params = { limit: 10 };
            const response = await getById(FRIENDS_URL, auth?.user?._id, params, auth?.accessToken);
            if (response?.data) {
              const { friends, hasMore, nextCursor } = response.data;
      
              console.log('Friends data:', response.data);
      
              setFriends(friends);
              setHasMore(hasMore);
              setCursor(nextCursor); // <-- IMPORTANT
            }
          } catch (err) {
            console.error('initial friends fetch error', err);
            setHasMore(false);
          }
          finally {
            setLoading(false);
          }
        };
      
        loadInitialFriends();
      }, [auth]);


    const fetchFriends = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
    
        try {
            const params = { limit: 10 };
            if (cursor) params.cursor = cursor;

            const response = await getById(FRIENDS_URL, auth?.user?._id, params, auth?.accessToken);
            const { friends, hasMore, nextCursor } = response.data;

            setFriends(prev => [...prev, ...friends]);
            setHasMore(hasMore);
            setCursor(nextCursor);
        } catch (err) {
            console.error('fetchFriends error', err);
            // in a real UI you might want to show an error and/or stop infinite scroll
            setHasMore(false);
        } finally {            
            setLoading(false);
        }
      }, [cursor, hasMore, loading]);


    return (
    <div
      id="friendsScroll"
      style={{ height: '70vh', overflowY: 'auto', overflowX: 'hidden' }}
    >

      <InfiniteScroll
        dataLength={friends.length}
        next={fetchFriends} // called on scroll down
        hasMore={hasMore}
        loader={
          <h4 style={{ textAlign: 'center' }}>
            <FontAwesomeIcon icon={faSpinner} spinPulse size="xl"/>
          </h4>
          }
        scrollThreshold={0.8}               // when to trigger next()
        scrollableTarget="friendsScroll"
      >

            <table style={{ width: '99.5%', borderCollapse: 'separate', borderSpacing: '0px 2px'}}>
                <tbody>
                    {Array.isArray(friends) && friends.map((friend) => (
                        <tr
                        key={friend._id}
                        style={{
                        backgroundColor: appTheme ? '#2c2a3c' : '#a8a6b8',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                        borderRadius: '8px',
                        overflowX: 'hidden',
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer',
                        }}
                        // onClick={() => navigate(`/users/${friend.userName}`)}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                    >
                        <td style={{ padding: '12px', display: 'flex', alignItems: 'center', width: '48%' }}>
                        {friend.profilePicture ? 
                            <Avatar alt={friend.userName} src={`data:${friend.profilePictureMimeType};base64,${friend.profilePicture}`} sx={{marginRight: 0, width: 70, height: 70}}/> 
                            :
                            <Avatar sx={{marginRight: 4, width: 70, height: 70, backgroundColor: appTheme ? '#a8a6b8' : '#2c2a3c', color: appTheme ? '#2c2a3c' : '#a8a6b8'}}>{friend.firstName.charAt(0).toUpperCase() || ''}{friend.lastName.charAt(0).toUpperCase() || ''}</Avatar>
                        }
                        </td>
                        <td onClick={() => navigate(`/users/${friend.userName}`, { state: { user: friend, areFriends: 3 } })} style={{padding: '0px 10px'}}>
                            <div>
                                <div style={{fontWeight: 'bold'}}>{friend.userName}</div>
                                <div>{friend.firstName} {friend.lastName}</div>
                            </div>
                        </td>
                        <td>
                            <MenuIcon 
                            style={{cursor: 'pointer'}}/>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
      </InfiniteScroll>
    </div>
    );
};

export default Friends;
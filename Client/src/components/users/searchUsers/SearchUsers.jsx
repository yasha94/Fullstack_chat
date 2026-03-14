import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useAppTheme from "../../../hooks/useAppTheme";
import useAuth from "../../../hooks/useAuth";

import { getAll } from "../../../services/crud/crud";

import Form from "../../shared/form/Form";
import Button from "../../shared/Button";

import Avatar from "@mui/material/Avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner} from '@fortawesome/free-solid-svg-icons';

import Autocomplete from "@mui/material/Autocomplete";

const USERS_URL = "/users";

const SearchUsers = () => {
    const [userInput, setUserInput] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const navigate = useNavigate();
    const { appTheme } = useAppTheme();
    const { auth } = useAuth();

    const bgColor = appTheme ? "#211f30" : "#f5f5f5";
    const textColor = appTheme ? "#f5f5f5" : "#211f30";

    const handleChange = (e) => {
        setError("");
        setUserInput(e.target.value);
    };

    const handleOnBlur = () => {
        // Keeping it simple – no extra blur logic for now
    };

    // === Search as you type (debounced, max 5 results) ===
    useEffect(() => {
    const query = userInput.trim();

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        const timerId = setTimeout(async () => {
            try {
                const response = await getAll(USERS_URL, query, auth?.accessToken);
                const users = response?.data || [];
                setSearchResults(users.slice(0, 5));
            } catch (err) {
                console.error("Live search users failed:", err);
                setSearchResults([]);
            }
        }, 300); // debounce

        return () => clearTimeout(timerId);
    }, [userInput, auth?.accessToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const query = userInput.trim();

        // ===== Basic validations =====
        if (!query) {
            setError("Please enter something to search.");
            return;
        }

        if (query.length < 2) {
            setError("Please type at least 2 characters.");
            return;
        }

        try {
            setLoading(true);
            const response = await getAll(USERS_URL, query, auth?.accessToken);
            const users = response?.data || [];

            if (!Array.isArray(users) || users.length === 0) {
            setError("No users found for this search.");
            return;
            }

            setUserInput("");
            
            navigate("/users", { state: { stateUseres: users } });
            setSearchResults([]);
        } catch (err) {
            console.error("Search users failed:", err);
            if(err.response?.data?.errorMsg){
                setError(err.response.data.errorMsg);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const formFields = [
        {
        type: "search",
        placeholder: "Search users",
        id: "search-users",
        name: "searchUsers",
        showLabel: false,
        value: userInput,
        style: {
            backgroundColor: bgColor,
            color: textColor,
            padding: "6px 10px",
            borderRadius: "4px 0 0 4px",
            border: `0.2px solid ${textColor}`,
            outline: "none",
            minWidth: "180px",
            fontSize: "14px",
            },
        },
        {
        type: "submit",
        label: "Search",
        placeholder: "Search users",
        id: "search-form",
        name: "searchForm",
        component: Button,
        showLabel: false,
        style: {
            backgroundColor: textColor,
            fontSize: "12px",
            color: bgColor,
            padding: "6px 12px",
            borderRadius: "0 4px 4px 0",
            border: `0.2px solid ${textColor}`,
            borderLeft: "none",
            cursor: "pointer",
            },
        },
    ];

    // Outer container (kept modest)
    const containerStyle = {
        position: "relative", // important for floating suggestions
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        margin: "0 8px",
        fontSize: "14px",
    };

    // Form itself (no layout changes in navbar)
    const formStyle = {
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "flex-start",
        border: "none",
    };

    const errorStyle = {
        fontSize: "12px",
        color: "#ff4b4b",
        // margin: "4px 0 0 2px",
        position: "absolute",
        top: "100%", // right under the form
        left: 0,
        marginTop: "2px",
        marginLeft: "16px",
        minWidth: "fit-content",
        maxWidth: "260px",
        backgroundColor: appTheme ? "#1b1b1f" : "#ffffff",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        zIndex: 1000,
        padding: "4px 6px",
    };

    const loadingStyle = {
        fontSize: "12px",
        color: textColor,
        margin: "4px 0 0 2px",
        position: "absolute",
        top: "100%", // right under the form
        left: 0,
        zIndex: 1000,
    };

    // Floating suggestions box
    const suggestionsBoxStyle = {
        position: "absolute",
        // display: "flex",
        // flexDirection: "row",
        // alignItems: "flex-start",
        top: "100%", // right under the form
        left: 0,
        marginTop: "2px",
        marginLeft: "16px",
        width: "100%",
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

    const suggestionsListStyle = {
        margin: 0,
        padding: 0,
        listStyle: "none",
    };

    const suggestionItemStyle = {
        padding: "2px 0",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        width: "100%",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
    };

    return (
        <div style={containerStyle}>
            <Form
                formData={formFields}
                onChange={handleChange}
                onBlur={handleOnBlur}
                onClick={handleSubmit}
                method="get"
                style={formStyle}
                formAutocomplete="off"
            />

            {loading && <p style={loadingStyle}>Searching...<FontAwesomeIcon icon={faSpinner} spinPulse size="xl"/></p>}
            {error && <p style={errorStyle}>{error}</p>}

            {searchResults.length > 0 && (
            <div style={suggestionsBoxStyle}>
                <ul style={suggestionsListStyle}>
                    {searchResults.map((user) => (
                        <li 
                        key={user._id || user.id} 
                        style={suggestionItemStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        }}
                        onMouseLeave={(e) => {
                           e.currentTarget.style.background = "transparent";
                        }}
                        >
                            {user.profilePicture ? 
                                <Avatar alt={user.userName} src={`data:${user.profilePictureMimeType};base64,${user.profilePicture}`} sx={{marginRight: 5, width: 45, height: 45}} title={`${user.userName}`}/> 
                                :
                                <Avatar title={`${user.userName}`} sx={{marginRight: 5, width: 45, height: 45, backgroundColor: appTheme ? '#a8a6b8' : '#2c2a3c', color: appTheme ? '#2c2a3c' : '#a8a6b8'}}>{user.firstName.charAt(0).toUpperCase() || ''}{user.lastName.charAt(0).toUpperCase() || ''}</Avatar>
                            }
                            {user.userName || user.email || "User"}
                        </li>
                    ))}
                </ul>
            </div>
        )}
        </div>
    );
};

export default SearchUsers;

import serverAxios from "../../api/serverAxios";

const login = async (userData) => {
    const LOGIN_URL = '/auth/login';
    try {
        const response = await serverAxios.post(LOGIN_URL, userData);
        console.log(`response:::::::::::::`, response);
        return response;
    }
    catch (err) {
        return {errorMsg: err.response?.data?.errorMsg || "Login failed due to unknown error."};
    }
};

export default login;
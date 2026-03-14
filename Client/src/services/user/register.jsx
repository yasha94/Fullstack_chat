import serverAxios from "../../api/serverAxios";

const register = async (userData) => {
    const REGISTER_URL = '/users/register';
    console.log(`userData in register`, userData);
    try {
        const {data} = await serverAxios.post(REGISTER_URL, userData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data;
    }
    catch (err) {
        return {errorMsg: err.response?.data?.errorMsg || "Registration failed due to unknown error."};
    }
};

export default register;
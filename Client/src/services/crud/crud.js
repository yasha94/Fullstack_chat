import serverAxios from "../../api/serverAxios";

const getAll = (url, params, accessToken) => serverAxios.get(`${url}`, 
    {
        params: {
            params,
        },
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }
);

const getById = (url, id, params, accessToken) => serverAxios.get(`${url}/${id}`, 
    {
        params: {
            params,
        },
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    
const addItem = (url, obj, accessToken) => serverAxios.post(url, obj, {
    withCredentials: true,
    headers: {
        Authorization: `Bearer ${accessToken}`
    }
});

const updateItem = (url, id, obj) => serverAxios.put(`${url}/${id}`, obj);

const deleteItem = (url, id) => serverAxios.delete(`${url}/${id}`);

export { getAll, getById, addItem, updateItem, deleteItem };

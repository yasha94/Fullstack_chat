import { useContext } from "react";
import ChatsContext from "../context/ChatsProvider";

const useChats = () => {
    return useContext(ChatsContext);
}

export default useChats;
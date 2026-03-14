import { useContext } from "react";
import socketContext from "../context/SocketProvider";

const useSocket = () => {
    return useContext(socketContext);
}

export default useSocket;
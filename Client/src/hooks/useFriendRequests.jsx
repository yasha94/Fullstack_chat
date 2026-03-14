import { useContext } from "react";
import friendRequestsContext from "../context/friendRequestsProvider";

const useFrindRequests = () => {
    return useContext(friendRequestsContext);
}

export default useFrindRequests;
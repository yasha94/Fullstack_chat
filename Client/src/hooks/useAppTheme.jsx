import { useContext } from "react";
import appThemeContext from "../context/AppThemeProvider";

const useAppTheme = () => {
    return useContext(appThemeContext)
}

export default useAppTheme;
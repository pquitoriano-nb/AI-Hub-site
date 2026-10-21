// Shared app state (data, editor mode, toast, navigation) available to every page.
import { createContext, useContext } from "../../vendor/react-bundle.js";

export const HubContext = createContext(null);
export const useHub = () => useContext(HubContext);

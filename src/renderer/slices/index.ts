import { combineReducers } from "@reduxjs/toolkit";
import AppStateSlice from "./AppStateSlice";

const rootReducer = combineReducers({
    // AppStateSlice
    appState: AppStateSlice.reducer
});

export default rootReducer;
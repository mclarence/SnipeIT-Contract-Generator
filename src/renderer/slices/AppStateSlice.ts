import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppState } from "renderer/models/AppState";

const initialState: AppState = {
    snipeItUrl: '',
    snipeItAccessToken: '',
    snipeItLoggedInUser: '',
    templateLocation: '',
    sslVerification: true,
    connectionStatus: 'disconnected',
    connectionError: '',
    snackBar: {
        open: false,
        message: '',
        severity: 'success'
    }
}

const AppStateSlice = createSlice({
    name: 'appState',
    initialState,
    reducers: {
        setSnipeItUrl: (state, action: PayloadAction<string>) => {
            state.snipeItUrl = action.payload;
        },
        setSnipeItAccessToken: (state, action: PayloadAction<string>) => {
            state.snipeItAccessToken = action.payload;
        },
        setTemplateLocation: (state, action: PayloadAction<string>) => {
            state.templateLocation = action.payload;
        },
        setSslVerification: (state, action: PayloadAction<boolean>) => {
            state.sslVerification = action.payload;
        },
        setSnackBar: (state, action: PayloadAction<{ open: boolean, message: string, severity: 'success' | 'info' | 'warning' | 'error' }>) => {
            state.snackBar = action.payload;
        },
        closeSnackBar: (state) => {
            state.snackBar.open = false;
        },
        setConnectionStatus: (state, action: PayloadAction<'connected' | 'disconnected' | 'connecting' | 'failed'>) => {
            state.connectionStatus = action.payload;
        },
        setConnectionError: (state, action: PayloadAction<string>) => {
            state.connectionError = action.payload;
        },
        setLoggedInUser: (state, action: PayloadAction<string>) => {
            state.snipeItLoggedInUser = action.payload;
        }
    }
});

export default AppStateSlice
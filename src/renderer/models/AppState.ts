export interface AppState {
    snipeItUrl: string;
    snipeItAccessToken: string;
    templateLocation: string;
    sslVerification: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'failed';
    connectionError: string;
    snipeItLoggedInUser: string;
    processingSomething: boolean;
    appVersion: string;
    snackBar: {
        open: boolean;
        message: string;
        severity: 'success' | 'info' | 'warning' | 'error';
    };
}
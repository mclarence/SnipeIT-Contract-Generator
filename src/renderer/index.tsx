import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import App from './App';
import rootReducer from './slices';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

const store = configureStore({
  reducer: rootReducer,
});

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => store.dispatch;

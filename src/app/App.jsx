import AppRouter from './router';
import FirebaseSetupScreen from '../components/FirebaseSetupScreen';
import { isFirebaseConfigured } from '../config/firebase-config';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import ToastViewport from '../components/ToastViewport';

function App() {
  if (!isFirebaseConfigured) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <FirebaseSetupScreen />
          <ToastViewport />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
          <ToastViewport />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

// Components
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { PasswordResetForm } from './components/PasswordResetForm';
export { AuthGuard } from './components/AuthGuard';

// Hooks
export { useAuth } from './hooks/useAuth';

// Context & Providers
export { 
  AuthProvider, 
  useAuthContext,
  useAuthUser,
  useAuthLoading,
  useUserRole,
  useIsAuthenticated,
  useIsCustomer,
  useIsBarber,
  useIsStaff,
  useCanBookAppointments,
  useCanAccessBarberPanel
} from './contexts/AuthContext';

// Stores
export { useAuthStore } from './stores/authStore';

// Services
export { AuthService } from './services/authService';

// Types
export type {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  UpdatePasswordData,
  AuthFormProps,
  LoginFormProps,
  RegisterFormProps,
  ForgotPasswordFormProps,
  AuthGuardProps,
  AuthResponse,
  SessionData,
  AuthAction,
  AuthContextValue,
} from './types/auth.types';
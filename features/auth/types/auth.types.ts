export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'customer' | 'barber' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  error?: string;
  onToggleForm?: () => void;
}

export interface LoginFormProps extends AuthFormProps {
  onSubmit: (data: LoginCredentials) => void;
  showRegisterLink?: boolean;
  showForgotPassword?: boolean;
}

export interface RegisterFormProps extends AuthFormProps {
  onSubmit: (data: RegisterData) => void;
  showLoginLink?: boolean;
}

export interface ForgotPasswordFormProps extends AuthFormProps {
  onSubmit: (data: ResetPasswordData) => void;
  showLoginLink?: boolean;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: User['role'];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

export interface SessionData {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export type AuthAction = 
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' };

export interface AuthContextValue {
  // State
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<boolean>;
  updatePassword: (data: UpdatePasswordData) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  clearError: () => void;

  // Role checking
  hasRole: (role: User['role']) => boolean;
  isRole: (role: User['role']) => boolean;
}
import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/authService';
import { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  ResetPasswordData, 
  UpdatePasswordData 
} from '../types/auth.types';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const user = await AuthService.getCurrentUser();
        
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: !!user,
          loading: false,
          error: null,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Kimlik doğrulama hatası',
        }));
      }
    }

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.login(credentials);
      
      if (result.success && result.user) {
        setState(prev => ({
          ...prev,
          user: result.user!,
          isAuthenticated: true,
          loading: false,
          error: null,
        }));
        
        return true;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: AuthService.getErrorMessage(result.error || 'Giriş başarısız'),
        }));
        
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Giriş sırasında hata oluştu',
      }));
      
      return false;
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.register(data);
      
      if (result.success && result.user) {
        setState(prev => ({
          ...prev,
          user: result.user!,
          isAuthenticated: true,
          loading: false,
          error: null,
        }));
        
        return true;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: AuthService.getErrorMessage(result.error || 'Kayıt başarısız'),
        }));
        
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Kayıt sırasında hata oluştu',
      }));
      
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await AuthService.logout();
      
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.resetPassword(data);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.success ? null : AuthService.getErrorMessage(result.error || 'Şifre sıfırlama başarısız'),
      }));
      
      return result.success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Şifre sıfırlama sırasında hata oluştu',
      }));
      
      return false;
    }
  }, []);

  const updatePassword = useCallback(async (data: UpdatePasswordData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.updatePassword(data);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.success ? null : AuthService.getErrorMessage(result.error || 'Şifre güncelleme başarısız'),
      }));
      
      return result.success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Şifre güncelleme sırasında hata oluştu',
      }));
      
      return false;
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const user = await AuthService.getCurrentUser();
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: !!user,
      }));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const hasRole = useCallback((role: User['role']): boolean => {
    if (!state.user) return false;
    
    // Admin has access to everything
    if (state.user.role === 'admin') return true;
    
    // Barber has access to customer features
    if (role === 'customer' && state.user.role === 'barber') return true;
    
    return state.user.role === role;
  }, [state.user]);

  const isRole = useCallback((role: User['role']): boolean => {
    return state.user?.role === role;
  }, [state.user]);

  return {
    // State
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,

    // Actions
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    refreshUser,
    clearError,

    // Role checking
    hasRole,
    isRole,
  };
}
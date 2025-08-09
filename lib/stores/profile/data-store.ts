import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  totalAppointments?: number;
}

interface ProfileDataState {
  // Core State
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Cache settings
  cacheValidDuration: number;
  
  // Actions
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchProfile: (forceRefresh?: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Computed
  isDataStale: () => boolean;
  getFullName: () => string;
  
  // Cache Management
  invalidateCache: () => void;
  clearCache: () => void;
}

export const useProfileDataStore = create<ProfileDataState>()(
  devtools(
    (set, get) => ({
      // Initial State
      profile: null,
      loading: false,
      error: null,
      lastFetched: null,
      
      cacheValidDuration: 10 * 60 * 1000, // 10 minutes
      
      // Basic Actions
      setProfile: (profile) => set({ 
        profile, 
        lastFetched: Date.now(),
        error: null 
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      // Fetch Profile
      fetchProfile: async (forceRefresh = false) => {
        const { lastFetched, isDataStale } = get();
        
        if (!forceRefresh && lastFetched && !isDataStale()) {
          return;
        }
        
        set({ loading: true, error: null });
        
        try {
          const response = await fetch("/api/profile");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          if (result.success) {
            get().setProfile(result.data);
          } else {
            throw new Error(result.message || "Failed to fetch profile");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({ error: errorMessage });
          console.error("Failed to fetch profile:", error);
        } finally {
          set({ loading: false });
        }
      },
      
      // Refresh Profile
      refreshProfile: async () => {
        await get().fetchProfile(true);
      },
      
      // Computed Functions
      isDataStale: () => {
        const { lastFetched, cacheValidDuration } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > cacheValidDuration;
      },
      
      getFullName: () => {
        const { profile } = get();
        if (!profile) return "";
        
        const firstName = profile.firstName || "";
        const lastName = profile.lastName || "";
        return `${firstName} ${lastName}`.trim();
      },
      
      // Cache Management
      invalidateCache: () => set({ lastFetched: null }),
      
      clearCache: () => set({
        profile: null,
        lastFetched: null,
        error: null,
      }),
    }),
    {
      name: "profile-data-store",
    }
  )
);

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

interface User {
  id?: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated from localStorage
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const userEmail = localStorage.getItem('userEmail');
      
      if (isAuthenticated === 'true' && userEmail) {
        const userData: User = { 
          email: userEmail,
          id: userEmail === 'admin@vaishnavi.com' ? 'admin' : 'user'
        };
        setUser(userData);
        setSession({ user: userData });
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    };

    // Check auth on mount
    checkAuth();

    // Listen for storage changes (when login happens)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    setUser(null);
    setSession(null);
    
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
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

// Helper function to generate a proper UUID v4 from email for localStorage users
const generateUserUUID = (email: string): string => {
  // Create a deterministic seed from email
  let seed = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    seed = ((seed << 5) - seed) + char;
    seed = seed & seed; // Convert to 32-bit integer
  }
  
  // Use the seed to generate a proper UUID v4
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  const hex = () => Math.floor(random() * 16).toString(16);
  
  // Generate UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return [
    Array(8).fill(0).map(() => hex()).join(''),
    Array(4).fill(0).map(() => hex()).join(''),
    '4' + Array(3).fill(0).map(() => hex()).join(''),
    (8 + Math.floor(random() * 4)).toString(16) + Array(3).fill(0).map(() => hex()).join(''),
    Array(12).fill(0).map(() => hex()).join('')
  ].join('-');
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkLocalStorageAuth = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userEmail = localStorage.getItem('userEmail');
    
    if (isAuthenticated === 'true' && userEmail) {
      // Generate a proper UUID for the user based on their email
      const userId = userEmail === 'admin@vaishnavi.com' 
        ? generateUserUUID('admin@vaishnavi.com')
        : generateUserUUID(userEmail);
        
      const userData: User = { 
        email: userEmail,
        id: userId
      };
      setUser(userData);
      setSession({ user: userData });
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession?.user) {
        const userData: User = {
          id: currentSession.user.id,
          email: currentSession.user.email || ''
        };
        setUser(userData);
        setSession({ user: userData });
      } else {
        // Check localStorage as fallback
        checkLocalStorageAuth();
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession);
        
        if (currentSession?.user) {
          const userData: User = {
            id: currentSession.user.id,
            email: currentSession.user.email || ''
          };
          setUser(userData);
          setSession({ user: userData });
        } else {
          // Check localStorage as fallback
          if (!checkLocalStorageAuth()) {
            setUser(null);
            setSession(null);
          }
        }
        setLoading(false);
      }
    );

    // Listen for localStorage changes (for demo auth)
    const handleStorageChange = () => {
      if (!checkLocalStorageAuth()) {
        setUser(null);
        setSession(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback to localStorage for demo
        if (email === 'admin@vaishnavi.com' && password === 'admin123') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', email);
          
          const userData: User = { 
            email: email,
            id: generateUserUUID(email)
          };
          setUser(userData);
          setSession({ user: userData });
          
          toast({
            title: "Signed In (Demo Mode)",
            description: "You have been signed in successfully using demo credentials.",
          });
          return;
        }

        // Check registered users
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const registeredUser = registeredUsers.find((user: any) => user.email === email && user.password === password);

        if (registeredUser) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', email);
          
          const userData: User = { 
            email: email,
            id: generateUserUUID(email)
          };
          setUser(userData);
          setSession({ user: userData });
          
          toast({
            title: "Signed In",
            description: "You have been signed in successfully.",
          });
          return;
        }

        throw error;
      }

      if (data.user) {
        toast({
          title: "Signed In",
          description: "You have been signed in successfully.",
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign In Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always clear localStorage and local state
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      setUser(null);
      setSession(null);
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    signIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import { createContext, useContext, ReactNode } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";

interface AuthContextType {
  user: any; // Keep generic to avoid complex mapping for now
  session: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  return (
    <AuthContext.Provider 
      value={{ 
        user: isSignedIn ? user : null, 
        session: isSignedIn ? { user } : null, // Mock session for compatibility
        loading: !isLoaded, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

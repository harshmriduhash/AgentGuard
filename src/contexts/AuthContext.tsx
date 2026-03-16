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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-t-2 border-white/20 animate-spin" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-t-2 border-white animate-spin [animation-duration:1.5s]" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user: isSignedIn ? user : null, 
        session: isSignedIn ? { user } : null,
        loading: false, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

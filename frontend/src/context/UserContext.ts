import { createContext, useContext } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  fullName?: string;
  profileImageUrl?: string;
}

interface UserContextType {
  user: User | null;
  updateUser: (userData: User) => void;
  clearUser: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

// ✅ Custom hook to safely use context
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

import React, { useState, useEffect } from "react";
import { UserContext } from "./UserContext";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserProviderProps {
  children: React.ReactNode;
}

const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const clearUser = () => {
    setUser(null);
  };

  // Listen for token expiration event from axios interceptor
  useEffect(() => {
    const handleTokenExpired = () => {
      clearUser();
    };

    window.addEventListener("token-expired", handleTokenExpired);

    return () => {
      window.removeEventListener("token-expired", handleTokenExpired);
    };
  }, []);

  return (
    <UserContext.Provider
      value={{ user, updateUser, clearUser, isLoading, setIsLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

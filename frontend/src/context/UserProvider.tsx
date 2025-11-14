import React, { useState } from "react";
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

  return (
    <UserContext.Provider
      value={{ user, updateUser, clearUser, isLoading, setIsLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

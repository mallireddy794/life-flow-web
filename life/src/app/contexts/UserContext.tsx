import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'donor' | 'patient' | 'hospital' | 'admin';

interface User {
  id: number;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  blood_group?: string;
  is_profile_complete?: boolean;
  units_needed?: number;
  hospital_name?: string;
  last_donation_date?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('lifeFlowUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse saved user:", e);
      return null;
    }
  });
  const [role, setRole] = useState<UserRole>(user?.role || 'donor');

  useEffect(() => {
    if (user) {
      localStorage.setItem('lifeFlowUser', JSON.stringify(user));
      setRole(user.role);
    } else {
      localStorage.removeItem('lifeFlowUser');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, role, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};



import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Role = 'Admin' | 'Manager' | 'Editor' | 'User';

interface User {
  id: string;
  email: string;
  employee?: {
    firstName: string;
    surname: string;
  }
}

interface Workspace {
  id: string;
  title: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'SUSPENDED';
  logo_url?: string | null;
  ownerId?: string;
}

interface RoleContextType {
  role: Role | null;
  user: User | null;
  token: string | null;
  selectedWorkspace: Workspace | null;
  workspaces: Workspace[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  selectWorkspace: (ws: Workspace) => void;
  setRole: (role: Role) => void;
  isLoading: boolean;
  error: string | null;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('msgscale_token'));
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('msgscale_user');
      const savedRole = localStorage.getItem('msgscale_role');
      const savedWS = localStorage.getItem('msgscale_workspace');
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedRole) setRole(savedRole as Role);
      if (savedWS) setSelectedWorkspace(JSON.parse(savedWS));
      fetchWorkspaces();
    }
  }, [token]);

  const fetchWorkspaces = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workspaces`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/direct-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { token, user: userData } = data;

      // Extract role for MsgScale
      const msgScaleRole = userData.roles.find((r: any) => r.app === 'MSGSCALE_BULK');

      if (!msgScaleRole) {
        throw new Error('You do not have permission to access this application');
      }

      // Map backend role names if necessary (backend uses arbitrary strings, frontend expects Role type)
      let mappedRole: Role = 'User';
      const roleStr = msgScaleRole.role.toUpperCase();
      if (roleStr === 'ADMIN') mappedRole = 'Admin';
      else if (roleStr === 'MANAGER') mappedRole = 'Manager';
      else if (roleStr === 'EDITOR') mappedRole = 'Editor';

      setToken(token);
      setUser(userData);
      setRole(mappedRole);

      localStorage.setItem('msgscale_token', token);
      localStorage.setItem('msgscale_user', JSON.stringify(userData));
      localStorage.setItem('msgscale_role', mappedRole);

    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    setWorkspaces([]);
    setSelectedWorkspace(null);
    localStorage.removeItem('msgscale_token');
    localStorage.removeItem('msgscale_user');
    localStorage.removeItem('msgscale_role');
  };

  const selectWorkspace = (ws: Workspace) => {
    setSelectedWorkspace(ws);
    localStorage.setItem('msgscale_workspace', JSON.stringify(ws));
  };

  return (
    <RoleContext.Provider value={{
      role, user, token, workspaces, selectedWorkspace,
      login, logout, selectWorkspace, setRole, isLoading, error
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

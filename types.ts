
export type Role = 'Admin' | 'Manager' | 'Editor' | 'User';
export type Status = 'Active' | 'Pending' | 'Scheduled' | 'Sent' | 'Draft' | 'Rejected' | 'Pending Approval';

export interface User {
  id: string;
  email: string;
  employee?: {
    firstName: string;
    surname: string;
  };
  roles?: { app: string; role: string }[];
  name?: string;
  role?: Role;
  status?: Status;
  avatar?: string;
  lastActive?: string;
}

export interface Workspace {
  id: string;
  title: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'SUSPENDED';
  logo_url?: string | null;
  ownerId?: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'Email' | 'SMS' | 'WhatsApp';
  status: Status;
  audience: string;
  createdBy: string;
  date: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

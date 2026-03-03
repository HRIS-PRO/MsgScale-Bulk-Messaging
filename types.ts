
export type Role = 'Admin' | 'Manager' | 'Editor' | 'User';
export type Status = 'Active' | 'Pending' | 'Scheduled' | 'Sent' | 'Draft' | 'Rejected' | 'Pending Approval';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  avatar?: string;
  lastActive?: string;
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

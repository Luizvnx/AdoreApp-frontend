export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'FINANCE_ADMIN'
  | 'ADMIN_WELCOME' 
  | 'GC_SUPERVISOR' 
  | 'GC_LEADER' 
  | 'WORSHIP_LEADER' 
  | 'MEMBER';

export interface ConnectionGroupInfo {
    id: string;
    name: string;
    neighborhood?: string | null;
    meetingDay?: string | null;
    meetingTime?: string | null;
    leader?: {
        fullName: string;
    } | null;
}

export interface MemberProfileInfo {
    phone?: string | null;
    address?: string | null;
    zipCode?: string | null;
    neighborhood?: string | null;
    birthDate?: string | null;
    joinDate?: string | null;
    baptismDate?: string | null;
    maritalStatus?: string | null;
    ministries?: string[];
}

export interface User {
    id: string;
    name: string;
    email?: string;
    role: UserRole;
    roles?: string[];
    connectionGroupId?: string | null;
    connectionGroup?: ConnectionGroupInfo | null;
    memberProfile?: MemberProfileInfo | null;
}
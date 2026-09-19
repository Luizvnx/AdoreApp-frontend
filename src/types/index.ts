export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'PASTOR'
  | 'DIRECTOR'
  | 'FINANCE_ADMIN'
  | 'ADMIN_WELCOME' 
  | 'GC_SUPERVISOR' 
  | 'GC_LEADER' 
  | 'WORSHIP_LEADER' 
  | 'MEMBER';

export interface ConnectionGroupMemberSummary {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    memberProfile?: {
        phone?: string | null;
        avatarUrl?: string | null;
    } | null;
}

export interface ConnectionGroupInfo {
    id: string;
    name: string;
    neighborhood?: string | null;
    zipCode?: string | null;
    address?: string | null;
    addressNumber?: string | null;
    meetingDay?: string | null;
    meetingTime?: string | null;
    leaderId?: string | null;
    leader?: {
        id?: string;
        fullName: string;
        memberProfile?: {
            phone?: string | null;
            avatarUrl?: string | null;
        } | null;
    } | null;
    members?: ConnectionGroupMemberSummary[];
    _count?: {
        members: number;
        visitors: number;
    };
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
    avatarUrl?: string | null;
}

export interface User {
    id: string;
    name: string;
    email?: string;
    role: UserRole;
    roles?: string[];
    avatarUrl?: string | null;
    congregationId?: string | null;
    congregation?: { id: string; name: string; isHeadquarter: boolean } | null;
    connectionGroupId?: string | null;
    connectionGroup?: ConnectionGroupInfo | null;
    memberProfile?: MemberProfileInfo | null;
}
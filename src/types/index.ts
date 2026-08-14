export type UserRole = 'SUPER_ADMIN' | 'ADMIN_WELCOME' | 'MEMBER';

export interface User {
    id: string;
    name: string;
    role: UserRole;
}
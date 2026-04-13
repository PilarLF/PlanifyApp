
export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'employee';
    avatarUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
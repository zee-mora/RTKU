export interface UserData {
    id: number;
    name: string;
    email: string;
    // role: string;
}

export interface LoginResponse {
    status: string;
    message: string;
    access_token: string;
    user: UserData;
}

export interface LoginErrorResponse {
    message: string;
    errors?: {
        email?: string[];
        password?: string[];
    }
}
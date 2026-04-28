import React, { createContext, useState, useEffect, useCallback } from 'react';

export interface UserData {
    id: number;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
}

interface AuthContextType {
    user: UserData | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (userData: UserData, token: string) => void;
    logout: () => void;
    getToken: () => string | null;
    updateUser: (userData: UserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user_data');
        setTimeout(() => {

            if (savedToken && savedUser) {
                try {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                } catch (error) {
                    console.error('Failed to parse user data:', error);
                    localStorage.clear();
                }
            }
            setLoading(false);
        }, 0);
    }, []);

    const login = useCallback((userData: UserData, accessToken: string) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    }, []);

    const getToken = useCallback(() => {
        return localStorage.getItem('access_token');
    }, []);

    const updateUser = useCallback((userData: UserData) => {
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
    }, []);

    const isAuthenticated = !!token && !!user;

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        getToken,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
"use client";

import { useEffect, useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    // Add other user fields as needed
}

interface ApiResponse {
    data: User;
}

export default function useUser() {

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async (): Promise<void> => {
            try {
                const res: Response = await fetch('/api/users/me', {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data: ApiResponse = await res.json();
                    setUser(data.data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    return { user };
}
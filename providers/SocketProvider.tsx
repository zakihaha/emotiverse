'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { getCookie } from 'cookies-next';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const token = getCookie('token');

        if (!token) return;

        const sock = getSocket(token);

        sock.connect();

        sock.on('connect', () => {
            console.log('✅ Connected:', sock.id);
        });

        sock.on('disconnect', () => {
            console.log('❌ Disconnected');
        });

        setSocket(sock);

        return () => {
            sock.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

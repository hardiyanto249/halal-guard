import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface WebSocketMessage {
    type: 'status' | 'success' | 'error';
    content: string;
}

const ToastNotification: React.FC = () => {
    const [message, setMessage] = useState<WebSocketMessage | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Connect to WebSocket
        const ws = new WebSocket('ws://localhost:8087/ws');

        ws.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setMessage(data);
                setVisible(true);

                // Auto hide after 5 seconds
                setTimeout(() => {
                    setVisible(false);
                }, 5000);
            } catch (err) {
                console.error('Failed to parse websocket message', err);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    if (!visible || !message) return null;

    const bgColors = {
        status: 'bg-blue-600',
        success: 'bg-green-600',
        error: 'bg-red-600',
    };

    const icons = {
        status: <Info className="w-5 h-5" />,
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
    };

    return (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white transition-all transform animate-slide-in ${bgColors[message.type]}`}>
            {icons[message.type]}
            <span className="font-medium text-sm">{message.content}</span>
            <button onClick={() => setVisible(false)} className="ml-2 hover:bg-white/20 p-1 rounded">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default ToastNotification;

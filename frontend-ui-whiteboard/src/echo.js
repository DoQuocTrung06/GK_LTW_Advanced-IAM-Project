import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],

    activityTimeout: 30000,      // chờ 30s trước khi timeout
    pongTimeout: 10000,          // chờ 10s cho pong response  
    unavailableTimeout: 10000,   // chờ 10s khi unavailable

    // SỬA: Dùng biến môi trường cho đồng bộ
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`, 
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                // SỬA: Lấy token MỚI NHẤT ngay lúc chuẩn bị join channel
                const token = localStorage.getItem('auth_token');
                
                fetch(options.authEndpoint, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    callback(false, data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
});

export default echo;
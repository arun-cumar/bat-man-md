// © 2026 arun•°Cumar. All Rights Reserved.
export const getRandomPing = (ping) => {
    const messages = [
        `📡 *Latency:* ${ping} ms`,
        
        `*Latency:* ${ping} ms🚀`,
        
        `⏱️ *Time:* ${ping} ms`,
        
        `🛰️ *Ping:* ${ping} ms`,
        
        `🌀 *Latency:* ${ping} ms`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
};

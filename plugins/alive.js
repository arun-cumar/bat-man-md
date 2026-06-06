import config from "../settings/config.js";
import os from "os";

function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

   const alive = {
    command: 'alive',
    description: 'Check system status and bot info',
    category: 'general',
    execute: async (sock, m, {
        args,
        text,
        q,
        quoted,
        mime,
        qmsg,
        isMedia,
        groupMetadata,
        groupName,
        participants,
        groupOwner,
        groupAdmins,
        isBotAdmins,
        isAdmins,
        isGroupOwner,
        isCreator,
        prefix,
        reply,
        config: cmdConfig,
        sender
    }) => {
        try {

            const emojis = ["⚡","❤","🚀","🔋","🫀","🔛","🧨"];
            const finalEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
            // Tech reaction
            await sock.sendMessage(m.chat, { 
                react: { text: finalEmoji, key: m.key } 
            });

            const userName = m.pushName || "User";
            const botUptime = runtime(process.uptime());
            const totalMemory = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
            const usedMemory = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2);
            const ping = Date.now() - m.messageTimestamp * 1000;
            const platform = os.platform();
            const arch = os.arch();
            const cpu = os.cpus()[0].model;
            const host = os.platform();
            
            const aliveMessage = [
`✨ *${config.settings.title} is Watching Over You* ✨

╔═══════════════════
║  🏰 *ROYAL STATUS*
╠═══════════════════
║ ♕ *User:* ${userName}
║ ⏳ *Uptime:* ${botUptime}
║ 💾 *Memory:* ${usedMemory}MB / ${totalMemory}GB
║ ⚡ *Speed:* ${ping}ms
║ 🖥️ *Platform:* ${host}
║ 📜 *Creator:* ${config.owner}
╚═══════════════════

*"A queen never sleeps, and neither do I"*

👑 Serving the kingdom since deployment
📜 Developed by: ${config.settings.author}

🎭 *Join the Royal Court:*
https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`,
                
`🧙‍♀️ *${config.settings.title} - The Magical Assistant* 🪄

┌─✦ *ENCHANTED STATUS*
│✨ *Sorcerer:* ${userName}
│⏳ *Active Time:* ${botUptime}
│💫 *Magic Power:* ${usedMemory}MB
│⚡ *Spell Speed:* ${ping}ms
│📚 *Library:* ${config.settings.author}
│👑 *Archmage:* ${config.owner}
└─✦────────────◉

*"Magic flows through every command I cast"*

🪄 *Channel Your Magic:*
https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`,
                
                
`🤖 *${config.settings.title} - SYSTEM STATUS*

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
👤 **USER**: ${userName}
⏱️ **UPTIME**: ${botUptime}
💾 **MEMORY**: ${usedMemory}MB / ${totalMemory}GB
📶 **PING**: ${ping}ms
🖥️ **PLATFORM**: ${platform} ${arch}
⚙️ **CPU**: ${cpu.split(' ')[0]}...

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
🔧 **DEVELOPER**: ${config.owner}
📁 **CHANNEL**: ${config.settings.author}
💬 **DESCRIPTION**: ${config.settings.description}

🔗 **OFFICIAL CHANNEL**:
https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24

${config.settings.footer}`];

 const finalAlive = aliveMessage[Math.floor(Math.random() * aliveMessage.length)];
    
            await sock.sendMessage(m.chat, {
                image: { url: config.thumbUrl },
                caption: finalAlive,
                contextInfo: {
                    mentionedJid: [m.sender],
                    externalAdReply: {
                        title: `🤖 ${config.settings.title}`,
                        body: "System Online & Operational",
                        thumbnailUrl: config.thumbUrl,
                        sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24",
                        mediaType: 1
                    }
                }
            }, { quoted: m });
            
            // Technical success reaction
            await sock.sendMessage(m.chat, { 
                react: { text: "✅", key: m.key } 
            });

        } catch (error) {
            console.error("Error in alive command:", error);
            await sock.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            await reply("🚨 System diagnostic failed. Please try the command again.");
        }
    }
};

export default alive;

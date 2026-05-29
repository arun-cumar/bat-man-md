// © 2026 arun•°Cumar. All Rights Reserved.

const connection = async (sock,  clientstart, DisconnectReason, chalk, Boom) => {

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        try {
            // 🟡 CONNECTING
            if (connection === 'connecting') {
                console.log(chalk.yellow("⏳ Connecting to WhatsApp..."));
            }
            
           // 🔴 CONNECTION CLOSED
            if (connection === 'close') {
                
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

                console.log(chalk.red(`❌ Connection Closed. Reason: ${reason}`));

                // 🚫 Logged out → stop bot               
            if (reason !== DisconnectReason.loggedOut) {
                  clientstart();
                     console.log(chalk.yellow('🔄 Attempting to reconnect...'));    
             } else {
                console.log(chalk.red('🚫 Logged out, please restart the bot.'));
               }
           
                // 🧠 Smart reconnect delay based on reason
                let delayTime = 2000;

                if (reason === DisconnectReason.restartRequired) {
                    delayTime = 3000;
                 } else if (reason === DisconnectReason.timedOut) {
                    delayTime = 4000;
                }

                console.log(chalk.yellow(`🔁 Reconnecting in ${delayTime / 1000}s...`));

                if (reason === 401) { // Unauthorized
                console.log(chalk.red("❌ Session Expired! Please scan again."));
                 return;
            }
                await delay(delayTime);
            }
            
            // 🟢 CONNECTED
            if (connection === 'open') {
                console.log(chalk.green('✅ Connected to WhatsApp successfully!'));

                // ✅ Reset flags on successful connection
                isRestarting = false;

                const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

                    sock.sendMessage(botNumber, {
                text:
                    `👑 *${config.settings.title}* is Online!\n\n` +
                    `> 📌 User: ${sock.user.name || 'Unknown'}\n` +
                    `> ⚡ Prefix: [ . ]\n` +
                    `> 🚀 Mode: ${sock.public ? 'Public' : 'Self'}\n` +
                    `> 🤖 Version: v2.0\n` +
                    `> 👑 Owner: arun°•Cumar\n\n` +
                    `*✅ Bot connected successfully*\n` +
                    `📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    externalAdReply: {
                        title: config.settings.title,
                        body: config.settings.description,
                        thumbnailUrl: config.thumbUrl,
                        sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }).catch(console.error);
          }           
        } catch (err) {
            console.log(chalk.red("❌ Connection Handler Error:", err.message));
        }
    });
}

// ✅ Delay helper
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default connection;


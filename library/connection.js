// © 2026 arun•°Cumar. All Rights Reserved.

let isRestarting = false;

const connection = async (sock,  clientstart, DisconnectReason, Boom) => {

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        try {

            // 🟡 CONNECTING
            if (connection === 'connecting') {
                console.log(chalk.yellow("⏳ Connecting to WhatsApp..."));
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
                    
            // 🔴 CONNECTION CLOSED
            if (connection === 'close') {
                
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

                console.log(chalk.red(`❌ Connection Closed. Reason: ${reason}`));

                if (qr) {
                   console.log(chalk.blue('📱 Scan the QR code above to connect.'));
              }
          
                // 🚫 Logged out → stop bot
                if (reason === DisconnectReason.loggedOut) {
                    console.log(chalk.yellow("🚫 Logged out! Please delete session and scan again."));
                    return;
                }

                // ⚠️ Prevent multiple restart spam
                if (isRestarting) return;
                isRestarting = true;

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

                // 🔁 Restart connection
                clientstart();
            }

        } catch (err) {
            console.log(chal.red("❌ Connection Handler Error:", err.message));
        }
    });
}

// ✅ Delay helper
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default connection;


// 2026 arun•°Cumar. All Rights Reserved.
console.clear();
process.on("uncaughtException", console.error);
import config from './settings/config.js';
import pino from "pino";
import { fileTypeFromBuffer } from 'file-type';
import { fileURLToPath } from "url";
import readline from "readline";
import fs from "fs";
import express from "express";
import chalk from "chalk";
import path from "path";
import { Boom } from "@hapi/boom";
import { getBuffer } from "./library/function.js";
import  smsg from './library/serialize.js';
import connections from "./library/connection.js";
import { videoToWebp, writeExifImg, writeExifVid, addExif } from './library/exif.js';

let makeWASocket,  makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidDecode, downloadContentFromMessage, jidNormalizedUser, isPnUser;

const loadBaileys = async () => {
const baileys = await import('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  DisconnectReason = baileys.DisconnectReason;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
  jidDecode = baileys.jidDecode;
  downloadContentFromMessage = baileys.downloadContentFromMessage;
  jidNormalizedUser = baileys.jidNormalizedUser;
  isPnUser = baileys.isPnUser;
  makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore;
};

const sessionPath = path.join(process.cwd(), "session");
const credsPath = path.join(sessionPath, "creds.json"); 

  //SESSION 
    const sessionData = (process.env.SESSION_ID ||  "").trim();

    if (sessionData && !fs.existsSync(credsPath)) {
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }

        try {
            fs.writeFileSync(credsPath, sessionData.trim());
            console.log("✅ Session file restored from ENV");
              } catch (err) {
                   console.error("❌ Session restore failed:", err.message);
                 }
           };
//server
    const app = express();
    const port = process.env.PORT || 3000;
    
    app.get("/", (req, res) => res.send("BAT-MAN is Alive! 🚀..."));
    
    app.listen(port, () => {
        console.log(chalk.green.bold(`
╔═════════════════════╗
○            BAT-MAN MD 
○              🦇 V2.0     
╠═════════════════════╣
⊙     Developer by arun•°Cumar
╚═════════════════════╝
🌐 Uptime server running on port ${port} `));
    });

const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(chalk.yellow(text), (answer) => {
            resolve(answer);
            rl.close();
        });
    });
};

     
const clientstart = async() => {
    await loadBaileys();
    
    const store = {
        messages: new Map(),
        contacts: new Map(),
        groupMetadata: new Map(),
        loadMessage: async (jid, id) => store.messages.get(`${jid}:${id}`) || null,
        bind: (ev) => {
            ev.on('messages.upsert', ({ messages }) => {
                for (const msg of messages) {
                    if (msg.key?.remoteJid && msg.key?.id) {
                        store.messages.set(`${msg.key.remoteJid}:${msg.key.id}`, msg);
                    }
                }
            });
            
            ev.on('lid-mapping.update', ({ mappings }) => {
                console.log(chalk.cyan('📋 LID Mapping Update:'), mappings);
            });
        }
    };

    const { state, saveCreds } = await useMultiFileAuthState(config.session ? config.session : sessionPath);

    const { version, isLatest } = await fetchLatestBaileysVersion();
    
   const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: !config.status.terminal,
        logger: pino({ level: "silent" }),
        browser: [ "Ubuntu", "Chrome", "20.0.04"]
    });
    
    if (config.status.terminal && !sock.authState.creds.registered) {
        const phoneNumber = await question('\n📞Enter your WhatsApp number, starting with 91:\nnumber WhatsApp: ');
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(chalk.green(`🗝 PAIRING CODE: ` + chalk.bold.green(code)));
    }
    
    store.bind(sock.ev);
    
    const lidMapping = sock.signalRepository.lidMapping;
    
    sock.getLIDForPN = async (phoneNumber) => {
        try {
            const lid = await lidMapping.getLIDForPN(phoneNumber);
            return lid;
        } catch (error) {
            console.log('No LID found for PN:', phoneNumber);
            return null;
        }
    };
    
    sock.getPNForLID = async (lid) => {
        try {
            const pn = await lidMapping.getPNForLID(lid);
            return pn;
        } catch (error) {
            console.log('No PN found for LID:', lid);
            return null;
        }
    };
    
    sock.storeLIDPNMapping = async (lid, phoneNumber) => {
        try {
            await lidMapping.storeLIDPNMapping(lid, phoneNumber);
            console.log(chalk.green(`✓ Stored LID<->PN mapping: ${lid} <-> ${phoneNumber}`));
        } catch (error) {
            console.log('Error storing LID/PN mapping:', error);
        }
    };
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (connection === 'connecting') {
            console.log(chalk.yellow('🔄 Connecting to WhatsApp...'));
        }
        
        if (connection === 'open') {
            console.log(chalk.green('✅ Connected to WhatsApp successfully!'));
            
            // Send connection success message to the bot owner
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
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log(chalk.red('❌ Connection closed:'), lastDisconnect?.error);
            
            if (shouldReconnect) {
                console.log(chalk.yellow('🔄 Attempting to reconnect...'));
                setTimeout(clientstart, 5000);
            } else {
                console.log(chalk.red('🚫 Logged out, please restart the bot.'));
            }
        }
        
        if (qr) {
            console.log(chalk.blue('📱 Scan the QR code above to connect.'));
        }
        
        connections({
            sock, 
            update, 
            clientstart, 
            DisconnectReason, 
            Boom
        });
    });

    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message) return;
            
            m.message = Object.keys(m.message)[0] === 'ephemeralMessage' 
                ? m.message.ephemeralMessage.message 
                : m.message;
            
            if (config.status.autoReact && m.key && m.key.remoteJid === 'status@broadcast') {
                let emoji = ['😘', '😭', '😂', '😹', '😍', '😋', '🙏', '😜', '😢', '😠', '🤫', '😎'];
             
                let sigma = emoji[Math.floor(Math.random() * emoji.length)];
                await sock.readMessages([m.key]);
                await sock.sendMessage('status@broadcast', { 
                    react: { 
                        text: sigma, 
                        key: m.key 
                    }
                }, { statusJidList: [m.key.participant] });
            }
            
            if (!sock.public && !m.key.fromMe && chatUpdate.type === 'notify') return;
            if (m.key.id.startsWith('BASE-') && m.key.id.length === 12) return;
            
                 //serialize
                await smsg(sock, m, store);
                //msg
              const msgFile = await import("./msg.js");
                 msgFile.default(sock, m, chatUpdate, store);
               
        } catch (err) {
            console.log(err);
        }
    });

    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    sock.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = contact.id;
            if (store && store.contacts) {
                store.contacts.set(id, {
                    id: id,
                    lid: contact.lid || null,
                    phoneNumber: contact.phoneNumber || null,
                    name: contact.notify || contact.name || null
                });
            }
        }
    });

    sock.public = config.status.public;
    
    sock.sendText = async (jid, text, quoted = '', options) => {
        return sock.sendMessage(jid, {
            text: text,
            ...options
        }, { quoted });
    };
    
    sock.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };

    sock.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? 
            path : /^data:.*?\/.*?;base64,/i.test(path) ?
            Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ?
            await (await getBuffer(path)) : fs.existsSync(path) ? 
            fs.readFileSync(path) : Buffer.alloc(0);
        
        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options);
        } else {
            buffer = await addExif(buff);
        }
        
        await sock.sendMessage(jid, { 
            sticker: { url: buffer }, 
            ...options 
        }, { quoted });
        return buffer;
    };
    
    sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || "";
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];

        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        let type = await fileTypeFromBuffer(buffer);
        let trueFileName = attachExtension ? filename + "." + type.ext : filename;
        await fs.writeFileSync(trueFileName, buffer);
        
        return trueFileName;
    };

    sock.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? 
            path : /^data:.*?\/.*?;base64,/i.test(path) ?
            Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ?
            await (await getBuffer(path)) : fs.existsSync(path) ? 
            fs.readFileSync(path) : Buffer.alloc(0);

        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options);
        } else {
            buffer = await videoToWebp(buff);
        }

        await sock.sendMessage(jid, {
            sticker: { url: buffer }, 
            ...options 
        }, { quoted });
        return buffer;
    };
    
    sock.getFile = async (PATH, returnAsFilename) => {
        let res, filename;
        const data = Buffer.isBuffer(PATH) ?
              PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ?
              Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ?
              await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ?
              (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? 
              PATH : Buffer.alloc(0);
              
        if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer');
        
        const type = await fileTypeFromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        };
        
        if (data && returnAsFilename && !filename) {
            filename = path.join(__dirname, './tmp/' + new Date() * 1 + '.' + type.ext);
            await fs.promises.writeFile(filename, data);
        }
        
        return {
            res,
            filename,
            ...type,
            data,
            deleteFile() {
                return filename && fs.promises.unlink(filename);
            }
        };
    };
    
    sock.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        let type = await sock.getFile(path, true);
        let { res, data: file, filename: pathFile } = type;
        
        if (res && res.status !== 200 || file.length <= 65536) {
            try {
                throw { json: JSON.parse(file.toString()) };
            } catch (e) { 
                if (e.json) throw e.json;
            }
        }
        
        let opt = { filename };
        if (quoted) opt.quoted = quoted;
        if (!type) options.asDocument = true;
        
        let mtype = '', mimetype = type.mime, convert;
        
        if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
        else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
        else if (/video/.test(type.mime)) mtype = 'video';
        else if (/audio/.test(type.mime)) {
            convert = await (ptt ? toPTT : toAudio)(file, type.ext);
            file = convert.data;
            pathFile = convert.filename;
            mtype = 'audio';
            mimetype = 'audio/ogg; codecs=opus';
        }
        else mtype = 'document';
        
        if (options.asDocument) mtype = 'document';
        
        let message = {
            ...options,
            caption,
            ptt,
            [mtype]: { url: pathFile },
            mimetype
        };
        
        let m;
        try {
            m = await sock.sendMessage(jid, message, {
                ...opt,
                ...options
            });
        } catch (e) {
            console.error(e);
            m = null;
        } finally {
            if (!m) {
                m = await sock.sendMessage(jid, {
                    ...message,
                    [mtype]: file
                }, {
                    ...opt,
                    ...options 
                });
            }
            return m;
        }
    };
    
    return sock;
};

clientstart();

const ignoredErrors = [
    'Socket connection timeout',
    'EKEYTYPE',
    'item-not-found',
    'rate-overlimit',
    'Connection Closed',
    'Timed Out',
    'Value not found'
];

    
const __filename = fileURLToPath(import.meta.url);
const cacheBuster = `?update=${Date.now()}`;
    
 //watching 
fs.watchFile(__filename, async () => {
    // temporary stop
    fs.unwatchFile(__filename);
    
    console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
    
    try {
        await import(`./${path.basename(__filename)}${cacheBuster}`);
    } catch (error) {
        console.error('\x1b[1;31mError re-loading file:\x1b[0m', error);
    }
});

process.on('unhandledRejection', reason => {
    if (ignoredErrors.some(e => String(reason).includes(e))) return;
    console.log('Unhandled Rejection:', reason);
});

const originalConsoleError = console.error;
console.error = function (msg, ...args) {
    if (typeof msg === 'string' && ignoredErrors.some(e => msg.includes(e))) return;
    originalConsoleError.apply(console, [msg, ...args]);
};

const originalStderrWrite = process.stderr.write;
process.stderr.write = function (msg, encoding, fd) {
    if (typeof msg === 'string' && ignoredErrors.some(e => msg.includes(e))) return;
    originalStderrWrite.apply(process.stderr, arguments);
};
//😁

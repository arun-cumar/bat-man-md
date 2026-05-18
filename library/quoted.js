// © 2026 arun•°Cumar. All Rights Reserved.

import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const cacheBuster = `?update=${Date.now()}`;
    
const fquoted = {
    channel: {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "27796262030@s.whatsapp.net"
        },
        message: {
            newsletterAdminInviteMessage: {
                newsletterJid: "0@newsletter",
                newsletterName: "arun•°Cumar",
                caption: " BAT-MAN MD",
                inviteExpiration: "0"
            }
        }
    }
};

export default fquoted;

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



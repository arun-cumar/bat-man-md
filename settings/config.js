//  2025 arun•°Cumar. All Rights Reserved.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const config = {
    owner: "arun•°Cumar",
    botNumber: "-",
    setPair: "BAT-MAN",
    thumbUrl: "https://i.imgur.com/IkEv97P.jpeg",
    status: {
        public: true,
        terminal: true,
        autoReact: false
    },
    message: {
        owner: "_no, this is for owners only_",
        group: "_this is for groups only_",
        admin: "_this command is for admin only_",
        private: "_this is specifically for private chat_"
    },
    mess: {
        owner: '_This command is only for the bot owner!_',
        done: '_Mode changed successfully!_',
        error: '_Something went wrong!_',
        wait: '_Please wait..._'
    },
    settings: {
        title: "_BAT-MAN WhatsApp Bot_",
        packname: 'BAT-MAN',
        description: "this script was created by arun•°Cumar",
        author: 'https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24',
        footer: "arun-cumar"
    },
    newsletter: {
        name: "BAT-MAN Bot",
        id: "0@newsletter"
    },
    api: {
        baseurl: "https://batman-api.vercel.app/",
        apikey: "arun"
    },
    sticker: {
        packname: "BAT-MAN",
        author: "whatsapp Bot"
    }
}

export default config;

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

import FormData from "form-data";
import fetch from "node-fetch";

const tempfiles = async function(buffer, filename = "BAT-MAN.jpg") {
    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const form = new FormData();
    form.append("file", buf, { 
        filename: filename, 
        contentType: "image/jpeg"
    });
    
    const res = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: form,
      headers: form.getHeaders()
    });
    
    const json = await res.json();
    const idMatch = json.data.url.match(/\/(\d+)\//);
    const id = idMatch[1];
    return `https://tmpfiles.org/dl/${id}/${filename}`;
}

exports default tempfiles;


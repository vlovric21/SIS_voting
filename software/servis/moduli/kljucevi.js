const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

exports.generirajIPohraniKljuceve = function(putanja) {
    let { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "spki",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem"
        }
    });

    fs.writeFileSync(path.join(putanja, "public_key.pem"), publicKey);
    fs.writeFileSync(path.join(putanja, "private_key.pem"), privateKey);
}
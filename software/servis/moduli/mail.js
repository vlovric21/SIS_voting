const nodemailer = require('nodemailer');
const ds = require("fs");

let konfDat = ds.readFileSync(__dirname + "/mailKonf.csv", "utf-8");
var konfZapisi = {};
for (let zapis of konfDat.split("\n")) {
    let podijeljen = zapis.split(":");
    konfZapisi[podijeljen[0]] = podijeljen[1];
}

let mailer = nodemailer.createTransport({
    host: konfZapisi.mailHost,
    port: parseInt(konfZapisi.mailPort),
    auth: {
        user: konfZapisi.mailUser,
        pass: konfZapisi.mailPass,
    },
});

exports.posaljiMail = async function(prima, predmet, poruka) {
	message = {
		from: konfZapisi.mailUser,
		to: prima,
		subject: predmet,
		html: poruka
	}
	
	let odgovor = await mailer.sendMail(message);
	console.log(odgovor);
	return odgovor;
}

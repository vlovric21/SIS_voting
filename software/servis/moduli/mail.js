const nodemailer = require('nodemailer');

let mailer = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: " --- VASA --- FOI --- ADRESA --- @student.foi.hr",
        pass: " --- GOOGLE APP PASSWORD: info na https://elf.foi.hr/mod/page/view.php?id=118602 --- ",
    },
});

exports.posaljiMail = async function(salje, prima, predmet, poruka) {
	message = {
		from: salje,
		to: prima,
		subject: predmet,
		html: poruka
	}
	
	let odgovor = await mailer.sendMail(message);
	console.log(odgovor);
	return odgovor;
}

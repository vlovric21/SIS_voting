const { TOTP } = require("totp-generator");
const base32 = require("base32-encoding");
const kodovi = require("./kodovi.js");

exports.kreirajTajniKljuc = function(korime){
	let tekst = korime + new Date() + kodovi.dajNasumicniBroj(10000000,9000000);
	let hash = kodovi.kreirajSHA512(tekst)
	let tajniKljuc = base32.stringify(hash, "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567");
	return tajniKljuc.toUpperCase();
}

exports.provjeriTOTP = function(uneseniKod, tajniKljuc){
	const { otp } = TOTP.generate(tajniKljuc, {
		digits: 6,
		period: 60,
	})
	if(uneseniKod == otp) return true;
	else return false;
}

exports.dajTOTP = function(tajniKljuc){
	const { otp } = TOTP.generate(tajniKljuc, {
		digits: 6,
		period: 60,
	})
	return otp;
}
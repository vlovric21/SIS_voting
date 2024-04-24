const totp = require("totp-generator")
const base32 = require("base32-encoding")

exports.kreirajTajniKljuc = function(korime){
	let tekst = korime + new Date() + kodovi.dajNasumceBroj(10000000,9000000);
	let hash = kodovi.kreirajSHA256(tekst)
	let tajniKljuc = base32.stringify(hash, "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567");
	return tajniKljuc.toUpperCase();
}

exports.provjeriTOTP = function(uneseniKod, tajniKljuc){
	const kod = totp(tajniKljuc, {
		digits: 6,
		algorithm: "SHA-512",
		period: 60
	});
	if(uneseniKod == kod) return true;
	else return false;
}
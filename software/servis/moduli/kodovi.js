const crypto = require('crypto');

exports.kreirajSHA512 = function(tekst) {
	const hash = crypto.createHash('sha512');
	hash.write(tekst);
	var izlaz = hash.digest('hex');
	hash.end();
	return izlaz;
}

exports.kreirajSHA512 = function(tekst, sol) {
	const hash = crypto.createHash('sha512');
	hash.write(tekst + sol);
	var izlaz = hash.digest('hex');
	hash.end();
	return izlaz;
}

exports.dajNasumceBroj = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); 
}

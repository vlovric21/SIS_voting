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

exports.generirajAutentifikacijskiToken = function() {
	return crypto.randomBytes(128).toString('hex');
}

exports.dajNasumicniBroj = function(min, max) {
  return _dajNasumicniBroj(min, max);
}

_dajNasumicniBroj = function(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); 
  }
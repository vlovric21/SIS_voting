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

exports.encrypt = function(tekst, kljuc, iv){
	const algorithm = 'aes-256-cbc';

	const cipher = crypto.createCipheriv(algorithm, kljuc, iv);
	let encrypted = cipher.update(tekst, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}

exports.decrypt = function(tekstEnk, kljuc, iv){
	const algorithm = 'aes-256-cbc';

	const decipher = crypto.createDecipheriv(algorithm, kljuc, iv);
	try{
		let decrypted = decipher.update(tekstEnk, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}catch(error){
		console.error('Decryption error:', error.message);
        return null;
	}
	
}
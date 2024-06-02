const crypto = require('crypto');
const ds = require("fs");


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
	const ivBuffer = Buffer.from(iv, 'hex');
	const kljucBuffer = Buffer.from(kljuc, 'hex');

	const cipher = crypto.createCipheriv(algorithm, kljucBuffer, ivBuffer);
	let encrypted = cipher.update(tekst, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}

exports.decrypt = function(tekstEnk, kljuc, iv){
	const algorithm = 'aes-256-cbc';
	const ivBuffer = Buffer.from(iv, 'hex');
	const kljucBuffer = Buffer.from(kljuc, 'hex');

	const decipher = crypto.createDecipheriv(algorithm, kljucBuffer, ivBuffer);
	try{
		let decrypted = decipher.update(tekstEnk, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}catch(error){
		console.error('Decryption error:', error.message);
        return null;
	}
}

let k = ds.readFileSync(__dirname + "/k.json");
const data = JSON.parse(k);

_dajPodatke = function(){
	const polje = [
		data.a[23],
    	data.b[16],
    	data.a[11],
    	data.b[27], 
	];
	return polje;
}

exports.dajPodatkeA = function(){ //pitanje
	let polje = _dajPodatke();
	let poljeA = polje.slice(0,2);
	return poljeA;
}

exports.dajPodatkeB = function(){ //odabir
	let polje = _dajPodatke();
	let poljeB = polje.slice(2,4);
	return poljeB;
}
const jwt = require("jsonwebtoken")

exports.kreirajToken = function(podaci, tajniKljucJWT, valjanostJWT) {
	let token = jwt.sign(podaci, tajniKljucJWT, { expiresIn: `${valjanostJWT}s` });
    return token;
}

exports.provjeriToken = function(zahtjev, tajniKljucJWT) {
    if (zahtjev.headers.authorization != null) {
        let token = zahtjev.headers.authorization.split(" ")[1];
		let korime = _dajKorimeJWT(token);

		if (korime != zahtjev.session.korime) {
			return false;
		}

        try {
            let podaci = jwt.verify(token, tajniKljucJWT);
			return true;
        } catch (e) {
            return false;
        }
    }
    return false;
}

exports.provjeriJeLiAdmin = function(token) {
	let uloga = _dajUloguJWT(token);
	if (uloga == "administrator") return true;
	return false;
}

exports.ispisiDijelove = function(token) {
	let dijelovi = token.split(".");
	let zaglavlje =  dekodirajBase64(dijelovi[0]);
	console.log(zaglavlje);
	let tijelo =  dekodirajBase64(dijelovi[1]);
	console.log(tijelo);
	let potpis =  dekodirajBase64(dijelovi[2]);
	console.log(potpis);
}

_dajKorimeJWT = function(token) {
	let dijelovi = token.split(".");
	let tijelo =  dekodirajBase64(dijelovi[1]);
	return JSON.parse(tijelo).korime;
}

_dajUloguJWT = function(token) {
	let dijelovi = token.split(".");
	let tijelo =  dekodirajBase64(dijelovi[1]);
	return JSON.parse(tijelo).uloga;
}

exports.dajKorimeJWT = function(token) {
	return _dajKorimeJWT(token);
}

exports.dajTijelo = function(token){
	let dijelovi = token.split(".");
	return JSON.parse(dekodirajBase64(dijelovi[1]));
}

function dekodirajBase64(data){
	let buff = Buffer.from(data, 'base64');
	return buff.toString('ascii');
}

const KorisnikDAO = require("./korisnikDAO.js");
const mail = require("./moduli/mail.js");

class RestKorisnik {
    registrirajNovogKorisnika = async function (req, res) {
        res.type("application/json");
        
        let noviKorisnik = req.body;
        let greske = provjeriTijeloKorisnik(noviKorisnik);

        if (greske != "") {
            res.status(417);
            res.send(JSON.stringify({"greska": greske}));
            return;
        }

        let korisnikDAO = new KorisnikDAO();
        korisnikDAO.registrirajNovogKorisnika(noviKorisnik).then((mail) => {
            res.status(201);
            res.type("application/json");
            res.send(JSON.stringify({"opis": `poveznica za aktivaciju poslana na adresu ${mail}`}));
        }).catch((greska) => {
            res.status(400);
            res.type("application/json");
            res.send(JSON.stringify({"greska": greska.message}));
        });
    }
}

function provjeriTijeloKorisnik(korisnik = null) {
    if (korisnik == null || korisnik == undefined) {
        return "korisnik nije poslan";
    }

    let greske = "";
    if (korisnik.korime == null || korisnik.korime == undefined || (typeof korisnik.korime != "string")) {
        greske += "nije uneseno korisnicko ime";
    } else if (korisnik.korime.length > 45) {
        greske += "korisnicko ime mora imati maksimalno 45 znakova";
    }
    if (korisnik.lozinka == null || korisnik.lozinka == undefined || (typeof korisnik.lozinka != "string")) {
        if (greske != "") greske += ", ";
        greske += "nije unesena lozinka";
    }
    if (korisnik.mail == null || korisnik.mail == undefined || (typeof korisnik.mail != "string")) {
        if (greske != "") greske += ", ";
        greske += "nije unesena mail adresa";
    } else {
        if (korisnik.mail.length > 50) {
            if (greske != "") greske += ", ";
            greske += "mail adresa mora imati maksimalno 50 znakova";
        }

        let mailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!mailRegex.test(korisnik.mail)) {
            if (greske != "") greske += ", ";
            greske += "neispravna mail adresa";
        }
    }

    return greske;
}

module.exports = RestKorisnik;
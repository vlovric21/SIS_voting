const KorisnikDAO = require("./korisnikDAO.js");
const HtmlUpravitelj = require("../aplikacija/htmlUpravitelj.js");

class RestOpenIDKorisnik{
    constructor(sol, putanja, url, jwtTajniKljuc, jwtValjanost){
        this.korisnikDAO = new KorisnikDAO(sol);
        this.htmlUpravitelj = new HtmlUpravitelj(putanja);
        this.url = url;
        this.jwtTajniKljuc = jwtTajniKljuc;
        this.jwtValjanost = jwtValjanost;
    }

    prijaviOpenIDKorisnika = async function(req, res){
        res.type("application/json");

        let korisnik = req.user;
        let korisnikDAO = new KorisnikDAO(this.sol);

        if(await korisnikDAO.provjeriPostojanjeIdentifikatora(korisnik.id)){ //ako se prije registrirao sa openID ima identifikator u bazi
            this.kreirajSesiju(req, res);
        }else{
            if(await korisnikDAO.provjeriPostojanjeMaila(korisnik.email)){ //ako vec ima account s nama, jer taj acc nema identifikator od openID
                res.status(401);
                res.send(JSON.stringify({"greska": "Već imate račun s ovom mail adresom"}));
            }else{
                this.registrirajOpenIDKorisnika(req, res);
                //this.kreirajSesiju(req, res);
            }
        }
    }

    registrirajOpenIDKorisnika = function (req, res) {
        res.type("application/json");
        let noviKorisnik = req.user;

        let korisnikDAO = new KorisnikDAO(this.sol);
        korisnikDAO.registrirajOpenIDKorisnika(noviKorisnik).then((korime) => {
            res.status(200);
            res.send(JSON.stringify({"korime": korime}));
            }).catch((greska) => {
                res.status(400);
                res.send(JSON.stringify({"greska": greska.message}));
            });
    }

    kreirajSesiju = function(req, res){
        res.type("application/json");

        let korisnik = req.user;
        if (korisnik == undefined || korisnik == null) {
            res.status(417);
            res.send(JSON.stringify({"greska": "neocekivani podaci"}));
            return;
        }
        let korime = req.user.korime;
        if(req.session.korime === null || req.session.korime === undefined){
            req.session.korime = korisnik.korime;
            res.status(200);
            res.send(JSON.stringify({"korime": korime}));
        }else{
            res.status(400);
            res.send(JSON.stringify({"greska": "Već ste prijavljeni"}));
        }
    }
}

module.exports = RestOpenIDKorisnik;
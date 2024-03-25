const KorisnikDAO = require("./korisnikDAO.js");
const HtmlUpravitelj = require("../aplikacija/htmlUpravitelj.js");
const kodovi = require("./moduli/kodovi.js");
const mail = require("./moduli/mail.js");
const jwt = require("./moduli/jwt.js");

class RestKorisnik {
    constructor (sol, putanja, url, jwtTajniKljuc, jwtValjanost) {
        this.sol = sol;
        this.putanja = putanja;
        this.url = url;
        this.jwtTajniKljuc = jwtTajniKljuc;
        this.jwtValjanost = jwtValjanost;
    }

    registrirajNovogKorisnika = async function (req, res) {
        res.type("application/json");
        
        let noviKorisnik = req.body;
        let greske = provjeriTijeloKorisnik(noviKorisnik);

        if (greske != "") {
            res.status(417);
            res.send(JSON.stringify({"greska": greske}));
            return;
        }

        let authToken = kodovi.generirajAutentifikacijskiToken();

        let korisnikDAO = new KorisnikDAO();
        korisnikDAO.registrirajNovogKorisnika(noviKorisnik, authToken).then(async (adresa) => {
            let poruka = `<b>Poštovani korisniče ${noviKorisnik.korime}</b>,<br><br>potvrdite mail adresu na sljedećoj poveznici: <a href="${this.url}/api/korisnici/aktiviraj/${noviKorisnik.korime}?token=${authToken}">Potvrdi mail adresu</a>`;
            await mail.posaljiMail(adresa.trim(), "Potvrdite mail adresu", poruka);

            res.status(201);
            res.send(JSON.stringify({"opis": `poveznica za aktivaciju poslana na adresu ${adresa}`}));
        }).catch((greska) => {
            res.status(400);
            res.send(JSON.stringify({"greska": greska.message}));
        });
    }

    aktivirajKorisnika = async function (req, res) {
        let korime = req.params.korime;
        let token = req.query.token;

        if (token == undefined || token == "") {
            res.type("application/json");
            res.status(417);
            res.send(JSON.stringify({"greska": "nedostaje token"}));
            return;
        }

        let korisnikDAO = new KorisnikDAO(this.sol);
        let htmlUpravitelj = new HtmlUpravitelj(this.putanja);
        korisnikDAO.aktivirajKorisnika(korime, token).then(async (uspjeh) => {
            res.status(200);
            res.type("text/html");
            let str = await htmlUpravitelj.uspjesnaAktivacijaStranica();
            res.send(str);
        }).catch(async (greska) => {
            res.status(200);
            res.type("text/html");
            let str = await htmlUpravitelj.neuspjesnaAktivacijaStranica(greska.message);
            res.send(str);
        });
    }

    dobijJWT = async function (req, res) {
        res.type("application/json");
        
        let korime = req.params.korime;
        let korisnikDAO = new KorisnikDAO(this.sol);
        korisnikDAO.provjeriPostojanjeKorisnika(korime).then((korisnik) => {
            if (req.session.korime === null || req.session.korime === undefined) {
                res.status(401);
                res.send(JSON.stringify({"opis": "potrebna prijava"}));
                return;
            }

            let token = jwt.kreirajToken({korime: korime}, this.jwtTajniKljuc, this.jwtValjanost);
            req.session.jwt = token;
            res.set("Authorization", `Bearer ${token}`);
            res.status(201);
            res.send(JSON.stringify({"opis": "uspjesno kreiran jwt"}));
        }).catch((greska) => {
            res.status(400);
            res.send(JSON.stringify({"greska": greska.message}));
        });
    }

    kreirajSesiju = async function (req, res) {
        res.type("application/json");

        let korisnik = req.body;
        if (korisnik == undefined || korisnik == null) {
            res.status(417);
            res.send(JSON.stringify({"greska": "neocekivani podaci"}));
            return;
        }

        let greske = provjeriTijeloKorisnikPrijava(korisnik);
        if (greske != "") {
            res.status(417);
            res.send(JSON.stringify({"greska": greske}));
            return;
        }

        let korime = req.params.korime;
        if (korisnik.korime != undefined && korisnik.korime != null && korisnik.korime != "") {
            if (korisnik.korime != korime) {
                res.status(417);
                res.send(JSON.stringify({"greska": "neocekivani podaci"}));
                return;
            }
        } else {
            korisnik.korime = korime;
        }

        let korisnikDAO = new KorisnikDAO(this.sol);
        korisnikDAO.provjeriKorisnickePodatke(korisnik).then((uspjeh) => {
            if (req.session.korime === null || req.session.korime === undefined) {
                req.session.korime = korisnik.korime;

                res.status(201);
                res.send(JSON.stringify({"opis": uspjeh}));
            } else {
                res.status(400);
                res.send(JSON.stringify({"greska": "vec postoji prijava"}));
            }
        }).catch((greska) => {
            res.status(400);
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

function provjeriTijeloKorisnikPrijava(korisnik = null) {
    if (korisnik == null || korisnik == undefined) {
        return "korisnik nije poslan";
    }

    let greske = "";
    if ((korisnik.korime == null || korisnik.korime == undefined || (typeof korisnik.korime != "string")) && (korisnik.mail == null || korisnik.mail == undefined || (typeof korisnik.mail != "string"))) {
        if (greske != "") greske += ", ";
        greske += "nije uneseno korisnicko ime ili mail";
    } else {
        if (korisnik.korime != undefined && korisnik.korime != "" && korisnik.korime != null) {
            if (korisnik.korime.length > 45) {
                if (greske != "") greske += ", ";
                greske += "korisnicko ime mora imati maksimalno 45 znakova";
            }

            if (korisnik.mail != undefined && korisnik.mail != "" && korisnik.mail != null) {
                if (greske != "") greske += ", ";
                greske += "samo korisnicko ime ili mail";
            }
        } else if (korisnik.mail != undefined && korisnik.mail != "" && korisnik.mail != null) {
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
    } 
    if (korisnik.lozinka == null || korisnik.lozinka == undefined || (typeof korisnik.lozinka != "string")) {
        if (greske != "") greske += ", ";
        greske += "nije unesena lozinka";
    }

    return greske;
}

module.exports = RestKorisnik;
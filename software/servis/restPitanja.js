const PitanjaDAO = require("./pitanjaDAO.js");
const KorisnikDAO = require("./korisnikDAO.js");
const jwt = require("./moduli/jwt.js");

class RestPitanja {
    constructor(sol, brojPoStr, jwtTajniKljuc, jwtValjanost) {
        this.sol = sol;
        this.brojPoStr = brojPoStr;
        this.jwtTajniKljuc = jwtTajniKljuc;
        this.jwtValjanost = jwtValjanost;
    }

    getPitanja = async function (req, res) {
        let stranica = req.query.str;
        if (stranica == undefined) {
            stranica = 1;
        }

        let jwtValidan = jwt.provjeriToken(req, this.jwtTajniKljuc);
        if (!jwtValidan) {
            res.status(401);
            res.send(JSON.stringify({"opis": "potrebna prijava"}));
            return;
        }
        let token = req.headers.authorization.split(" ")[1];
        let korime = jwt.dajKorimeJWT(token, this.jwtTajniKljuc);

        let pitanjaDAO = new PitanjaDAO();
        pitanjaDAO.dobijPitanjaIOdgovore(stranica, this.brojPoStr, korime).then((podaci) => {
            res.status(200);
            res.type("application/json");
            res.send(JSON.stringify(podaci));
        }).catch((greska) => {
            console.log(greska);
            res.status(400);
            res.type("application/json");
            res.send(JSON.stringify({"greska": greska}));
        });
    }

    postPitanja = async function (req, res) {
        res.type("application/json");

        let jwtValidan = jwt.provjeriToken(req, this.jwtTajniKljuc);
        if (!jwtValidan) {
            res.status(401);
            res.send(JSON.stringify({"opis": "potrebna prijava"}));
            return;
        }
        let token = req.headers.authorization.split(" ")[1];
        let korime = jwt.dajKorimeJWT(token, this.jwtTajniKljuc);
        
        let pitanje = req.body;
        let greske = provjeriTijeloPitanja(pitanje);
        
        if (greske != "") {
            res.status(417);
            res.send(JSON.stringify({"greska": greske}));
            return;
        }

        let pitanjaDAO = new PitanjaDAO();
        pitanjaDAO.postaviNovoPitanje(pitanje, korime).then((id) => {
            res.status(201);
            res.type("application/json");
            res.send(JSON.stringify({"opis": `dodano pitanje s id ${id}`}));
        }).catch((greska) => {
            res.status(400);
            res.type("application/json");
            res.send(JSON.stringify({"greska": greska}));
        });
    }

    putPitanja = async function (req, res) {
        res.type("application/json");

        let jwtValidan = jwt.provjeriToken(req, this.jwtTajniKljuc);
        if (!jwtValidan) {
            res.status(401);
            res.send(JSON.stringify({"opis": "potrebna prijava"}));
            return;
        }
        let token = req.headers.authorization.split(" ")[1];
        let korime = jwt.dajKorimeJWT(token, this.jwtTajniKljuc);

        let korisnikDAO = new KorisnikDAO(this.sol);
        korisnikDAO.dajIdKorisnika(korime).then((id) => {
            let pitanjeId = req.params.pitanjeId;
            let odgovorId = req.params.odgovorId;

            let pitanjaDAO = new PitanjaDAO();
            pitanjaDAO.zabiljeziOdgovorNaPitanje(id, pitanjeId, odgovorId).then((uspjeh) => {
                res.status(201);
                res.send(JSON.stringify({"opis": uspjeh}));
            }).catch((neuspjeh) => {
                res.status(400);
                res.send(JSON.stringify({"greska": neuspjeh.message}));
            });
        }).catch((greska) => {
            res.status(400);
            res.send(JSON.stringify({"greska": greska.message}));
        });
    }
}

function provjeriTijeloPitanja(pitanje = null) {
    if (pitanje == null || pitanje == undefined) {
        return "pitanje nije poslano";
    }

    let xssRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/;

    let greske = "";
    if (pitanje.pitanje == null || pitanje.pitanje == undefined || (typeof pitanje.pitanje != "string")) {
        greske += "nije uneseno pitanje";
    } else {
        if (pitanje.pitanje.trim() === "") {
            greske += "naslov pitanja je prazan";
        } else
        if (xssRegex.test(pitanje.pitanje)) {
            greske += "dobar pokušaj";
        }
    }
    if (pitanje.odabiri == null || pitanje.odabiri == undefined || (typeof pitanje.odabiri != "object")) {
        if (greske != "") greske += ", ";
        greske += "nisu uneseni odabiri";
    } else {
        if (pitanje.odabiri.length < 2) {
            greske += "moraju biti upisana minimalno 2 odgovora";
        }

        if (!Array.isArray(pitanje.odabiri)) {
            if (greske != "") greske += ", ";
            greske += "odabiri su neispravni";
        } else {
            for (let odabir of pitanje.odabiri) {
                if (odabir.tekst == null || odabir.tekst == undefined || (typeof odabir.tekst != "string")) {
                    if (greske != "") greske += ", ";
                    greske += "neki od odabira su neispravni";
                    break;
                } else {
                    if (xssRegex.test(odabir.tekst)) {
                        greske += "dobar pokusaj sa odabirima";
                        break;
                    }
                }
            }
        }
    }

    return greske;
}

module.exports = RestPitanja;
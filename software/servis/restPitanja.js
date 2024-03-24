const PitanjaDAO = require("./pitanjaDAO.js");

class RestPitanja {
    constructor(brojPoStr) {
        this.brojPoStr = brojPoStr;
    }

    getPitanja = async function (req, res) {
        let stranica = req.query.str;
        if (stranica == undefined) {
            stranica = 1;
        }

        let pitanjaDAO = new PitanjaDAO();
        pitanjaDAO.dobijPitanjaIOdgovore(stranica, this.brojPoStr).then((podaci) => {
            res.status(200);
            res.type("application/json");
            res.send(JSON.stringify(podaci));
        }).catch((greska) => {
            res.status(400);
            res.type("application/json");
            res.send(JSON.stringify({"greska": greska}));
        });
    }

    postPitanja = async function (req, res) {
        res.type("application/json");
        
        let pitanje = req.body;
        let greske = provjeriTijeloPitanja(pitanje);
        
        if (greske != "") {
            res.status(417);
            res.send(JSON.stringify({"greska": greske}));
            return;
        }

        let pitanjaDAO = new PitanjaDAO();
        pitanjaDAO.postaviNovoPitanje(pitanje).then((id) => {
            res.status(201);
            res.type("application/json");
            res.send(JSON.stringify({"opis": `dodano pitanje s id ${id}`}));
        }).catch((greska) => {
            res.status(400);
            res.type("application/json");
            res.send(JSON.stringify({"greska": greska}));
        });
    }
}

function provjeriTijeloPitanja(pitanje = null) {
    if (pitanje == null || pitanje == undefined) {
        return "pitanje nije poslano";
    }

    let greske = "";
    if (pitanje.pitanje == null || pitanje.pitanje == undefined || (typeof pitanje.pitanje != "string")) {
        greske += "nije uneseno pitanje";
    }
    if (pitanje.Korisnik_idKorisnik == null || pitanje.Korisnik_idKorisnik == undefined || isNaN(pitanje.Korisnik_idKorisnik)) {
        if (greske != "") greske += ", ";
        greske += "nije unesen ID korisnika";
    }
    if (pitanje.odabiri == null || pitanje.odabiri == undefined || (typeof pitanje.odabiri != "object")) {
        if (greske != "") greske += ", ";
        greske += "nisu uneseni odabiri";
    } else {
        if (!Array.isArray(pitanje.odabiri)) {
            if (greske != "") greske += ", ";
            greske += "odabiri su neispravni";
        } else {
            for (let odabir of pitanje.odabiri) {
                if (odabir.tekst == null || odabir.tekst == undefined || (typeof odabir.tekst != "string")) {
                    if (greske != "") greske += ", ";
                    greske += "neki od odabira su neispravni";
                    break;
                }
            }
        }
    }

    return greske;
}

module.exports = RestPitanja;
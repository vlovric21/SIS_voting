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
}

module.exports = RestPitanja;
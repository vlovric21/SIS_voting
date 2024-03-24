const Baza = require("./baza/baza.js");

class PitanjaDAO {
    constructor() {
        this.baza = new Baza("baza.sqlite");
    }

    dobijPitanjaIOdgovore = async function(str = 1, pitanjaPoStr) {
        this.baza.spojiSeNaBazu();
        let sql = "SELECT * FROM Pitanje LIMIT ? OFFSET ?;";
        let pitanja = await this.baza.izvrsiUpit(sql, [pitanjaPoStr, (str - 1)*pitanjaPoStr]);

        let potrebniOdabiri = [];
        for (let pitanje of pitanja) {
            sql = "SELECT * FROM Odabir WHERE Pitanje_idPitanje = ?;";
            potrebniOdabiri.push(this.baza.izvrsiUpit(sql, [pitanje.idPitanje]));
        }
        let dobiveniOdabiri = await Promise.all(potrebniOdabiri);
        for (let pitanjeId in pitanja) {
            pitanja[pitanjeId].odabiri = dobiveniOdabiri[pitanjeId];
        }

        this.baza.zatvoriVezu();
        return pitanja;
    }
}

module.exports = PitanjaDAO;
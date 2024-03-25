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
            sql = "SELECT idOdabir, tekst FROM Odabir WHERE Pitanje_idPitanje = ?;";
            potrebniOdabiri.push(this.baza.izvrsiUpit(sql, [pitanje.idPitanje]));
        }
        let dobiveniOdabiri = await Promise.all(potrebniOdabiri);
        for (let pitanjeId in pitanja) {
            pitanja[pitanjeId].odabiri = dobiveniOdabiri[pitanjeId];
        }

        this.baza.zatvoriVezu();
        return pitanja;
    }

    postaviNovoPitanje = async function(pitanje, korime) {
        this.baza.spojiSeNaBazu();
        let zadnjiId = 0;
        try {
            await this.baza.izvrsiUpit("BEGIN TRANSACTION");
            let sqlKorId = "SELECT idKorisnik FROM Korisnik WHERE korime = ?;";
            let korId = (await this.baza.izvrsiUpit(sqlKorId, [korime]))[0].idKorisnik;
            let sql = "INSERT INTO Pitanje (pitanje, Korisnik_idKorisnik) VALUES (?, ?);";
            await this.baza.izvrsiUpit(sql, [pitanje.pitanje, korId]);
            let sqlId = "SELECT last_insert_rowid() AS id";
            zadnjiId = (await this.baza.izvrsiUpit(sqlId))[0].id;

            let potrebniUnosi = [];
            for (let odabir of pitanje.odabiri) {
                sql = "INSERT INTO Odabir (tekst, Pitanje_idPitanje) VALUES (?, ?);";
                potrebniUnosi.push(this.baza.izvrsiUpit(sql, [odabir.tekst, zadnjiId]));
            }
            await Promise.all(potrebniUnosi);

            await this.baza.izvrsiUpit("COMMIT");
        } catch (greska) {
            await this.baza.izvrsiUpit("ROLLBACK");
        }
        this.baza.zatvoriVezu();

        return zadnjiId;
    }

    zabiljeziOdgovorNaPitanje = async function (korisnikId, pitanjeId, odgovorId) {
        this.baza.spojiSeNaBazu();
        let sqlProvjera = "SELECT * FROM Odabir WHERE idOdabir = ? AND Pitanje_idPitanje = ?;";
        let dobiveniOdabiri = await this.baza.izvrsiUpit(sqlProvjera, [odgovorId, pitanjeId]);
        if (dobiveniOdabiri.length == 0) {
            this.baza.zatvoriVezu();
            throw new Error("takav odabir ne postoji");
        }

        try {
            await this.baza.izvrsiUpit("BEGIN TRANSACTION");
            let sqlOdabiriZaPitanje = "SELECT * FROM Odabir WHERE Pitanje_idPitanje = ?;";
            let sviOdabiri = await this.baza.izvrsiUpit(sqlOdabiriZaPitanje, [pitanjeId]);
            let sql = "";
            let potrebnaBrisanja = [];
            for (let odabir of sviOdabiri) {
                sql = "DELETE FROM Odgovorio WHERE Korisnik_idKorisnik = ? AND Odabir_idOdabir = ?;";
                potrebnaBrisanja.push(this.baza.izvrsiUpit(sql, [korisnikId, odabir.idOdabir]));
            }
            await Promise.all(potrebnaBrisanja);
    
            let sqlUnos = "INSERT INTO Odgovorio VALUES (?, ?)";
            await this.baza.izvrsiUpit(sqlUnos, [korisnikId, odgovorId]);
            await this.baza.izvrsiUpit("COMMIT");
        } catch (greska) {
            await this.baza.izvrsiUpit("ROLLBACK");
        }
        this.baza.zatvoriVezu();

        return "uspjesno pohranjen odgovor";
    }
}

module.exports = PitanjaDAO;
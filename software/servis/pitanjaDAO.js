const Baza = require("./baza/baza.js");
const kodovi = require("./moduli/kodovi.js");

const polje = kodovi.dajPodatke();

class PitanjaDAO {
    constructor() {
        this.baza = new Baza("baza.sqlite");
    }

    dobijPitanjaIOdgovore = async function(str = 1, pitanjaPoStr, korime) {
        this.baza.spojiSeNaBazu();
        let sql = "SELECT Pitanje.idPitanje, Pitanje.pitanje, Korisnik.korime AS autor FROM Pitanje LEFT JOIN Korisnik ON Pitanje.Korisnik_idKorisnik = Korisnik.idKorisnik LIMIT ? OFFSET ?;";
        let pitanja = await this.baza.izvrsiUpit(sql, [pitanjaPoStr, (str - 1)*pitanjaPoStr]);

        let korId = -1;
        if (korime != null) {
            let sqlKorId = "SELECT idKorisnik FROM Korisnik WHERE korime = ?;";
            korId = (await this.baza.izvrsiUpit(sqlKorId, [korime]))[0].idKorisnik;
            for (let pitanje of pitanja) {
                if (pitanje.autor == korime) {
                    pitanje.prijavljenNapisao = true;
                }
            }
        }

        let sqlBrojPitanja = "SELECT COUNT(*) AS broj FROM Pitanje;";
        let brojPitanja = (await this.baza.izvrsiUpit(sqlBrojPitanja, []))[0].broj;
        let brojStranica = Math.ceil(brojPitanja/pitanjaPoStr);

        let potrebniOdabiri = [];
        for (let pitanje of pitanja) {
            sql = "SELECT idOdabir, tekst FROM Odabir WHERE Pitanje_idPitanje = ?;";
            potrebniOdabiri.push(this.baza.izvrsiUpit(sql, [pitanje.idPitanje]));
        }
        let dobiveniOdabiri = await Promise.all(potrebniOdabiri);
        let sqlPostoji = "";
        let imaOdgovor = false;
        for (let pitanjeId in pitanja) {
            imaOdgovor = false;
            if (korime != null) {
                for (let dobivenOdabir of dobiveniOdabiri[pitanjeId]) {
                    sqlPostoji = "SELECT * FROM Odgovorio WHERE Odabir_idOdabir = ? AND Korisnik_idKorisnik = ?;";
                    let rezultat = await this.baza.izvrsiUpit(sqlPostoji, [dobivenOdabir.idOdabir, korId]);
                    if (rezultat.length > 0) {
                        imaOdgovor = true;
                        dobivenOdabir.odgovorioPrijavljen = true;
                    }
                }

                if (pitanja[pitanjeId].prijavljenNapisao || imaOdgovor) {
                    let sqlUkupno = "SELECT COUNT(*) AS ukupnoOdg FROM Odgovorio WHERE Odabir_idOdabir IN (SELECT idOdabir FROM Odabir WHERE Pitanje_idPitanje = ?);";
                    let ukupnoOdg = await this.baza.izvrsiUpit(sqlUkupno, [pitanja[pitanjeId].idPitanje]);
                    pitanja[pitanjeId].ukupnoOdgovora = ukupnoOdg[0].ukupnoOdg;

                    let sqlBrojNaOdabir = "";
                    let potrebniBrojevi = [];
                    for (let dobivenOdabir of dobiveniOdabiri[pitanjeId]) {
                        sqlBrojNaOdabir = "SELECT COUNT(*) AS ukupnoOdg FROM Odgovorio WHERE Odabir_idOdabir = ?;";
                        potrebniBrojevi.push(this.baza.izvrsiUpit(sqlBrojNaOdabir, dobivenOdabir.idOdabir));
                    }
                    let dobiveniBrojevi = await Promise.all(potrebniBrojevi);
                    for (let dobivenOdabirId in dobiveniOdabiri[pitanjeId]) {
                        dobiveniOdabiri[pitanjeId][dobivenOdabirId].brojOdgovora = dobiveniBrojevi[dobivenOdabirId][0].ukupnoOdg;
                    }
                }
            }

            pitanja[pitanjeId].odabiri = dobiveniOdabiri[pitanjeId];

            pitanja[pitanjeId].pitanje = kodovi.decrypt(pitanja[pitanjeId].pitanje, polje[0], polje[1]);

            pitanja[pitanjeId].brojStranica = brojStranica;

            for (let odabir of pitanja[pitanjeId].odabiri) {
                odabir.tekst = kodovi.decrypt(odabir.tekst, polje[2], polje[3]);
            }
        }

        this.baza.zatvoriVezu();
        return pitanja;
    }

    postaviNovoPitanje = async function(pitanje, korime) {
        let enkPitanje = kodovi.encrypt(pitanje.pitanje, polje[0], polje[1]);
        this.baza.spojiSeNaBazu();
        let zadnjiId = 0;
        try {
            await this.baza.izvrsiUpit("BEGIN TRANSACTION");
            let sqlKorId = "SELECT idKorisnik FROM Korisnik WHERE korime = ?;";
            let korId = (await this.baza.izvrsiUpit(sqlKorId, [korime]))[0].idKorisnik;
            let sql = "INSERT INTO Pitanje (pitanje, Korisnik_idKorisnik) VALUES (?, ?);";
            await this.baza.izvrsiUpit(sql, [enkPitanje, korId]);
            let sqlId = "SELECT last_insert_rowid() AS id";
            zadnjiId = (await this.baza.izvrsiUpit(sqlId))[0].id;

            let potrebniUnosi = [];
            for (let odabir of pitanje.odabiri) {
                let enkOdabir = kodovi.encrypt(odabir.tekst, polje[2], polje[3]);
                sql = "INSERT INTO Odabir (tekst, Pitanje_idPitanje) VALUES (?, ?);";
                potrebniUnosi.push(this.baza.izvrsiUpit(sql, [enkOdabir, zadnjiId]));
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
            let dobiveniPostojeci = [];
            let vecPostojiOdabir = false;
            for (let odabir of sviOdabiri) {
                sql = "SELECT * FROM Odgovorio WHERE Korisnik_idKorisnik = ? AND Odabir_idOdabir = ?;";
                dobiveniPostojeci.push(this.baza.izvrsiUpit(sql, [korisnikId, odabir.idOdabir]));
            }
            let postojeci = await Promise.all(dobiveniPostojeci);
            for (let jedanPostojeci of postojeci) {
                if (jedanPostojeci.length > 0) {
                    throw new Error("pitanje vec odgovoreno");
                }
            }
    
            let sqlUnos = "INSERT INTO Odgovorio VALUES (?, ?)";
            await this.baza.izvrsiUpit(sqlUnos, [korisnikId, odgovorId]);
            await this.baza.izvrsiUpit("COMMIT");
        } catch (greska) {
            await this.baza.izvrsiUpit("ROLLBACK");
            throw greska;
        }
        this.baza.zatvoriVezu();

        return "uspjesno pohranjen odgovor";
    }
}

module.exports = PitanjaDAO;
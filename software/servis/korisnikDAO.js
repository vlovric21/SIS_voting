const Baza = require("./baza/baza.js");
const kodovi = require("./moduli/kodovi.js");

class KorisnikDAO {
    constructor(sol) {
        this.sol = sol;
        this.baza = new Baza("baza.sqlite");
    }

    registrirajNovogKorisnika = async function(korisnik, authToken) {
        this.baza.spojiSeNaBazu();
        let sqlKorime = "SELECT * FROM Korisnik WHERE korime = ?;";
        if ((await this.baza.izvrsiUpit(sqlKorime, [korisnik.korime])).length > 0) {
            this.baza.zatvoriVezu();
            throw new Error("korisnik s tim korisnickim imenom vec postoji");
        }

        let sqlMail = "SELECT * FROM Korisnik WHERE mail = ?;";
        if ((await this.baza.izvrsiUpit(sqlMail, [korisnik.mail])).length > 0) {
            this.baza.zatvoriVezu();
            throw new Error("korisnik s tim mailom vec postoji");
        }

        let sql = "INSERT INTO Korisnik (korime, lozinka, mail, aktivan, authToken) VALUES (?, ?, ?, 0, ?);";
        await this.baza.izvrsiUpit(sql, [korisnik.korime, kodovi.kreirajSHA512(korisnik.lozinka, this.sol), korisnik.mail, kodovi.kreirajSHA512(authToken)]);

        this.baza.zatvoriVezu();

        return korisnik.mail;
    }

    aktivirajKorisnika = async function(korime, token) {
        this.baza.spojiSeNaBazu();
        let sqlKorisnik = "SELECT * FROM Korisnik WHERE korime = ?;";
        let korisnici = await this.baza.izvrsiUpit(sqlKorisnik, [korime]);
        if (korisnici.length == 0) {
            this.baza.zatvoriVezu();
            throw new Error("korisnik s tim korisnickim imenom ne postoji");
        }
        let korisnik = korisnici[0];
        if (korisnik.aktivan == 1 || korisnik.authToken == null || korisnik.authToken == "") {
            this.baza.zatvoriVezu();
            throw new Error("korisnik je vec aktiviran");
        }

        if (kodovi.kreirajSHA512(token) != korisnik.authToken) {
            this.baza.zatvoriVezu();
            throw new Error("neispravan token");
        }

        try {
            let sql = 'UPDATE Korisnik SET aktivan = 1, authToken = "" WHERE korime = ?;';
            await this.baza.izvrsiUpit(sql, [korime]);
        } catch (error) {
            this.baza.zatvoriVezu();
            throw new Error("greska kod aktivacije");
        }

        this.baza.zatvoriVezu();

        return "uspjesna aktivacija";
    }
}

module.exports = KorisnikDAO;
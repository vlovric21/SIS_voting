const Baza = require("./baza/baza.js");
const kodovi = require("./moduli/kodovi.js");

class KorisnikDAO {
    constructor(sol) {
        this.sol = sol;
        this.baza = new Baza("baza.sqlite");
    }

    registrirajNovogKorisnika = async function(korisnik) {
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

        let sql = "INSERT INTO Korisnik (korime, lozinka, mail, aktivan) VALUES (?, ?, ?, 0);";
        await this.baza.izvrsiUpit(sql, [korisnik.korime, kodovi.kreirajSHA512(korisnik.lozinka, this.sol), korisnik.mail]);

        this.baza.zatvoriVezu();

        return korisnik.mail;
    }
}

module.exports = KorisnikDAO;
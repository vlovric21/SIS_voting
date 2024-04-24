const Baza = require("./baza/baza.js");
const kodovi = require("./moduli/kodovi.js");
const tfa = require("./moduli/2fa.js");

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

        let sql = "INSERT INTO Korisnik (korime, lozinka, mail, aktivan, authToken, tajniKljuc) VALUES (?, ?, ?, 0, ?, ?);";
        await this.baza.izvrsiUpit(sql, [korisnik.korime, kodovi.kreirajSHA512(korisnik.lozinka, this.sol), korisnik.mail, kodovi.kreirajSHA512(authToken), tfa.kreirajTajniKljuc(korisnik.korime)]);

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

        return korisnik.tajniKljuc;
    }

    provjeriPostojanjeKorisnika = async function(korime) {
        this.baza.spojiSeNaBazu();
        let sql = "SELECT * FROM Korisnik WHERE korime = ?;";
        let dobiveniKorisnici = await this.baza.izvrsiUpit(sql, [korime]);
        if (dobiveniKorisnici.length == 0) {
            this.baza.zatvoriVezu();
            throw new Error("korisnik ne postoji");
        }
        let dobivenKorisnik = dobiveniKorisnici[0];

        if (dobivenKorisnik.aktivan == 0 || (dobivenKorisnik.authToken != "" && dobivenKorisnik.authToken != null)) {
            this.baza.zatvoriVezu();
            throw new Error("korisnik nije aktiviran");
        }

        this.baza.zatvoriVezu();

        return dobivenKorisnik;
    }

    provjeriKorisnickePodatke = async function(korisnik) {
        this.baza.spojiSeNaBazu();
        let sql = "SELECT * FROM Korisnik WHERE korime = ?;";
        let dobiveniKorisnici = await this.baza.izvrsiUpit(sql, [korisnik.korime]);
        if (dobiveniKorisnici.length == 0) {
            this.baza.zatvoriVezu();
            throw new Error("korisnik ne postoji");
        }

        let dobivenKorisnik = dobiveniKorisnici[0];

        if (dobivenKorisnik.lozinka != kodovi.kreirajSHA512(korisnik.lozinka)) {
            this.baza.zatvoriVezu();
            throw new Error("neispravna lozinka");
        }

        if (dobivenKorisnik.aktivan == 0 || (dobivenKorisnik.authToken != "" && dobivenKorisnik.authToken != null)) {
            this.baza.zatvoriVezu();
            throw new Error("korisnik nije aktiviran");
        }

        if (korisnik.mail != undefined) {
            if (korisnik.mail != dobivenKorisnik.mail) {
                this.baza.zatvoriVezu();
                throw new Error("neispravan mail");
            }
        }

        if(!tfa.provjeriTOTP(korisnik.totp, dobivenKorisnik.tajniKljuc)){
            this.baza.zatvoriVezu();
            throw new Error("neispravan totp, dani: " + korisnik.totp + "a pravi je: " + tfa.dajTOTP(dobivenKorisnik.tajniKljuc));
        }

        this.baza.zatvoriVezu();

        return "uspjesna prijava";
    }

    dajIdKorisnika = async function(korime) {
        this.baza.spojiSeNaBazu();
        let sql = "SELECT idKorisnik FROM Korisnik WHERE korime = ? AND aktivan = 1;";
        let dobiveniKorisnici = await this.baza.izvrsiUpit(sql, [korime]);
        if (dobiveniKorisnici.length == 0) {
            this.baza.zatvoriVezu();
            throw new Error("ne postoji korisnik");
        }

        let id = dobiveniKorisnici[0].idKorisnik;
        this.baza.zatvoriVezu();

        return id;
    }
}

module.exports = KorisnikDAO;
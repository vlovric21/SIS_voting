const Baza = require("./baza/baza.js");
const kodovi = require("./moduli/kodovi.js");
const tfa = require("./moduli/2fa.js");

const podatci = kodovi.dajPodatkeA();

class KorisnikDAO {
    constructor(sol) {
        this.sol = sol;
        this.baza = new Baza("baza.sqlite");
    }

    registrirajOpenIDKorisnika = async function(korisnik){
        let enkMail = kodovi.encrypt(korisnik.email, podatci[0], podatci[1]);
        this.baza.spojiSeNaBazu();
        let sqlMail = "SELECT * FROM Korisnik WHERE mail = ?;";
        if((await this.baza.izvrsiUpit(sqlMail, [enkMail])).length > 0){
            this.baza.zatvoriVezu();
            throw new Error("Već imate račun s ovom mail adresom");
        }

        let sqlKorime = "SELECT * FROM Korisnik WHERE korime = ?;";
        while((await this.baza.izvrsiUpit(sqlKorime, [korisnik.korime])).length > 0){
            korisnik.korime = korisnik.korime + Math.floor(Math.random() * 1000);
        }

        let sql = "INSERT INTO Korisnik (korime, lozinka, mail, aktivan, identifikator) VALUES (?, ?, ?, ?, ?);";
        await this.baza.izvrsiUpit(sql, [korisnik.korime, 0, enkMail, 1, korisnik.id]);
        this.baza.zatvoriVezu();
        return korisnik.korime;
    }

    registrirajNovogKorisnika = async function(korisnik, authToken) {
        let enkMail = kodovi.encrypt(korisnik.mail, podatci[0], podatci[1]);
        this.baza.spojiSeNaBazu();
        let sqlKorime = "SELECT * FROM Korisnik WHERE korime = ?;";
        if ((await this.baza.izvrsiUpit(sqlKorime, [korisnik.korime])).length > 0) {
            this.baza.zatvoriVezu();
            throw new Error("korisnik s tim korisnickim imenom vec postoji");
        }

        let sqlMail = "SELECT * FROM Korisnik WHERE mail = ?;";
        if ((await this.baza.izvrsiUpit(sqlMail, [enkMail])).length > 0) {
            this.baza.zatvoriVezu();
            throw new Error("korisnik s tim mailom vec postoji");
        }

        let sql = "INSERT INTO Korisnik (korime, lozinka, mail, aktivan, authToken, tajniKljuc) VALUES (?, ?, ?, 0, ?, ?);";
        await this.baza.izvrsiUpit(sql, [korisnik.korime, kodovi.kreirajSHA512(korisnik.lozinka, this.sol), enkMail, kodovi.kreirajSHA512(authToken), tfa.kreirajTajniKljuc(korisnik.korime)]);

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

    provjeriPostojanjeMaila = async function(mail){
        let enkMail = kodovi.encrypt(mail, podatci[0], podatci[1]);
        this.baza.spojiSeNaBazu();
        let sql = "SELECT * FROM Korisnik WHERE mail = ?;";
        let dobiveniMail = await this.baza.izvrsiUpit(sql, [enkMail]);
        if(dobiveniMail.length == 0){
            this.baza.zatvoriVezu();
            return false;
        }else{
            this.baza.zatvoriVezu();
            return true;
        }
    }

    provjeriPostojanjeIdentifikatora = async function(id){
        this.baza.spojiSeNaBazu();
        let sql = "SELECT * FROM Korisnik WHERE identifikator = ?;";
        let dobiveniId = await this.baza.izvrsiUpit(sql, [id]);
        console.log('id:', id);
        console.log('dobiveniId:', dobiveniId);
        if(dobiveniId.length == 0){
            console.log("Returnam false");
            this.baza.zatvoriVezu();
            return false;
        }else{
            this.baza.zatvoriVezu();
            return true;
        }
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

        let dobiveniKorisnici;
        if (korisnik.korime != undefined) {
            let sql = "SELECT * FROM Korisnik WHERE korime = ?;";
            dobiveniKorisnici = await this.baza.izvrsiUpit(sql, [korisnik.korime]);
        } else if (korisnik.mail != undefined) {
            let sql = "SELECT * FROM Korisnik WHERE mail = ?;";
            let enkMail = kodovi.encrypt(korisnik.mail, podatci[0], podatci[1]);
            dobiveniKorisnici = await this.baza.izvrsiUpit(sql, [enkMail]);
        } else {
            this.baza.zatvoriVezu();
            throw new Error("korisnik ne postoji");
        }

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

        if (dobivenKorisnik.identifikator != null && dobivenKorisnik.identifikator != "") {
            this.baza.zatvoriVezu();
            throw new Error("korisnik ne postoji"); 
        }

        if(!tfa.provjeriTOTP(korisnik.totp, dobivenKorisnik.tajniKljuc)){
            this.baza.zatvoriVezu();
            throw new Error("Neispravan TOTP");
        }

        this.baza.zatvoriVezu();

        return dobivenKorisnik.korime;
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
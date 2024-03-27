const ds = require("fs/promises");

class HtmlUpravitelj {
    constructor (putanja) {
        this.putanja = putanja;
    }

    prijava = async (req, res) => {
        // ovdje će se odvijati redirekcija na odjavu (ili početnu bolje?) ako je već prijavljen
        res.send(await this.ucitajStranicu("/prijava.html", req));  // ovo je samo za posluživanje, nema logike
    }

    registracija = async (req, res) => {
        res.send(await this.ucitajStranicu("/registracija.html", req));  // ovo je samo za posluživanje, nema logike
    }

    pocetnaStranica = async (req, res) => { 
        // ovdje će se odvijati redirekcija na prijavu ako nije prijavljen
        res.send(await this.ucitajStranicu("/pocetna.html", req));
    }

    novoPitanje = async (req, res) => {
        // ovdje će se odvijati redirekcija na prijavu ako nije prijavljen
        res.send(await this.ucitajStranicu("/novo-pitanje.html", req));
    }

    odjava = async (req, res) => {
        // ovdje će se odvijati redirekcija na prijavu ako nije prijavljen
        res.send(await this.ucitajStranicu("/odjava.html", req)); // ovo je samo za posluživanje, nema logike
    }

    uspjesnaAktivacijaStranica = async () => {
        return await this.ucitajStranicu("/uspjesnaAktivacija.html");
    }

    neuspjesnaAktivacijaStranica = async (greska) => {
        let str = await this.ucitajStranicu("/neuspjesnaAktivacija.html");
        str = str.replace("#greska#", greska);
        return str;
    }

    ucitajStranicu = async (stranica) => {
        let stranice = [
            ds.readFile(this.putanja + stranica, "UTF-8"),
            ds.readFile(this.putanja + "/zaglavlje.html", "UTF-8"),
            ds.readFile(this.putanja + "/podnozje.html", "UTF-8")
        ];
        let [str, zag, pod] = await Promise.all(stranice);
        str = str.replace("#zaglavlje#", zag);
        str = str.replace("#podnozje#", pod);

        return str;
    }
}

module.exports = HtmlUpravitelj;
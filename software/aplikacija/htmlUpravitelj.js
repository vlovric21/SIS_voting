const ds = require("fs/promises");

class HtmlUpravitelj {
    constructor (putanja) {
        this.putanja = putanja;
    }

    pocetnaStranica = async (req, res) => {
        res.send(await this.ucitajStranicu("/pocetna.html", req));
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
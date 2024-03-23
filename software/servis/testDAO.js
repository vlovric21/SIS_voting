const Baza = require("./baza/baza.js");

class TestDAO {
    constructor() {
		this.baza = new Baza("baza.sqlite");
	}

    dobijPodatke = async function() {
        this.baza.spojiSeNaBazu();
        let sql = "SELECT TIME('now');"
        let podaci = await this.baza.izvrsiUpit(sql, []);
        this.baza.zatvoriVezu();
        return podaci;
    }
}

module.exports = TestDAO;
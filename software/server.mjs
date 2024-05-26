import express from "express";
import morgan from "morgan";
import fs from "fs";
import sesija from "express-session";
import RestTest from "./servis/restTest.js";
import RestPitanja from "./servis/restPitanja.js";
import RestKorisnik from "./servis/restKorisnik.js";
import Logging from "./logs/logging.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import HtmlUpravitelj from "./aplikacija/htmlUpravitelj.js";
import rec from "./servis/moduli/recaptcha.js";
import gsi from "./servis/moduli/gsi.js";
import RestOpenIDKorisnik from "./servis/restOpenIDKorisnik.js";

const port = 5000;
const url = `http://localhost:${port}`;

const currentModuleURL = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleURL);
const putanja = dirname(currentModulePath);

const brojPoStr = 10;
const sol = "daskfSDFTRE54w5WefDSFDSF";
const sesijaKljuc = "hgjupOIUjkhHJJghgdfGdfgewsdqwDRFhzTr54433466747RTHfdggerDr";
const jwtTajniKljuc = "dfg1334550879rEdfgDFgGETerTGFgDFre4t5dfGe4656457TRghWE34257689JNFH";
const jwtValjanost = 16;

let logPutanja = path.join(putanja, "/logs/access.log");
var logStream = fs.createWriteStream(logPutanja, { flags: 'a' })

let logging = new Logging();

const server = express();
server.use(express.urlencoded({extended: true}));
server.use(express.json());
server.use(morgan(logging.logRow, { stream: logStream }));
server.use(sesija({
    secret: sesijaKljuc,
    saveUninitialized: true,
    cookie: { maxAge: 1000*60*60*3},
    resave: false
}));

server.use("/css", express.static("./aplikacija/style.css"));
server.use("/js", express.static("./aplikacija/js"));

restPrijavaRegistracija();

server.all("*", (zahtjev, odgovor, nastavi) => {
    if(zahtjev.session.korime == null){
        odgovor.redirect("/prijava");
    }else{
        nastavi();
    }
});

restService();
app();

server.use((req, res) => {
    res.redirect("/pocetna");
});

server.listen(port, () => {
    console.log(`Server pokrenut na portu: ${port}`);
});

function restService() {
    let restTest = new RestTest();
    server.get("/api/restTest", restTest.testApi);
    
    let restPitanja = new RestPitanja(sol, brojPoStr, jwtTajniKljuc, jwtValjanost);
    server.get("/api/pitanja", restPitanja.getPitanja.bind(restPitanja));
    server.post("/api/pitanja", rec.validirajRecaptchu, restPitanja.postPitanja.bind(restPitanja));
    server.put("/api/pitanja/:pitanjeId/:odgovorId", rec.validirajRecaptchu, restPitanja.putPitanja.bind(restPitanja));
}
function restPrijavaRegistracija(){
    let restTest = new RestTest();
    let htmlUpravitelj = new HtmlUpravitelj(putanja + "/aplikacija");
    server.get("/api/restTest", restTest.testApi);

    let restKorisnik = new RestKorisnik(sol, putanja + "/aplikacija", url, jwtTajniKljuc, jwtValjanost);
    server.post("/api/korisnici", rec.validirajRecaptchu, restKorisnik.registrirajNovogKorisnika.bind(restKorisnik));
    server.get("/api/korisnici/aktiviraj/:korime", restKorisnik.aktivirajKorisnika.bind(restKorisnik));
    server.get("/api/korisnici/:korime/prijava", restKorisnik.dobijJWT.bind(restKorisnik));
    server.post("/api/korisnici/prijava", rec.validirajRecaptchu, restKorisnik.kreirajSesiju.bind(restKorisnik));

    server.get("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
    server.get("/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj)); 

    let restOpenIDKorisnik = new RestOpenIDKorisnik(sol, putanja + "/aplikacija", url, jwtTajniKljuc, jwtValjanost);
    server.post("/api/gsi", gsi.verifyOpenIDToken, restOpenIDKorisnik.prijaviOpenIDKorisnika.bind(restOpenIDKorisnik));
}

function app() {
    let htmlUpravitelj = new HtmlUpravitelj(putanja + "/aplikacija");

    server.get("/pocetna", htmlUpravitelj.pocetnaStranica.bind(htmlUpravitelj));
    server.get("/novo-pitanje", htmlUpravitelj.novoPitanje.bind(htmlUpravitelj));
    server.get("/odjava", (zahtjev, odgovor) => {
        if (zahtjev.session) {
            zahtjev.session.destroy((greska) => {});
        }
        htmlUpravitelj.odjava(zahtjev, odgovor);
    });
}
import express from "express";
import sesija from "express-session";
import RestTest from "./servis/restTest.js";
import RestPitanja from "./servis/restPitanja.js";
import RestKorisnik from "./servis/restKorisnik.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import HtmlUpravitelj from "./aplikacija/htmlUpravitelj.js";

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

const server = express();
server.use(express.urlencoded({extended: true}));
server.use(express.json());
server.use(sesija({
    secret: sesijaKljuc,
    saveUninitialized: true,
    cookie: { maxAge: 1000*60*60*3},
    resave: false
}));

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

    let restKorisnik = new RestKorisnik(sol, putanja + "/aplikacija", url, jwtTajniKljuc, jwtValjanost);
    server.post("/api/korisnici", restKorisnik.registrirajNovogKorisnika.bind(restKorisnik));
    server.get("/api/korisnici/aktiviraj/:korime", restKorisnik.aktivirajKorisnika.bind(restKorisnik));
    server.get("/api/korisnici/:korime/prijava", restKorisnik.dobijJWT.bind(restKorisnik));
    server.post("/api/korisnici/:korime/prijava", restKorisnik.kreirajSesiju.bind(restKorisnik));
    
    let restPitanja = new RestPitanja(brojPoStr);
    server.get("/api/pitanja", restPitanja.getPitanja.bind(restPitanja));
    server.post("/api/pitanja", restPitanja.postPitanja.bind(restPitanja));
}

function app() {
    let htmlUpravitelj = new HtmlUpravitelj(putanja + "/aplikacija");

    server.get("/pocetna", htmlUpravitelj.pocetnaStranica.bind(htmlUpravitelj));
}
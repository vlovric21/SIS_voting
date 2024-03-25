import express from "express";
import RestTest from "./servis/restTest.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import HtmlUpravitelj from "./aplikacija/htmlUpravitelj.js";

const port = 5000;

const currentModuleURL = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleURL);
const putanja = dirname(currentModulePath);

const server = express();
server.use(express.urlencoded({extended: true}));

server.use("/css", express.static("./aplikacija/style.css"));

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
}

function app() {
    let htmlUpravitelj = new HtmlUpravitelj(putanja + "/aplikacija");

    server.get("/pocetna", htmlUpravitelj.pocetnaStranica.bind(htmlUpravitelj));
    server.get("/novo-pitanje", htmlUpravitelj.novoPitanje.bind(htmlUpravitelj));
}
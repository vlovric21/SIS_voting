import express from "express";
import RestTest from "./servis/restTest.js";

const port = 5000;

const server = express();
server.use(express.urlencoded({extended: true}));

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
    server.use("/pocetna", express.static("./aplikacija/pocetna.html"));
}
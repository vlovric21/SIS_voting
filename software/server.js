const express = require("express");
const ds = require("fs");

const port = 5000;

const server = express();
server.use(express.urlencoded({extended: true}));

server.use("/pocetna", express.static("./aplikacija/pocetna.html"));

server.use((req, res) => {
    res.redirect("/pocetna");
});

server.listen(port, () => {
    console.log(`Server pokrenut na portu: ${port}`);
});
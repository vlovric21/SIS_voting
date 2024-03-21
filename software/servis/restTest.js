const TestDAO = require("./testDAO.js");

class RestTest {
    testApi = async function (req, res) {
        (new TestDAO()).dobijPodatke().then((podaci) => {
            res.status(200);
            res.type("application/json");
            res.send(JSON.stringify(podaci));
        }
        ).catch((greska) => {
            res.status(400);
            res.type("application/json");
            res.send(JSON.stringify({"greska": greska}));
        });
    }
}

module.exports = RestTest;
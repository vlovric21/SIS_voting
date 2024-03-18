class RestTest {
    testApi = (req, res) => {
        let testJson = {
            name: "test",
            content: [
                "one",
                "two",
                "three"
            ]
        };

        res.status(200);
        res.type("application/json");
        res.send(testJson);
    }
}

module.exports = RestTest;
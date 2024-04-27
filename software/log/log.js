const fs = require("fs");

class Log {
    logRestServiceUse = async function (req, res) {
        let method = req.method;
        let resource = req.originalUrl;
        let body = req.body;

        console.log("METHOD: " + method);
        console.log("RESOURCE: " + resource);
        console.log("BODY: " + body);
    }
}

module.exports = Log;
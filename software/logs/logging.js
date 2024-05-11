const fs = require("fs");

function checkBody (req) {
    let body = req.body;
    if (body == undefined || body == null) return "";
    else return JSON.stringify(body);
}

class Logging {
    logRow = function (tokens, req, res) {
        let body = checkBody(req);
        if (body == "{}" || body == "[]") body = "";
        if (body != "") body = ", body: " + body;

        return tokens.method(req, res)
            + " method to '"
            + tokens.url(req, res)
            + "' at "
            + tokens.date(req, res)
            + ", got status " + tokens.status(req, res)
            + " and content length "
            + tokens.res(req, res, 'content-length')
            + " in response time "
            + tokens['response-time'](req, res) + "ms"
            + body;
    }
}

module.exports = Logging;
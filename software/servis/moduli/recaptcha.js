const tajni = "6Ldl7NgpAAAAAOhjURtuBN62NhLErUUznOyzkWYk";

async function provjeriRecaptchu(token){
    let parametri = {method: 'POST'};
    let o = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${tajni}&response=${token}`, parametri);
    let status = JSON.parse(await o.text());
    console.log(status);
    if(status.success && status.score > 0.5){
        return true;
    }else{
        return false;
    }
}

exports.provjeriRecaptchu = provjeriRecaptchu;

exports.validirajRecaptchu = async function(req, res, next){
    let token = req.body.token;
    if(token == undefined || token == ""){
        res.type("application/json");
        res.status(417);
        res.send(JSON.stringify({"greska": "nedostaje recaptcha token"}));
        return;
    }
    if(!await provjeriRecaptchu(token)){
        res.type("application/json");
        res.status(417);
        res.send(JSON.stringify({"greska": "Nisi čovjek, što si..."}));
        return;
    }
    next();
}
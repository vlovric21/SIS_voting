const tajni = "6Ldl7NgpAAAAAOhjURtuBN62NhLErUUznOyzkWYk";

exports.provjeriRecaptchu = async function(token){
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
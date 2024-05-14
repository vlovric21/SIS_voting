async function handleCredentialResponse(response){
    let greska = document.getElementById("greska");

    let token = response.credential;
    console.log(token);

    let body = {
        token: token
    }

    let headers = new Headers();
    headers.set("Content-Type", "application/json");

    let res = await fetch("/api/gsi", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
    });
    
    if(res.status == 200){
        let podatci = await res.json();
        sessionStorage.setItem('username', podatci.korime);
        console.log("korime: " + podatci.korime);
        location.href = "/pocetna";
    }else{
        let responseText = (await res.text()).replace(/("|{|}|\bgreska\b|:)/g, " ");
        greska.style.display = "block";
        greska.innerHTML = `<p>${responseText}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    let form = document.getElementById("loginForm");
    let password = document.getElementById("lozinka");
    let username = document.getElementById("korime");
    let totp = document.getElementById("totp");
    let greska = document.getElementById("greska");


    form.addEventListener("submit", async (event)=> {
        event.preventDefault();
        grecaptcha.ready(function(){
            grecaptcha.execute('6Ldl7NgpAAAAAILzx0tyDFwCHgSK_Lazg-nyBhOI', {action: 'submit'}).then(async function(token){
                console.log(username.value);
                let body = {};
                if(provjeriEmail(username.value)){
                    body = {
                        mail: username.value,
                        lozinka: password.value,
                        totp: totp.value,
                        token: token
                    }
                }else{
                    body = {
                        korime: username.value,
                        lozinka: password.value,
                        totp: totp.value,
                        token: token
                    }
                }
        
                let heder = new Headers();
                heder.set("Content-Type", "application/json");

                let resSignIn = await fetch("/api/korisnici/"+ username.value + "/prijava", {
                    method: "POST",
                    headers: heder,
                    body: JSON.stringify(body)
                });
                if(resSignIn.status == 201){
                    sessionStorage.setItem('username', username.value);
                    location.href = "/pocetna";
                }else if(resSignIn.status == 417){
                    let responseText = (await resSignIn.text()).replace(/("|{|}|\bgreska\b|:)/g, " ");
                    greska.style.display = "block";
                    greska.innerHTML = `<p>${responseText}</p>`;
                }else if(resSignIn.status == 400){
                    let responseText = (await resSignIn.text()).replace(/("|{|}|\bgreska\b|:)/g, " ");
                    greska.style.display = "block";
                    greska.innerHTML = `<p>${responseText}</p>`;
                }
            });
        });
    });
});

function provjeriEmail(unos){
    let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(regexEmail.test(unos)){
        return true;
    }else return false;
}

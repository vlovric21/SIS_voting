document.addEventListener("DOMContentLoaded", async () => {
    let username = document.getElementById("username");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let greska = document.getElementById("greska")
    let retryPassword = document.getElementById("retryPasword");
    let form = document.getElementById("registration-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        grecaptcha.ready(function(){
            grecaptcha.execute('6Ldl7NgpAAAAAILzx0tyDFwCHgSK_Lazg-nyBhOI', {action: 'submit'}).then(function(token){
                let heder = new Headers();
                heder.set("Content-Type", "application/json");

                if(provjeriRegexEmail(email.value) && provjeriRegexUsername(username.value) && provjeriRegexPassword(password.value)){
        
                    let body = {
                        korime: username.value,
                        lozinka: password.value,
                        mail: email.value,
                        token: token
                    }
                    
                    if(password.value == retryPassword.value){
                        (async () => {
                            let res = await fetch("/api/korisnici", {
                                method: "POST",
                                headers: heder,
                                body: JSON.stringify(body)
                            });
                            if(res.status == 201){
                                location.href = "/prijava";
                                console.log(location);
                            }else if(res.status == 400 || res.status == 417){
                                let responseText = (await res.text()).replace(/("|{|}|\bgreska\b|:)/g, " ");
                                greska.style.display = "block";
                                greska.innerHTML = `<p>${responseText}</p>`;
                            }
                        })();
                    }else{
                        greska.style.display = "block";
                        greska.innerHTML = `<p>Lozinka i ponvljena lozinka nisu iste!</p>`;
                    }
                }
            });
        });
    });
});

function provjeriRegexUsername(username){
    if (username.length < 6) {
        greska.style.display = "block";
        greska.innerHTML = `<p>Korisničko ime mora imati minimalno 6 znakova!</p>`;
        return false;
    }
    if (username.length > 45) {
        greska.style.display = "block";
        greska.innerHTML = `<p>Korisničko ime smije imati maksimalno 45 znakova!</p>`;
        return false;
    }
    return true;
}

function provjeriRegexEmail(email){

    let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(regexEmail.test(email)){
        return true;
    }else{
        greska.style.display = "block";
        greska.innerHTML = `<p>Neispravno upisan email!</p>`;
        greska.innerHTML += `<p>Podržani oblik je xxx@xxx.xxx</p>`;
        return false;
    }
}

function provjeriRegexPassword(password){

    var regexPassword = /^(?=.*\d)(?=.*[!@#$%^&*()-_+=])[^\s]{8,}$/;
    if(regexPassword.test(password)){
        return true;
    }else{
        greska.style.display = "block";
        greska.innerHTML = `<p>Lozinka mora sadržavati minimalno 8 znakova od kojih je jedan broj i jedan posebni znak ($, #, !, ?, ^)!</p>`;
        return false;
    }
}
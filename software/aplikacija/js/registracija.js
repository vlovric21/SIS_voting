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
                        }else if(res.status == 400){
                            let responseText = (await res.text()).replace(/("|{|}|\bgreska\b|:)/g, " ");
                            greska.style.display = "block";
                            greska.innerHTML = `<p>${responseText}</p>`;
                        }
                    })();
                }else{
                    greska.style.display = "block";
                    greska.innerHTML = `<p>Lozinka i ponvljena lozinka nisu iste!</p>`;
                }
            });
        });
    });
});
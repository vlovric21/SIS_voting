document.addEventListener("DOMContentLoaded", async () => {
    let form = document.getElementById("loginForm");
    let password = document.getElementById("lozinka");
    let username = document.getElementById("korime");
    let totp = document.getElementById("totp");
    let greska = document.getElementById("greska");


    form.addEventListener("submit", async (event)=> {
        event.preventDefault();
        console.log(username.value);

        let body = {
            korime: username.value,
            lozinka: password.value,
            totp: totp.value
        }

        let heder = new Headers();
        heder.set("Content-Type", "application/json");

        let resSignIn = await fetch("/api/korisnici/"+ username.value + "/prijava", {
            method: "POST",
            headers: heder,
            body: JSON.stringify(body)
        });
        if(resSignIn.status == 201){
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
    })
});
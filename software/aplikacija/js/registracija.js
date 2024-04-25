document.addEventListener("DOMContentLoaded", async () => {
    let username = document.getElementById("username");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let retryPassword = document.getElementById("retryPassword");
    let form = document.getElementById("registration-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        let heder = new Headers();
        heder.set("Content-Type", "application/json");

        let body = {
            korime: username.value,
            lozinka: password.value,
            mail: email.value
        }

        let res = await fetch("/api/korisnici", {
            method: "POST",
            headers: heder,
            body: JSON.stringify(body)
        });
        if(res.status == 201){
            location.href = "/prijava";
            console.log(location);
        }
    });

});
document.addEventListener("DOMContentLoaded", async () => {

    dajJWT();
    
});

async function dohvatiPitanja(str){

}


async function dajJWT(){
    let odgovor = await fetch(`/api/korisnici/${sessionStorage.username}/prijava`); // Ide se na GET metodu _/api/korisnici/{korime}/prijava_ kako bi se dobio JWT
    if (odgovor.status != 201) {
        return {};
    }

    let token = odgovor.headers.get("authorization").split(" ")[1]; // Čita JWT token iz zaglavlja odgovora
    console.log(token);
    if (token == "" || token == null || token == undefined) {
        return 0; // Ukoliko nema tokena (ne postoji sesija ili slično)
    }
}
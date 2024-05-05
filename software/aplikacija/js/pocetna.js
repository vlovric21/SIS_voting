document.addEventListener("DOMContentLoaded", async () => {
    await dohvatiPitanja(1);
});

async function dohvatiPitanja(str){
    let token = await dajJWT();

    if(token != null){
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        zaglavlje.set("Authorization", `Bearer ${token}`);
        let parametri = {
            method: "GET",
            headers: zaglavlje
        }

        let odgovor = await fetch(
            `/api/pitanja?str=`+ str,
            parametri
        );

        if (odgovor.status == 200) {
            let podaci = await odgovor.text();
            podaci = JSON.parse(podaci);

            await prikaziPitanja(podaci);

           
        }
    }
}

async function dajJWT(){
    let odgovor = await fetch(`/api/korisnici/${sessionStorage.username}/prijava`);
    if (odgovor.status != 201) {
        return {};
    }
    let token = odgovor.headers.get("authorization").split(" ")[1];
    if (token == "" || token == null || token == undefined) {
        return 0;
    }else return token;
}

async function prikaziPitanja(pitanja){
    let listaPitanja = document.getElementById("lista-pitanja");
    let lista = "";
    for (let p of pitanja){
        lista += '<div id="pitanje" class="kartica-pitanja">';
        lista += `<div class="autor">Autor: ${p.autor}</div>`;
        lista += `<h2 class="naslov-pitanja">${p.pitanje}</h2>`
        lista += `<form id="${p.idPitanje}" action="#">
                    <div id="odgovori${p.idPitanje}" class="odgovori">
                    </div>
                    <button type="submit">Pošalji</button>
                </form>
            </div>`;
    }

	listaPitanja.innerHTML = lista;

    pitanja.forEach(async pitanje => {
        await prikaziOdgovore(pitanje);
    });

    await postaviSlusace();
}

async function prikaziOdgovore(pitanje){
    let odabiri = document.getElementById(`odgovori${pitanje.idPitanje}`);
    let listaOdg = "";
    for (let o of pitanje.odabiri){
        listaOdg += `<input type="radio" id="${o.idOdabir}" name="odgovor" value="odgovor${o.idOdabir}"><label for="${o.idOdabir}">${o.tekst}</label><br>`;
    }
    odabiri.innerHTML = listaOdg;
}

async function postaviSlusace(){
    let forme = document.querySelectorAll("form");

    forme.forEach(form => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            let trenutnaForma = event.target;
            let odgovori = trenutnaForma.querySelectorAll('input[type="radio"]');
            let odabraniOdg = null;
            odgovori.forEach(element => {
                if(element.checked)
                    odabraniOdg = element;
            });
            await posaljiOdgvor(trenutnaForma.id, odabraniOdg.id);
        });
        
    });
}

async function posaljiOdgvor(pitanjeId, odgovorId){
    let token = await  dajJWT();

    if(token != null){
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        zaglavlje.set("Authorization", `Bearer ${token}`);
        let parametri = {
            method: "PUT",
            headers: zaglavlje
        }
        console.log(`/api/pitanja/${pitanjeId}/${odgovorId}`);
        let odgovor = await fetch(
            `/api/pitanja/${pitanjeId}/${odgovorId}`,
            parametri
        );

        if (odgovor.status == 201) {
            console.log("Uspjesno slanje!");
        }else{
            console.log("Nije dobro mraleeee");
        }
    }
}
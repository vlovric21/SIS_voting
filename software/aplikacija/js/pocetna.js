document.addEventListener("DOMContentLoaded", async () => {
    dohvatiPitanja(1);
    
});

async function dohvatiPitanja(str){
    let token = await  dajJWT();

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

            prikaziPitanja(podaci);
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
    let counter = 1;
    let lista = "";
    for (let p of pitanja){
        lista += '<div id="pitanje" class="kartica-pitanja">';
        lista += `<div class="autor">Autor: ${p.autor}</div>`;
        lista += `<h2 class="naslov-pitanja">${p.pitanje}</h2>`
        lista += `<form id="pitanje${counter}" action="#">
                    <div id="odgovori${counter}" class="odgovori">
                    </div>
                    <button type="button">Dalje</button>
                </form>
            </div>`;
            counter ++;
    }

	listaPitanja.innerHTML = lista;

    for (let i = 0; i < pitanja.length; i++) {
        await prikaziOdgovore(pitanja[i], i + 1);
    }
}

async function prikaziOdgovore(pitanje, counter){
    let odabiri = document.getElementById(`odgovori${counter}`);
    let ctrOdg = 1;
    let listaOdg = "";
    for (let o of pitanje.odabiri){
        listaOdg += `<input type="radio" id="odgovor${ctrOdg}" name="odgovor" value="odgovor${ctrOdg}">
        <label for="odgovor${ctrOdg}">${o.tekst}</label><br>`;
        ctrOdg ++;
    }
    odabiri.innerHTML = listaOdg;
}
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
	let lista = '<div id="pitanje" class="kartica-pitanja">';
    for (p of pitanja){
        lista += `<div class="autor">Autor: ${p.autor}</div>`;
        lista += `<h2 class="naslov-pitanja">${p.pitanje}</h2>`
        lista += `<form id="pitanje1" action="#">
                    <div id="odgovori1" class="odgovori">
                    ${prikaziOdgovore(p)}
                    </div>
                    <button type="button">Dalje</button>
                </form>`;
    }

	listaPitanja.innerHTML = lista;
}

async function prikaziOdgovore(pitanje){
    let odgovori = document.getElementById("odgovori1");
    let listaOdg = "";
    for (o of pitanje){
        listaOdg += `<input type="radio" id="odgovor1" name="odgovor" value="odgovor1">
        <label for="odgovor1">Odgovor 1</label><br>`;
    }
    odgovori.innerHTML = listaOdg;
}
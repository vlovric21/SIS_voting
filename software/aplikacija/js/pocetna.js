let stranica = 1;
let maxStr = 1;

document.addEventListener("DOMContentLoaded", async () => {
    let pocetak = document.getElementById("pocetak");
    let prethodnaStranica = document.getElementById("prethodnaStranica");
    let trenutnaStranica = document.getElementById("trenutnaStranica");
    let sljedecaStranica = document.getElementById("sljedecaStranica");
    let kraj = document.getElementById("kraj");
    
    
    await dohvatiPitanja(stranica);
    pocetak.style.display = "none";
    prethodnaStranica.style.display = "none";

    pocetak.addEventListener("click", async () =>
    {
        stranica = 1;
        await dohvatiPitanja(stranica);
        trenutnaStranica.innerText = stranica;
        pocetak.style.display = "none";
        prethodnaStranica.style.display = "none";
        sljedecaStranica.style.display = "block";
        kraj.style.display = "block";
    });
    prethodnaStranica.addEventListener("click", async () =>
    {   stranica --;
        await dohvatiPitanja(stranica);
        trenutnaStranica.innerText = stranica;
        if(stranica === 1){
            pocetak.style.display = "none";
            prethodnaStranica.style.display = "none";
        }else{
            pocetak.style.display = "block";
            prethodnaStranica.style.display = "block";
        }
        sljedecaStranica.style.display = "block";
        kraj.style.display = "block";

    });
    sljedecaStranica.addEventListener("click", async () =>
    {   stranica ++;
        await dohvatiPitanja(stranica);
        trenutnaStranica.innerText = stranica;
        if (stranica >= maxStr) {
            sljedecaStranica.style.display = "none";
            kraj.style.display = "none";
        } else {
            sljedecaStranica.style.display = "block";
            kraj.style.display = "block";
        }
        pocetak.style.display = "block";
        prethodnaStranica.style.display = "block";
    });
    kraj.addEventListener("click", async () =>
    {
        stranica = maxStr;
        await dohvatiPitanja(stranica);
        trenutnaStranica.innerText = stranica;
        sljedecaStranica.style.display = "none";
        kraj.style.display = "none";
        pocetak.style.display = "block";
        prethodnaStranica.style.display = "block";

    });
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
            if(maxStr === 1){
                maxStr = podaci[0].brojStranica;
            }

            await prikaziPitanja(podaci);
            await postaviStilZaAutora(podaci);
           
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
        let brOdgovora = "0";
        if(p.ukupnoOdgovora != undefined){
            brOdgovora = p.ukupnoOdgovora;
        }
        lista += '<div id="pitanje" class="kartica-pitanja">';
        lista += `<div class="autor">Autor: ${p.autor}</div>`;
        lista += `<h2 class="naslov-pitanja">${p.pitanje}</h2>`
        lista += `<form id="${p.idPitanje}" action="#">
                    <div id="odgovori${p.idPitanje}" class="odgovori">
                    </div>
                    <button id="posalji${p.idPitanje}" type="submit">Pošalji</button>
                </form>
                <h4>Ukupan broj odgovora: ${brOdgovora}</h4>
            </div>`;
    }

	listaPitanja.innerHTML = lista;

    pitanja.forEach(async pitanje => {
        await prikaziOdgovore(pitanje);
        if(pitanje.ukupnoOdgovora != undefined){
            let posalji = document.getElementById(`posalji${pitanje.idPitanje}`);
            posalji.style.display = "none";
        }
    });

    await postaviSlusace();
}

async function prikaziOdgovore(pitanje){
    let odabiri = document.getElementById(`odgovori${pitanje.idPitanje}`);
    let listaOdg = "";
    for (let o of pitanje.odabiri){
        listaOdg += `<input type="radio" id="${o.idOdabir}" name="odgovor" value="odgovor${o.idOdabir}">`;
        listaOdg += `<label for="${o.idOdabir}">${o.tekst}</label>`;
        listaOdg += `<div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${calculateProgressBarWidth(o.brojOdgovora, pitanje.ukupnoOdgovora)};"></div>
                        <label class="statistikaOdgovora" for="${o.idOdabir}">${o.brojOdgovora} odgovora</label>
                    </div><br>`;
    }
    odabiri.innerHTML = listaOdg;
}

function calculateProgressBarWidth(numResponses, totalResponses) {
    let maxWidth = 80;
    let width = (numResponses / totalResponses) * maxWidth;
    return `${width}%`;
}

async function postaviSlusace(){
    let forme = document.querySelectorAll("form");

    forme.forEach(form => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            grecaptcha.ready(function() {
                grecaptcha.execute('6Ldl7NgpAAAAAILzx0tyDFwCHgSK_Lazg-nyBhOI', {action: 'submit'}).then(async function(token) {
                    let trenutnaForma = event.target;
                    let odgovori = trenutnaForma.querySelectorAll('input[type="radio"]');
                    let odabraniOdg = null;
                    odgovori.forEach(element => {
                        if(element.checked)
                            odabraniOdg = element;
                    });
                    if(odabraniOdg != null){
                        await posaljiOdgvor(trenutnaForma.id, odabraniOdg.id, token);
                    }else{
                        alert("Odaberite odgovor!");
                    }
                });
                });
            });
    });
}

async function posaljiOdgvor(pitanjeId, odgovorId, recToken){
    let token = await dajJWT();

    if(token != null){
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        zaglavlje.set("Authorization", `Bearer ${token}`);
        let parametri = {
            method: "PUT",
            headers: zaglavlje,
            body: JSON.stringify({ token: recToken })
        }
        let odgovor = await fetch(
            `/api/pitanja/${pitanjeId}/${odgovorId}`,
            parametri
        );

        if (odgovor.status == 201) {
            location.reload();
            let responseText = (await odgovor.text()).replace(/("|{|}|\bgreska\b|:)/g, " ");
            console.log(responseText);
        }else{
            let responseText = (await odgovor.text()).replace(/("|{|}|\bgreska\b|:)/g, " ");
            console.log(responseText);
        }
    }
}

async function postaviStilZaAutora(pitanja){
    pitanja.forEach(async pitanje => {
        let karticaPitanja = document.getElementById(pitanje.idPitanje).parentNode;
        if(pitanje.prijavljenNapisao){
            karticaPitanja.classList.add("autorovoPitanje");
        }
    });
}
document.addEventListener("DOMContentLoaded", async () => {
    let form = document.getElementById("formaNovoPitanje");

    jednostrukiOdgovori();


    form.addEventListener("submit", async (event) =>{
        event.preventDefault();

        await posaljiNovoPitanje();
    });
});

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

async function posaljiNovoPitanje(){
    let token = await dajJWT();
    let naslovPitanja = document.getElementById("pitanje-input");

    let tijelo ={
        pitanje: naslovPitanja.value,
        odabiri: await generirajOdgovoreZaSlanje()
    }
    console.log(tijelo);

    if(token != null){
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        zaglavlje.set("Authorization", `Bearer ${token}`);
        let parametri = {
            method: "POST",
            headers: zaglavlje,
            body: JSON.stringify(tijelo)
        }

        let odgovor = await fetch(
            `/api/pitanja`,
            parametri
        );

        if (odgovor.status == 201) {
            location.href = "/pocetna";
            let responseText = (await odgovor.text()).replace(/("|{|}|\bgreska\b|:)/g, " ");
            console.log(responseText);
        }else{
            let responseText = (await odgovor.text()).replace(/("|{|}|\bgreska\b|:)/g, " ");
            console.log(responseText);
        }
    }
}

async function generirajOdgovoreZaSlanje(){
    let opcije = document.getElementsByClassName("jedna-opcija");
    let poljeOdabira = [];

    try {
        await Array.from(opcije).forEach(async (opcija) => {
            let jedanOdabir = {
                tekst: opcija.children[0].value
            };
            poljeOdabira.push(jedanOdabir);
        });
        return poljeOdabira;
    } catch (error) {
        console.error('Error in generirajOdgovoreZaSlanje:', error);
        return []; 
    }
}

function jednostrukiOdgovori(){
    let odgovori = document.getElementById("odgovori");
    let vrijednosti = [];

    odgovori.innerHTML = "<h2>Dodaj izbor</h2>";

    odgovori.innerHTML += "<input id='opcijaInput' class='dodaj-izbor' type='text' placeholder ='Opcija'>";
    odgovori.innerHTML += "<button id='addButton' type='button' class='vrsta-odgovora'>+</button><br>";

    let dodajJednostruki = document.getElementById("addButton");
    var brojac = 1;
    dodajJednostruki.addEventListener("click", () =>{
        let vrijednostOpcija = document.getElementById("opcijaInput").value;
        let provjeraVrijednosti = true;
        
            vrijednosti.forEach((element)=>{
                if(element === vrijednostOpcija)
                provjeraVrijednosti = false;
            });

            
        if(brojac <= 10 && provjeraVrijednosti && vrijednostOpcija != ""){
            vrijednosti.push(vrijednostOpcija);
            brojac ++;

            let divOpcija = document.createElement("div");
            divOpcija.setAttribute("class", "jedna-opcija");

            let radioInput = document.createElement("input");
            radioInput.setAttribute("type", "radio");
            radioInput.setAttribute("name", "opcija")
            radioInput.setAttribute("value", vrijednostOpcija);
            radioInput.setAttribute("id", `opcija${brojac}`);
    
            let label = document.createElement("label");
            label.setAttribute("for", `opcija${brojac}`);
            label.innerText = vrijednostOpcija;

            let deleteButton = document.createElement("button");
            deleteButton.innerText = "Izbiši";

            deleteButton.addEventListener("click", () => {
                odgovori.removeChild(divOpcija);
                brojac--;
            });
    
            divOpcija.appendChild(radioInput);
            divOpcija.appendChild(label);
            divOpcija.appendChild(deleteButton);

            odgovori.appendChild(divOpcija);
            
            document.getElementById("opcijaInput").value = "";
        }
    });
}

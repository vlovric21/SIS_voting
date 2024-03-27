document.addEventListener("DOMContentLoaded", async () => {
    let jednostrukiGumb = document.getElementById("jednostruki-gumb");
    let visestrukiGumb = document.getElementById("visestruki-gumb");

    jednostrukiGumb.addEventListener("click", () =>{
        jednostrukiOdgovori();
    });
    visestrukiGumb.addEventListener("click", () =>{
        visestrukiOdgovori();
    });
    

});

function jednostrukiOdgovori(){
    let odgovori = document.getElementById("odgovori");
    let vrijednosti = [];

    odgovori.innerHTML = "<h2>Dodaj jednostruki izbor</h2>";

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
    
            let razmak = document.createElement("br");
    
            odgovori.appendChild(radioInput);
            odgovori.appendChild(label);
            odgovori.appendChild(razmak);
            divOpcija.appendChild(radioInput);
            divOpcija.appendChild(label);
            divOpcija.appendChild(deleteButton);

            odgovori.appendChild(divOpcija);
            
            document.getElementById("opcijaInput").value = "";
        }
    });
}

function visestrukiOdgovori(){
    let odgovori = document.getElementById("odgovori");
    let vrijednosti = [];

    odgovori.innerHTML = "<h2>Dodaj višestruki izbor</h2>";

    odgovori.innerHTML += "<input id='opcijaInput' class='dodaj-izbor' type='text' placeholder ='Opcija'>";
    odgovori.innerHTML += "<button id='addButton' type='button' class='vrsta-odgovora'>+</button><br>";

    let dodajVisestruki = document.getElementById("addButton");
    var brojac = 1;
    dodajVisestruki.addEventListener("click", () =>{
        let vrijednostOpcija = document.getElementById("opcijaInput").value;
        let provjeraVrijednosti = true;
        
            vrijednosti.forEach((element)=>{
                if(element === vrijednostOpcija)
                provjeraVrijednosti = false;
            });

        vrijednosti.push(vrijednostOpcija);
        brojac ++;

        if(brojac <= 10 && provjeraVrijednosti && vrijednostOpcija != ""){

            let radioInput = document.createElement("input");
            radioInput.setAttribute("type", "checkbox");
            radioInput.setAttribute("name", vrijednostOpcija)
            radioInput.setAttribute("value", vrijednostOpcija);
            radioInput.setAttribute("id", `opcija${brojac}`);
    
            let label = document.createElement("label");
            label.setAttribute("for", `opcija${brojac}`);
            label.innerText = vrijednostOpcija;
    
            let razmak = document.createElement("br");
    
            odgovori.appendChild(radioInput);
            odgovori.appendChild(label);
            odgovori.appendChild(razmak);
            
            document.getElementById("opcijaInput").value = "";
        }
    });
}

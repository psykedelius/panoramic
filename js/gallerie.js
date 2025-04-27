
let selectedBtnId = null;
let oldImg = null;

//
//initial setup parse data from json
//
function setupGallerie(datas) {
    console.log("setupGallerie");
    gallerieContainer     = document.getElementById("gallerie-container");
    gallerieZoneContainer = document.getElementById("gallerie-zone");

    //scroll Up//
    const upArrowBtn       = document.createElement("button");
    upArrowBtn.id          = `btn-upArrow`;
    upArrowBtn.textContent = `upArrow`;
    upArrowBtn.classList.add ("upArrow");
    upArrowBtn.addEventListener("click", () => {
        scrollToElement(0); 
    });  
    //on défini le parent du btn upArrow
    gallerieZoneContainer.insertBefore(upArrowBtn, gallerieContainer);

    
    //scroll Gallerie//
    let imgCounter = 0;
    datas.forEach(feature => {
        imgCounter+=1;
        const name = feature.properties.name;
        const imgName = name + "_1.jpg";

        // Créer un bouton
        let btn = document.createElement("button");
        btn.id = "btn-" + imgCounter;
        btn.classList.add("btn-image");

        // Ajouter une image au bouton
        let img = document.createElement("img");
        img.src = "../img/" + imgName;

        btn.appendChild(img);
        gallerieContainer.appendChild(btn);

        // Ajouter un event listener spécifique à chaque bouton
        btn.addEventListener("click", () => {
            selectedBtnId = btn.id;
            highlightSelected(btn);
            displayImg(feature, "_1"); // Utilise la bonne feature
        }); 
    //
    });

    //scroll Down
    const downArrowBtn = document.createElement("button"); 
    downArrowBtn.id = `btn-downArrow`;
    downArrowBtn.textContent = `downArrow`;
    downArrowBtn.classList.add("upArrow"); 
    gallerieZoneContainer.appendChild(downArrowBtn); 
    downArrowBtn.addEventListener("click", () => {
        scrollToElement(gallerieContainer.scrollHeight-gallerieContainer.clientHeight); 
    });  

    //
    //Gallery menu behaviour
    //
    //check scroll state
    gallerieContainer.addEventListener("scroll", () => {
        console.log("scroll ",(gallerieContainer.scrollTop) + " " + (gallerieContainer.scrollHeight-gallerieContainer.clientHeight));
        let scrollMax = gallerieContainer.scrollHeight-gallerieContainer.clientHeight;
        if (gallerieContainer.scrollTop == 0) {
            upArrowBtn.style.visibility= "hidden"; // Hide the button
        } else {
            upArrowBtn.style.visibility = "visible"; // Show the button
        } 
        if (gallerieContainer.scrollTop  >= scrollMax-1) {
            downArrowBtn.style.visibility= "hidden"; // Hide the button
        } else {
            downArrowBtn.style.visibility = "visible"; // Show the button
        } 

    });

    const renderTypeContainer = document.getElementById("renderTypeContainer");  
    console.log("renderTypeContainer ",renderTypeContainer);
    gallerieZoneContainer.appendChild(renderTypeContainer); 


        //Display first image
        displayImg (datas[0],"_1");
}


//
function highlightSelected(selectedBtn) {
    gallerieContainer = document.getElementById("gallerie-container");
    const buttons = gallerieContainer.querySelectorAll("button"); // Récupère tous les boutons dans le conteneur

    buttons.forEach(btn => {
        if (selectedBtn === btn) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    });
}

function scrollToElement(scrollTarget) { 
    console.log("scrollToElement ",gallerieContainer);
    document.getElementById("gallerie-container").scrollTo({
        top: scrollTarget,
        behavior: "smooth"
    });
}

function getMainColor(imgElement, parentElement) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Définir la taille du canvas en fonction de l'image
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;

    // Dessiner l'image sur le canvas
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

    // Récupérer les pixels de l'image
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let r = 0, g = 0, b = 0, total = 0;

    // Parcourir les pixels (en sautant certains pour optimiser)
    for (let i = 0; i < imageData.length; i += 4 * 100) { // Prendre 1 pixel sur 100
        r += imageData[i];     // Rouge
        g += imageData[i + 1]; // Vert
        b += imageData[i + 2]; // Bleu
        total++;
    }

    // Moyenne des couleurs
    r = Math.floor(r / total);
    g = Math.floor(g / total);
    b = Math.floor(b / total);

    // Appliquer la couleur au parent
    parentElement.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}
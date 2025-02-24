
let selectedBtnId = null;

//
//initial setup parse data from json
//
function setupGallerie(datas) {
    console.log("setupGallerie");
    const gallerieContainer     = document.getElementById("gallerie-container");
    const gallerieZoneContainer = document.getElementById("gallerie-zone");
    //scroll Up
    const upArrowBtn       = document.createElement("button");
    upArrowBtn.id          = `btn-upArrow`;
    upArrowBtn.textContent = `upArrow`;
    upArrowBtn.classList.add ("upArrow");
    upArrowBtn.addEventListener("click", () => {
        scrollToElement(0); 
    });  

    //gallerieZoneContainer.appendChild(upArrowBtn);
    gallerieZoneContainer.insertBefore(upArrowBtn, gallerieContainer);
    let imgCounter = 0;
    //scroll Gallerie
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
    });

//
//Display new image in gallery
//
function displayImg(feature, phase) {
    const title             = document.getElementById("img-title");
    const viewport          = document.getElementById("viewport");
    const phaseBtnContainer = document.getElementById("phase-Btn-Container");
    
    const { phaseCount, name } = feature.properties;
    //reset title content
    title.innerText = name;
    
    //generate image name
    const imgName = `${name}${phase}.jpg`;
    const newImg = new Image();
    newImg.src = `../img/${imgName}`;
    newImg.alt = name;
    newImg.classList.add('phase-img');

    const selectedBtn     = document.getElementById(selectedBtnId);
    if (selectedBtn!=null){
        console.log("selectedBtn ",selectedBtn); 
        selectedBtn.classList.add("selected"); 
    }


    // wait for image to be loaded befor adding it to the DOM
    newImg.onload = () => {
        const oldImg = viewport.querySelector('img');
        if (oldImg) {
            oldImg.classList.remove('fade-in');
            oldImg.classList.add('fade-out');
            setTimeout(() => oldImg.remove(), 500); // Correspond à la durée de la transition CSS
        }
        
        viewport.appendChild(newImg);
        // Petit délai pour assurer que la transition se déclenche
        requestAnimationFrame(() => {
            newImg.classList.add('fade-in');
        });
    };

    // Gestion d'erreur de chargement
    newImg.onerror = () => {
        console.error(`Erreur de chargement de l'image: ${imgName}`);
    };

    phaseBtnContainer.innerHTML = ""; 

    for (let i = 1; i < phaseCount+1; i++) {
        const btn = document.createElement("button");
        btn.id = `btn-phase_${i}`;
        btn.classList.add("btn-phase");
        btn.textContent = `Phase ${i}`; // Ajout d'un texte pour les boutons
        phaseBtnContainer.appendChild(btn);

        btn.addEventListener("click", () => {
            displayImg(feature, `_${i}`); 
        });
    } 
}


//
function highlightSelected(selectedBtn) {
    const gallerieContainer = document.getElementById("gallerie-container");
    const buttons = gallerieContainer.querySelectorAll("button"); // Récupère tous les boutons dans le conteneur

    buttons.forEach(btn => {
        if (selectedBtn === btn) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    });
}



//
//Gallery menu behaviour
//
    //scroll Down
    const downArrowBtn = document.createElement("button");
    downArrowBtn.id = `btn-downArrow`;
    downArrowBtn.textContent = `downArrow`;
    downArrowBtn.classList.add("upArrow");
    gallerieZoneContainer.appendChild(downArrowBtn); 

    downArrowBtn.addEventListener("click", () => {
        scrollToElement(gallerieContainer.scrollHeight-gallerieContainer.clientHeight); 
    });  
    function scrollToElement(scrollTarget) { 
        console.log("scrollToElement ",gallerieContainer);
        document.getElementById("gallerie-container").scrollTo({
            top: scrollTarget,
            behavior: "smooth"
        });
    }
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
    

    //Display first image
    displayImg (datas[0],"_1");
    
}




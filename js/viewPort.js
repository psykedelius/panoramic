//
//Display new image in gallery
//
function displayImg(feature, phase) {
    const title             = document.getElementById("img-title");
    const phaseBtnContainer = document.getElementById("phase-Btn-Container");
    console.log("displayImg ",feature); 
    const { phaseCount, name } = feature.properties;
    //reset title content
    title.innerText = name;
    
    //generate image name
    const imgName = `${name}${phase}.jpg`;
    const newImg = new Image();
    newImg.id = "imgA";
    newImg.src = `../img/${imgName}`;
    newImg.alt = name;
    newImg.classList.add('phase-img');
    newImg.classList.add('shadow');
    const selectedBtn     = document.getElementById(selectedBtnId);
    if (selectedBtn!=null){
        console.log("selectedBtn ",selectedBtn); 
        selectedBtn.classList.add("selected"); 
    }


    // wait for image to be loaded befor adding it to the DOM
    newImg.onload = () => {
        let modeA = true; 
        
        if (modeA) {
            
            if (oldImg) {
                oldImg.src = newImg.src;
                oldImg.classList.remove('fade-in');
                oldImg.classList.add('fade-out');
                setTimeout(() => oldImg.remove(), 500); // Correspond à la durée de la transition CSS
            } else{
                oldImg = document.createElement("img-comparison-slider");
                oldImg.src = newImg.src;
            }
            const comparisionSlider = document.createElement("img-comparison-slider");
            comparisionSlider.classList.add('center');
            const imgA = document.createElement("img");
            const imgB = document.createElement("img");
            imgA.slot = "first";
            imgA.src = newImg.src;
            comparisionSlider.appendChild(imgA);
            imgB.slot = "second";
            imgB.src = oldImg.src;
            comparisionSlider.appendChild(imgB); 
            viewport.appendChild(comparisionSlider);
            oldImg = newImg;
        } 
        else 
        { 
            if (oldImg) {
                oldImg.classList.remove('fade-in');
                oldImg.classList.add('fade-out');
                setTimeout(() => oldImg.remove(), 500); // Correspond à la durée de la transition CSS
            }  
            viewport.appendChild(newImg);
            getMainColor(newImg, viewport);
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
}

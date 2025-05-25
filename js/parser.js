const datas = [];
let options = [];
fetch(baseUrl+'/json/datas.json')
    .then(response => response.json())
    .then(geoObject => {
        // Maintenant tu peux utiliser les données
        var features = geoObject.features;
        var phaseOptions  = geoObject.phaseOptions; 

        // Convert key-value pairs into an array of objects
        Object.entries(phaseOptions).forEach(([key, value]) => {
            options.push({ key: key, value: value });
            
        });
        console.log("parser.options phaseOptions ",phaseOptions);


        features.forEach(feature => {
            // Fais quelque chose avec chaque feature ici
            datas.push(feature);
           // console.log(datas);
            
            
        });
        setupGallerie(datas);
    })
    .catch(error => console.error('Erreur lors du chargement du fichier JSON :', error));

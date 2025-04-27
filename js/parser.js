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
        /*console.log("parser.phaseOptions ",option);
        Object.values(geoObject.phaseOptions).forEach(option => {
            // Fais quelque chose avec chaque feature ici
            options.push(option);
            // Find the key for the value "Scenario A"
            const keyName = Object.keys(phaseOptions).find(key => phaseOptions[key] === option);
            console.log("parser.options keyName ",keyName," ",option);
        });*/
       


        features.forEach(feature => {
            // Fais quelque chose avec chaque feature ici
            datas.push(feature);
           // console.log(datas);
            
            
        });
        setupGallerie(datas);
    })
    .catch(error => console.error('Erreur lors du chargement du fichier JSON :', error));

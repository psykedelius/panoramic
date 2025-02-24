const datas = [];

fetch('../json/datas.json')
    .then(response => response.json())
    .then(geoObject => {
        // Maintenant tu peux utiliser les données
        var features = geoObject.features;
        
        features.forEach(feature => {
            // Fais quelque chose avec chaque feature ici
            datas.push(feature);
           // console.log(datas);
            
            
        });
        setupGallerie(datas);
    })
    .catch(error => console.error('Erreur lors du chargement du fichier JSON :', error));

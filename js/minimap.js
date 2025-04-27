// On initialise la latitude et la longitude de Paris (centre de la carte)
var lat = 47.471000;
var lon = -0.568132 ;
var macarte = null;
let markers = [];
let curMarker = null;

var locationIcon = L.icon({
    iconUrl: 'img/locationPOI.png', 
    iconSize:     [24, 24], // size of the icon 
    iconAnchor:   [12, 12], // point of the icon which will correspond to marker's location 
   // popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
});
var curLocationIcon = L.divIcon({ 
    iconSize:     [24, 24], // size of the icon 
    iconAnchor:   [12, 12], // point of the icon which will correspond to marker's location 
   // popupAnchor:  [0, -10], // point from which the popup should open relative to the iconAnchor
    className: 'fov-marker-container',
     html: '<img class="fov-marker-img" src="img/locationPOI.png" width="24" height="24" />'
});
// Fonction d'initialisation de la carte
function initMap() {
    // Créer l'objet "macarte" et l'insérer dans l'élément HTML qui a l'ID "map"
    macarte = L.map('map').setView([lat, lon], 11);
    // Leaflet ne récupère pas les cartes (tiles) sur un serveur par défaut. Nous devons lui préciser où nous souhaitons les récupérer. Ici, openstreetmap.fr
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', { 
        minZoom: 14,
        maxZoom: 18
    }).addTo(macarte);
   
}

function addMarker(lat, lon,imgName, name, northOffset) {
    // Créer un marqueur à la position spécifiée
    var marker = L.marker([lat, lon],{icon: locationIcon}).addTo(macarte);
    marker.on('click', function(e) {
        
        clicLeafletMarker(imgName, name, northOffset);
        updateMarkerDisplay(e.target); 
    });
    markers.push(marker);

    // Simuler un clic si c’est le premier marqueur  
    if (markers.length === 1) {
        marker.fire('click');
        curMarker = marker;
    }
    // Ajouter une popup au marqueur
    //marker.bindPopup("Je suis ici !").openPopup();
}
function updateMarkerDisplay(clickedMarker) {
    
    markers.forEach(marker => {
        if (marker === clickedMarker) {
            curMarker = clickedMarker;
            const rotIcon = L.divIcon({
                className: 'fov-marker-container',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                html: '<img class="fov-marker-img" src="img/curLocationPOI.png" width="24" height="24" />'
            });
            marker.setIcon(rotIcon);
        }else {
            marker.setIcon(locationIcon);
        }
    });

}

initMap();
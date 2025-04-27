class img360 {
    name;
    constructor(feature){
        this.name = feature.properties.name;  
        this.imgName = feature.properties.imgName;
        this.northOffset = feature.properties.northOffset; 
        this.coords   = feature.geometry.coordinates;
        this.btnMinimap = "";
        this.element;
    }
    crossfadeImg(){
    }
}

let img360List = []; 
let setupIsDone = false;
function setupGallerie(datas){
    datas.forEach(data => {
        let img = new img360(data);
        addMarker(img.coords[0], img.coords[1],img.imgName, img.name, img.northOffset);
        img360List.push(img);
    }); 
    
    setupIsDone = true;
    
}
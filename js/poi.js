let poiList = [] // Liste des POIs à afficher
function clearAllPois() {
    poiList.forEach(poi => {
      scene.remove(poi)
      poi.geometry.dispose()
      poi.material.dispose()
    })
    poiList.length = 0 // Clear the array
  }
//Add Poi
function createPoi (position, color, size) {
    
    const geometry = new THREE.SphereGeometry(size, 32, 32)
    const material = new THREE.MeshBasicMaterial({ color: color })
    const sphere = new THREE.Mesh(geometry, material)
  
    // Place the POI directly at the given position (on the sphere surface)
    sphere.position.copy(position)
  
    // Optional: face the center of the sphere
    sphere.lookAt(new THREE.Vector3(0, 0, 0))
  
    // Store and add
    poiList.push(sphere)
    scene.add(sphere)
  
    console.log('POI placed at: ', position)
    return sphere
}


function latLngToCartesian(lat, lon, radius = 790) {
    const phi = THREE.MathUtils.degToRad(90 - lat)   // polar angle
    const theta = THREE.MathUtils.degToRad(lon + 180) // azimuthal angle
  
    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)
  
    return new THREE.Vector3(x, y, z)
  }
  function latLngToDirectionVector(currentLat, currentLng, targetLat, targetLng, northOffset = 0, radius = 790) {
    // Calculate azimuth from current to target
    const dLng = THREE.MathUtils.degToRad(targetLng - currentLng)
    const dLat = THREE.MathUtils.degToRad(targetLat - currentLat)

    const x = Math.sin(dLng)
    const z = Math.cos(dLng)
    const direction = new THREE.Vector3(x, 0, z).normalize()

    // Apply north offset (positive angle)
    const offsetRad = THREE.MathUtils.degToRad(northOffset)
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), offsetRad)

    return direction.multiplyScalar(radius)
}
  function bearingToVector(lat1, lon1, lat2, lon2) {
    const φ1 = THREE.MathUtils.degToRad(lat1)
    const φ2 = THREE.MathUtils.degToRad(lat2)
    const Δλ = THREE.MathUtils.degToRad(lon2 - lon1)
  
    const y = Math.sin(Δλ) * Math.cos(φ2)
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
    const bearing = Math.atan2(y, x) // in radians
  
    return bearing // use this in a horizontal vector
  }
  function getPoiDirection(currentLat, currentLng, targetLat, targetLng, northOffset = 0, radius = 790) {
    // Step 1: Compute bearing from current to target in radians
    const φ1 = THREE.MathUtils.degToRad(currentLat)
    const φ2 = THREE.MathUtils.degToRad(targetLat)
    const Δλ = THREE.MathUtils.degToRad(targetLng - currentLng)
  
    const y = Math.sin(Δλ) * Math.cos(φ2)
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
    let bearing = Math.atan2(y, x) // radians
  
    // Step 2: Apply northOffset as a positive rotation (in radians)
    bearing += THREE.MathUtils.degToRad(northOffset*2+10) // magic number to adjust the direction
  
    // Step 3: Convert bearing to horizontal direction vector (Y = 0)
    const xDir = Math.sin(bearing)
    const zDir = Math.cos(bearing)
    const direction = new THREE.Vector3(xDir, 0, zDir).normalize()
  
    // Step 4: Scale to desired POI radius
    return direction.multiplyScalar(radius)
  }

  function getFeatureByName(datas, name) {
    const index = datas.findIndex(f => f.properties.name === name)
    console.log(index)
    return datas[index];
  }
// Fonction pour afficher les POIs de direction
// en fonction de la position actuelle
// et de la liste des panoramas
function showPOIsFromCurrent(curMarker, markers) {
    clearAllPois()
    const curMarkerFeature = getFeatureByName(datas, curMarker)
  
    const [curLon, curLat] = curMarkerFeature.geometry.coordinates
    const northOffset = curMarkerFeature.properties.northOffset || 0
  
    markers.forEach(pano => {
      if (pano.properties.name !== curMarker) {
        const [targetLon, targetLat] = pano.geometry.coordinates
  
        const pos = getPoiDirection(
          curLat, curLon,
          targetLat, targetLon,
          pano.properties.northOffset 
        )
  
        const poi = createPoi(pos, 0xffaa00, 25)
        poi.userData.target = pano.id
      }
    })
  }
 
//Raycaster

const rayCaster = new THREE.Raycaster()
function onClick (e) {
  // On convertit la position de la souris dans le repère de la caméra 
  let mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  )
  console.log('mouse : ', mouse);
  rayCaster.setFromCamera(mouse, camera)
  let intersects = rayCaster.intersectObject(sphere)
  if (intersects.length > 0) {
    console.log('Sphère touchée au point : ', intersects[0].point)
    createPoi(intersects[0].point, 0x00ff00, 15)
  }
}
document.body.addEventListener('click', onClick)
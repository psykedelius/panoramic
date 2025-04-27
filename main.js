
        let scene, camera, renderer, sphere,sphere2, textureLoader, orbitControls,deviceControls;
        let  option = "optionA";
        let imgIndex = 0;
        let currentImage;
        let imgRotationOffset = 0;
        let btns = [];
        let gyroEnabled  = false;
        let panoFrame = document.getElementById("panoFrame");
        let pixelRatio ;

        const baseImgPath = baseUrl+"/textures/360/";
        let textures = [ ];

        function init() {
             
            //setup scene
            scene    = new THREE.Scene();
            camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer();  
            
            const w = panoFrame.offsetWidth;
            const h = panoFrame.offsetHeight;
            renderer.setSize(w, h); 

            //renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(panoFrame.devicePixelRatio);
            var maxanisotropy=renderer.capabilities.getMaxAnisotropy();
            document.body.appendChild(renderer.domElement);

            //create panorama sphere
            textureLoader = new THREE.TextureLoader();
            textureLoader.generateMipmaps = false;
            textureLoader.anisotropy=maxanisotropy;
            
            let geometry = new THREE.SphereGeometry(800, 160, 40);
            geometry.scale(-1, 1, 1);
            let material = new THREE.MeshBasicMaterial({
                map: textureLoader.load(textures[0])
            });
            sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
            
            //setup camera orbit

            camera.position.set(0, 0, 0.1);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            // Device Orientation Controls (Disabled by default) 
            deviceControls = new THREE.DeviceOrientationControls(camera);
            deviceControls.enabled = false; 
            orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
            orbitControls.enableZoom = false; 
            
            animate();
        }
        window.addEventListener('resize', function() {
            const w = panoFrame.offsetWidth;
            const h = panoFrame.offsetHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h; 
            console.log("pixelRatio ",camera.aspect);
            camera.updateProjectionMatrix();
            updateIterface(w,h);
        });

        function updateIterface(w,h){
            let bottomInterface = document.getElementById("bottom-interface");
            let imgOptions      = document.getElementById("imgOptions");
            let imgTitle        = document.getElementById("imgTitle");
            let map        = document.getElementById("map");
            if (camera.aspect > 1 && camera.aspect < 1.4) {
                // Landscape mode
                if (h > 350){
                    map.style.height = "150px";
                }else{
                    map.style.height = "100px";
                }

                bottomInterface.style.fontSize = "16px";
                imgOptions.style.height = "100px";
            }else{
                // Portrait mode
                if (w < 576){
                    map.style.height = "150px";
                }else{
                    map.style.height = "100px";
                }
                
                bottomInterface.style.fontSize = "12px";
                imgOptions.style.height = "50px";
            }
        }


        function nextImage(value){ 
            
            imgIndex += value;
            if (imgIndex >= img360List.length){
                imgIndex = 0;
            }else if(imgIndex < 0){
                imgIndex = img360List.length-1;
            }
            let nextIndex = (imgIndex ) % img360List.length; 
            console.log("nextIndex ",markers[nextIndex])
            markers[nextIndex].fire('click');
        }

        function clicLeafletMarker(image,imgName, initialRotation) {
            // createDropdown();
  
             currentImage = image;
             const texture = textureLoader.load(baseImgPath+''+option+'/'+image);
             texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
             sphere.material.map = texture;
             sphere.material.map.minFilter = THREE.LinearFilter; 
             let title = document.getElementById("imgTitle");
             title.innerHTML = `${imgName}`;
             // Set initial camera rotation (yaw & pitch)
             imgRotationOffset = initialRotation;
             camera.rotation.set(0, initialRotation, 0); 
             // Update controls to reflect new rotation
             orbitControls.target.set(Math.sin(initialRotation), 0, Math.cos(initialRotation));
             orbitControls.update();
         }
 
  
        function changeOption(optionValue){// Change the texture based on the selected option
            console.log("changeOption ",optionValue);
            const dropDownBtn = document.getElementById("dropDownBtn");
            dropDownBtn.innerHTML = optionValue;
            option = optionValue;
            const texture = textureLoader.load(baseImgPath+''+optionValue+'/'+currentImage);
            console.log("changeOption path ",baseImgPath+''+optionValue+'/'+currentImage);
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
            sphere.material.map = texture;
            sphere.material.map.minFilter = THREE.LinearFilter; 
        }
 
        function updateFov() { // Update the FOV marker rotation based on camera direction
            // Get the camera's direction vector
            let direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
        
            // Compute the yaw angle (rotation around Y-axis)
            let angle = Math.atan2(direction.x, direction.z); // Angle in radians
            let degrees = -THREE.MathUtils.radToDeg(angle)+imgRotationOffset; // Convert to degrees
         
            // Apply the rotation to the FOV element
            const markerEl = curMarker.getElement();
            if (markerEl) {
                const img = markerEl.querySelector('.fov-marker-img');
                if (img) {
                    img.style.transform = `rotate(${degrees}deg)`;
                }
            } 
        }


        
        function animate() { 
             
            requestAnimationFrame(animate); 
            if (gyroEnabled && deviceControls) {
                deviceControls.update();
              }else{
                orbitControls.update();
              }
            renderer.render(scene, camera);
            if (setupIsDone==true){ 
                updateFov(); 
            } 
        }
         

        function createDropdown() {
            // Create select element
            let dropdown = document.getElementById("dropdownMenuButton");
        
            // Define dropdown options
            let dropDownOptions = ["Scenario A", "Scenario B", "Scenario C"];
        
            // Loop through options and create option elements
            dropDownOptions.forEach(text => {
                let option = document.createElement("option");
                option.value = text.toLowerCase().replace(/\s+/g, "-"); // Convert to lowercase with hyphens
                option.textContent = text;
                //dropdown.appendChild(option);
            });
            // Add event listener to handle option selection
            dropdown.addEventListener("change", function () {
                console.log("createDropdown ",this.value)
                changeOption(this.value);
            });
        }

    // VR Button Click - Enable Gyroscope
    const vrButton = document.getElementById("vrButton");
    vrButton.addEventListener("click",async  () => {
        if (!gyroEnabled) {
            // On iOS, request permission
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
              try {
                const permissionState = await DeviceOrientationEvent.requestPermission();
                if (permissionState === 'granted') {
                  enableGyro();
                } else {
                  alert('Permission denied to access gyroscope.');
                }
              } catch (error) {
                console.error(error);
              }
            } else {
              enableGyro();
            }
          } else {
            disableGyro();
          }
        });
    function enableGyro() {
       // controls = new DeviceOrientationControls(camera);
         // Disable OrbitControls
        orbitControls.enabled = false;
        // Enable DeviceOrientationControls
       deviceControls.connect();
       deviceControls.update();
        gyroEnabled = true;
        //document.getElementById("vrButton").textContent = 'Disable Gyroscope';
        console.log('Gyroscope enabled'); 
    }
    function disableGyro() {
        // Disconnect DeviceOrientationControls
        if (deviceControls) {
            deviceControls.disconnect();
            //deviceControls = null;
         }
         // Re-enable OrbitControls
         orbitControls.enabled = true;
        gyroEnabled = false;
        //document.getElementById("vrButton").textContent = 'Enable Gyroscope';
        console.log('Gyroscope disabled');
      }
init();

        

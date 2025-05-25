// Main data structures
let projectsData = [];
let currentProject = null; // Stores the currently selected project object
let currentPoint = null;   // Stores the currently selected panoramic point object
// let phaseOptions = {}; // Removed as per new requirement

let leafletMap = null;
// let pickMarker = null; // Replaced by projectPointMarkers array and specific icons
let projectPointMarkers = []; 
let defaultIcon = null; 
let highlightedIcon = null;

// --- Share Modal Functions ---

function populateShareModal(project) {
    const modal = document.getElementById('shareProjectModal');
    const accessLevelSelect = document.getElementById('accessLevelSelect');
    const privateSettingsDiv = document.getElementById('privateAccessSettings');
    const authorizedUsersListDiv = document.getElementById('authorizedUsersList');

    // Reset/Initialize Modal State
    authorizedUsersListDiv.innerHTML = ''; // Clear previous list
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserRole').value = 'view'; // Default role

    // Ensure project.acces and project.authorizedUsers are initialized
    if (typeof project.acces === 'undefined' && typeof project.authorizedUsers === 'undefined') {
        project.acces = "private"; 
        project.authorizedUsers = []; 
    } else if (typeof project.acces === 'undefined' && Array.isArray(project.authorizedUsers)) {
        // If only authorizedUsers exists, infer acces should be "private"
        project.acces = "private";
    } else if (project.acces === "all" && typeof project.authorizedUsers === 'undefined') {
        // If public, ensure authorizedUsers is empty array
        project.authorizedUsers = [];
    } else if (project.acces !== "all" && typeof project.authorizedUsers === 'undefined') {
        // If private but no authorizedUsers array (e.g. legacy or error), initialize it
        project.authorizedUsers = [];
    }


    // Load Project's Access Settings
    if (project.acces === "all") { 
        accessLevelSelect.value = "public";
        privateSettingsDiv.style.display = 'none';
        modal._tempAuthorizedUsers = []; 
    } else { 
        accessLevelSelect.value = "private";
        privateSettingsDiv.style.display = 'block';
        // Prioritize project.authorizedUsers if it exists and is an array, otherwise handle legacy project.acces array
        const usersToLoad = (Array.isArray(project.authorizedUsers) && project.authorizedUsers.length > 0) 
                            ? project.authorizedUsers 
                            : (Array.isArray(project.acces) ? project.acces : []);
        modal._tempAuthorizedUsers = JSON.parse(JSON.stringify(usersToLoad));
    }
    renderAuthorizedUsersList(modal._tempAuthorizedUsers);
}

function renderAuthorizedUsersList(usersArray) {
    const listDiv = document.getElementById('authorizedUsersList');
    listDiv.innerHTML = ''; // Clear existing items.

    if (!usersArray || usersArray.length === 0) {
        listDiv.innerHTML = '<em>No users authorized yet.</em>';
        return;
    }

    usersArray.forEach(user => {
        const listItem = document.createElement('div');
        listItem.style.display = 'flex';
        listItem.style.justifyContent = 'space-between';
        listItem.style.padding = '5px 0';
        listItem.style.borderBottom = '1px solid #eee';

        const userInfo = document.createElement('span');
        userInfo.textContent = `${user.email} - (${user.role})`;
        listItem.appendChild(userInfo);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.style.backgroundColor = '#ef4444'; // suppr-btn style
        removeButton.style.color = 'white';
        removeButton.style.border = 'none';
        removeButton.style.padding = '0.25rem 0.5rem';
        removeButton.style.borderRadius = '0.25rem';
        removeButton.style.cursor = 'pointer';
        
        removeButton.addEventListener('click', () => {
            const modal = document.getElementById('shareProjectModal');
            // Remove by email, as IDs might not be stable or present on original data
            modal._tempAuthorizedUsers = modal._tempAuthorizedUsers.filter(u => u.email !== user.email);
            renderAuthorizedUsersList(modal._tempAuthorizedUsers);
        });
        listItem.appendChild(removeButton);
        listDiv.appendChild(listItem);
    });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin page DOM fully loaded and parsed.');
    // Initialize event listeners for buttons that should be present on load
    // Project List Buttons
    const addNewProjectBtn = document.getElementById('addNewProjectBtn');
    if (addNewProjectBtn) {
        addNewProjectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Add New Project button clicked');
            handleAddNewProject(); // Call the new handler
        });
    }

    // Project Details Buttons
    const changeProjectNameBtn = document.getElementById('changeProjectNameBtn');
    if (changeProjectNameBtn) {
        changeProjectNameBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Change Project Name button clicked');
            handleChangeProjectName(); // Call the new handler
        });
    }

    // Panoramic Point List Buttons
    const addNewPointBtn = document.getElementById('addNewPointBtn');
    if (addNewPointBtn) {
        addNewPointBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // console.log('Add New Point button clicked'); // Kept for now, can remove
            handleAddNewPoint();
        });
    }

    // Point Details Form & Buttons
    const pointDetailsForm = document.getElementById('pointDetailsForm');
    if (pointDetailsForm) {
        pointDetailsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // console.log('Point Details Form submitted'); // Kept for now
            handleSavePointDetails();
        });
    }

    const pickCoordBtn = document.getElementById('pickCoordBtn');
    if (pickCoordBtn) {
        pickCoordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // console.log('Pick Coordinates button clicked'); // Kept for now
            handlePickCoordinates();
        });
    }

    // Image List Buttons
    const addNewImageBtn = document.getElementById('addNewImageBtn');
    if (addNewImageBtn) {
        addNewImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // console.log('Add New Image button clicked'); // Kept for now
            handleAddNewImageToPoint();
        });
    }

    // Logout button (example of an existing element)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Logout button clicked');
            // Actual logout logic would go here or be handled by a different script
        });
    }

    // Export JSON button
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleExportJson();
        });
    }

    // Share Modal Event Listeners
    const shareProjectBtn = document.getElementById('shareProjectBtn');
    if (shareProjectBtn) {
        shareProjectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentProject) {
                alert("Please select a project first.");
                return;
            }
            const modal = document.getElementById('shareProjectModal');
            document.getElementById('shareModalProjectName').textContent = currentProject.name || 'N/A';
            populateShareModal(currentProject);
            modal.style.display = 'flex';
        });
    }

    const closeShareModalBtn = document.getElementById('closeShareModalBtn');
    if (closeShareModalBtn) {
        closeShareModalBtn.addEventListener('click', () => {
            document.getElementById('shareProjectModal').style.display = 'none';
        });
    }

    const accessLevelSelect = document.getElementById('accessLevelSelect');
    if (accessLevelSelect) {
        accessLevelSelect.addEventListener('change', function() {
            const privateSettingsDiv = document.getElementById('privateAccessSettings');
            if (this.value === "public") {
                privateSettingsDiv.style.display = 'none';
            } else {
                privateSettingsDiv.style.display = 'block';
            }
        });
    }

    const addUserToShareListBtn = document.getElementById('addUserToShareListBtn');
    if (addUserToShareListBtn) {
        addUserToShareListBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('shareProjectModal');
            const emailInput = document.getElementById('newUserEmail');
            const roleSelect = document.getElementById('newUserRole');
            const email = emailInput.value.trim();
            const role = roleSelect.value;

            if (!email || !email.includes('@')) { // Basic email validation
                alert("Please enter a valid email address.");
                return;
            }

            if (!modal._tempAuthorizedUsers) { // Should be initialized by populateShareModal
                modal._tempAuthorizedUsers = [];
            }

            const existingUser = modal._tempAuthorizedUsers.find(u => u.email === email);
            if (existingUser) {
                alert("This email is already in the list.");
                return;
            }

            const newUser = { email: email, role: role };
            modal._tempAuthorizedUsers.push(newUser);
            renderAuthorizedUsersList(modal._tempAuthorizedUsers);

            emailInput.value = ''; // Clear input
            roleSelect.value = 'view'; // Reset role to default
        });
    }

    const saveShareSettingsBtn = document.getElementById('saveShareSettingsBtn');
    if (saveShareSettingsBtn) {
        saveShareSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentProject) {
                alert("No project selected.");
                return;
            }

            const accessLevel = document.getElementById('accessLevelSelect').value;
            const modal = document.getElementById('shareProjectModal');
            const tempUsers = modal._tempAuthorizedUsers || []; // Ensure it's an array

            if (accessLevel === "public") {
                currentProject.acces = "all";
                currentProject.authorizedUsers = []; // Clear authorized users for public projects
            } else { // private
                // The requirement was to store the array directly in 'acces' or 'authorizedUsers'.
                // Let's standardize on 'authorizedUsers' and set 'acces' to 'private' string.
                currentProject.acces = "private";
                currentProject.authorizedUsers = JSON.parse(JSON.stringify(tempUsers)); // Deep copy
            }
            
            // Clean up old 'acces' if it was an array (legacy)
            if (Array.isArray(currentProject.acces) && accessLevel === "public") {
                 // If switching to public, and 'acces' was the old array, ensure it's set to "all"
                 currentProject.acces = "all";
            }


            modal.style.display = 'none';
            alert("Project share settings saved successfully!");
            console.log("Updated project share settings:", currentProject);
        });
    }


    // Later: Call initializeAdminPage()
    initializeAdminPage(); 
});

async function initializeAdminPage() {
    console.log('Admin page initializing...');
    try {
        const response = await fetch('json/datas.json'); // Correct path
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Removed phaseOptions loading as per new requirement
        // if (data.phaseOptions) {
        //     phaseOptions = data.phaseOptions;
        //     console.log('Phase Options Loaded:', phaseOptions);
        // } else {
        //     console.warn('phaseOptions not found in datas.json');
        // }

        // projectsData starts empty for now, new projects will be added via UI
        console.log('projectsData initialized as empty:', projectsData);

        // Initial Rendering calls
        renderProjectList();
        initializeMap(); // Initialize the map
        // console.log('Would call renderPanoramicPointList() if a project was pre-selected');


    } catch (error) {
        console.error('Error loading or parsing datas.json:', error);
    }
    console.log('Admin page initialization complete.');
}

// Utility function for generating unique IDs (simple version)
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// --- Project Management Functions ---

function renderProjectList() {
    const projectListDiv = document.getElementById('projectList');
    if (!projectListDiv) {
        console.error('#projectList element not found.');
        return;
    }
    projectListDiv.innerHTML = ''; // Clear existing content

    if (projectsData.length === 0) {
        projectListDiv.innerHTML = '<p>No projects yet. Click \'Add new\' to create one.</p>';
        return;
    }

    projectsData.forEach(project => {
        const listItem = document.createElement('div');
        listItem.classList.add('list-item');
        listItem.setAttribute('data-project-id', project.id);

        if (currentProject && currentProject.id === project.id) {
            listItem.classList.add('selected'); // Add a class for styling the selected project
            // Example selected style (add to your <style> block in HTML or CSS file):
            // .list-item.selected { background-color: #e0e7ff; border-left: 4px solid #4f46e5; }
        }

        const header = document.createElement('span');
        header.classList.add('list-item-header');
        header.textContent = project.name;
        listItem.appendChild(header);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('list-item-actions');

        const editButton = document.createElement('button');
        editButton.classList.add('edit-btn');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering other click listeners if any
            handleSelectProject(project.id);
        });
        actionsDiv.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('suppr-btn');
        deleteButton.textContent = 'Suppr';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handleDeleteProject(project.id);
        });
        actionsDiv.appendChild(deleteButton);

        listItem.appendChild(actionsDiv);
        projectListDiv.appendChild(listItem);
    });
}

function handleAddNewProject() {
    const projectName = prompt('Enter project name:');
    if (projectName && projectName.trim() !== '') {
        const newProject = {
            id: generateId(),
            name: projectName.trim(),
            panoramicPoints: [],
            acces: "private",       // Default access type
            authorizedUsers: []     // Default empty list of authorized users
        };
        projectsData.push(newProject);
        currentProject = newProject; // Optionally select the new project
        renderProjectList();
        handleSelectProject(newProject.id); // Also update details panel
        console.log(`Project "${newProject.name}" added with ID ${newProject.id}`);
    } else if (projectName !== null) { // User didn't cancel but entered empty or spaces
        alert('Project name cannot be empty.');
    }
}

function handleSelectProject(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) {
        console.error(`Project with ID ${projectId} not found.`);
        currentProject = null; // Clear current project if not found
        // Optionally clear details panel or show a "not found" message
        document.getElementById('currentProjectNameDisplay').textContent = 'No project selected';
        const editProjectNameInput = document.getElementById('editProjectNameInput');
        editProjectNameInput.classList.add('hidden');
        editProjectNameInput.value = '';
    } else {
        currentProject = project;
        document.getElementById('currentProjectNameDisplay').textContent = currentProject.name;
        
        const editProjectNameInput = document.getElementById('editProjectNameInput');
        editProjectNameInput.value = currentProject.name;
        editProjectNameInput.classList.remove('hidden'); // Make it visible
        
        console.log(`Project "${currentProject.name}" selected.`);
        currentPoint = null; // Reset current point when project changes
        renderPanoramicPointList(); // Render points for the new project
        resetPointDetailsForm(); // Clear the point details form, which also clears image list
        renderImageList(); // Explicitly call to show "Select a point..." message for images
        renderProjectPointMarkers(); // Render all markers for the selected project
    }
    renderProjectList(); // Re-render to update selection highlight
}

function handleChangeProjectName() {
    if (!currentProject) {
        alert('No project selected. Please select a project to rename.');
        console.error('handleChangeProjectName called without a currentProject.');
        return;
    }

    const editProjectNameInput = document.getElementById('editProjectNameInput');
    const newName = editProjectNameInput.value.trim();

    if (newName && newName !== currentProject.name) {
        currentProject.name = newName;
        renderProjectList(); // Update the list
        document.getElementById('currentProjectNameDisplay').textContent = newName; // Update the display span
        // editProjectNameInput.value = ''; // Optionally clear the input
        // editProjectNameInput.classList.add('hidden'); // Optionally hide it again
        console.log(`Project ID ${currentProject.id} renamed to "${newName}".`);
        alert(`Project name updated to "${newName}".`);
    } else if (!newName) {
        alert('Project name cannot be empty.');
        editProjectNameInput.value = currentProject.name; // Reset to original name if submission was empty
    } else {
        // Name is the same, do nothing or provide feedback
        console.log('New name is the same as the current name. No change made.');
    }
}

function handleDeleteProject(projectId) {
    const projectIndex = projectsData.findIndex(p => p.id === projectId);

    if (projectIndex > -1) {
        const projectName = projectsData[projectIndex].name;
        // Optional: Add a confirmation dialog
        // const confirmDelete = confirm(`Are you sure you want to delete project "${projectName}"? This will also delete all its panoramic points and images. This cannot be undone.`);
        // if (!confirmDelete) {
        //     console.log(`Deletion of project "${projectName}" cancelled by user.`);
        //     return;
        // }

        projectsData.splice(projectIndex, 1);
        console.log(`Project "${projectName}" (ID: ${projectId}) deleted.`);

        if (currentProject && currentProject.id === projectId) {
            currentProject = null;
            currentPoint = null; // Also clear currentPoint if its project is deleted

            document.getElementById('currentProjectNameDisplay').textContent = 'No project selected';
            const editProjectNameInput = document.getElementById('editProjectNameInput');
            editProjectNameInput.value = '';
            editProjectNameInput.classList.add('hidden');
            
            document.getElementById('currentPointNameDisplay').textContent = 'N/A'; // Reset point display
            resetPointDetailsForm(); // Reset the form
            clearProjectPointMarkers(); // Clear markers if current project is deleted
            
            renderPanoramicPointList(); // Update point list (will show "Select a project...")
            console.log('renderImageList() would be cleared as current project deleted.');
            // renderImageList(null); // Pass null to clear or handle no project/point

        }
    } else {
        console.warn(`Project with ID ${projectId} not found for deletion.`);
    }
    renderProjectList(); // Re-render the project list
}

// --- Panoramic Point Management Functions ---

function resetPointDetailsForm() {
    const pointDetailsForm = document.getElementById('pointDetailsForm');
    if(pointDetailsForm) pointDetailsForm.reset();
    document.getElementById('pointCoordInput').value = ''; // Clear readonly input explicitly
    document.getElementById('selectedPointId').value = '';
    document.getElementById('currentPointNameDisplay').textContent = 'N/A';
    // if (pickMarker) { // Old single marker logic removed
    //     pickMarker.remove(); 
    //     pickMarker = null; 
    // }
    // Clearing of project-wide markers is handled by renderProjectPointMarkers or clearProjectPointMarkers directly.
    document.getElementById('imageList').innerHTML = '<div class="list-item">Select a point to see its images.</div>';
    // currentPoint = null; // This should be handled by the caller logic
}

function renderPanoramicPointList() {
    const pointListDiv = document.getElementById('panoramicPointList');
    if (!pointListDiv) {
        console.error('#panoramicPointList element not found.');
        return;
    }
    pointListDiv.innerHTML = ''; // Clear existing content

    if (!currentProject) {
        pointListDiv.innerHTML = '<p>Select a project to see its points.</p>';
        return;
    }

    if (currentProject.panoramicPoints.length === 0) {
        pointListDiv.innerHTML = '<p>No panoramic points yet. Click \'Add new\' to create one.</p>';
        return;
    }

    currentProject.panoramicPoints.forEach(point => {
        const listItem = document.createElement('div');
        listItem.classList.add('list-item');
        listItem.setAttribute('data-point-id', point.id);

        if (currentPoint && currentPoint.id === point.id) {
            listItem.classList.add('selected'); // For highlighting selected point
        }

        const header = document.createElement('span');
        header.classList.add('list-item-header');
        header.textContent = point.name;
        listItem.appendChild(header);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('list-item-actions');

        const editButton = document.createElement('button');
        editButton.classList.add('edit-btn');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handleSelectPoint(point.id);
        });
        actionsDiv.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('suppr-btn');
        deleteButton.textContent = 'Suppr';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handleDeletePoint(point.id);
        });
        actionsDiv.appendChild(deleteButton);

        listItem.appendChild(actionsDiv);
        pointListDiv.appendChild(listItem);
    });
}

function handleAddNewPoint() {
    if (!currentProject) {
        alert('Please select a project first.');
        return;
    }

    const newPoint = {
        id: generateId(),
        name: "New Point " + (currentProject.panoramicPoints.length + 1),
        coordinates: null, // Default to null, to be set by user
        northOffset: 0,    // Default to 0
        imagesByPhase: []  // Initialize as empty array
    };

    currentProject.panoramicPoints.push(newPoint);
    renderPanoramicPointList();
    handleSelectPoint(newPoint.id); // Auto-select the new point
    console.log(`New point "${newPoint.name}" added to project "${currentProject.name}".`);
}

function handleSelectPoint(pointId) {
    if (!currentProject) {
        console.error('handleSelectPoint called without a currentProject.');
        // Optionally alert the user or disable UI elements that would trigger this
        return;
    }

    const point = currentProject.panoramicPoints.find(p => p.id === pointId);
    if (!point) {
        console.error(`Point with ID ${pointId} not found in project ${currentProject.name}.`);
        currentPoint = null; // Clear current point if not found
        resetPointDetailsForm(); // Reset form if point is not found
        // renderImageList(null); // Clear image list
        return;
    }

    currentPoint = point;

    // Populate form
    document.getElementById('pointNameInput').value = currentPoint.name;
    document.getElementById('pointCoordInput').value = currentPoint.coordinates ? currentPoint.coordinates.join(', ') : '';
    document.getElementById('northOffsetInput').value = currentPoint.northOffset;
    document.getElementById('selectedPointId').value = currentPoint.id;

    // Update point name display (e.g., "Panoramic point 01" from the HTML)
    // You might want to make this more dynamic or use a shorter version if names are long.
    document.getElementById('currentPointNameDisplay').textContent = currentPoint.name; 

    renderPanoramicPointList(); // Re-render list for selection highlighting

    renderImageList(); 
    renderProjectPointMarkers(); // Re-render all markers, highlighting the new currentPoint
}

function handleSavePointDetails() {
    const selectedPointId = document.getElementById('selectedPointId').value;

    if (!selectedPointId || !currentProject) {
        alert('No point selected or no project active. Cannot save.');
        console.warn('Save attempt failed: No selectedPointId or currentProject.');
        return;
    }

    const pointToUpdate = currentProject.panoramicPoints.find(p => p.id === selectedPointId);

    if (!pointToUpdate) {
        alert('Selected point not found. Cannot save.');
        console.warn(`Save attempt failed: Point with ID ${selectedPointId} not found.`);
        return;
    }

    // Get values from form inputs
    const name = document.getElementById('pointNameInput').value;
    const northOffsetString = document.getElementById('northOffsetInput').value;
    const coordString = document.getElementById('pointCoordInput').value;

    // Validate and parse inputs
    if (!name.trim()) {
        alert('Point name cannot be empty.');
        return;
    }
    pointToUpdate.name = name.trim();
    pointToUpdate.northOffset = parseFloat(northOffsetString) || 0;

    if (coordString.trim()) {
        const coordParts = coordString.split(',').map(s => s.trim());
        if (coordParts.length === 2 && !isNaN(parseFloat(coordParts[0])) && !isNaN(parseFloat(coordParts[1]))) {
            pointToUpdate.coordinates = [parseFloat(coordParts[0]), parseFloat(coordParts[1])];
        } else {
            alert("Invalid coordinates format. Please use 'latitude, longitude'. Coordinates not saved.");
        }
    } else {
        pointToUpdate.coordinates = null; // No coordinates provided, so set to null
    }

    // Update currentPoint if it's the one being edited
    if (currentPoint && currentPoint.id === selectedPointId) {
        currentPoint = pointToUpdate; // Ensure currentPoint reference is updated
    }

    renderPanoramicPointList(); // Update the list (especially if name changed)
    document.getElementById('currentPointNameDisplay').textContent = pointToUpdate.name;

    renderProjectPointMarkers(); // Refresh map display
    
    alert('Point details saved successfully.');
    console.log(`Point details saved for ID: ${selectedPointId}`, pointToUpdate);
}


function handleDeletePoint(pointId) {
    if (!currentProject) {
        console.error('handleDeletePoint called without currentProject.');
        alert('No project is currently selected. Cannot delete point.');
        return;
    }
    const pointIndex = currentProject.panoramicPoints.findIndex(p => p.id === pointId);

    if (pointIndex === -1) {
        console.warn(`Point with ID ${pointId} not found for deletion in project ${currentProject.name}.`);
        alert(`Point not found. Cannot delete.`);
        return;
    }
    
    const pointNameToDelete = currentProject.panoramicPoints[pointIndex].name;

    currentProject.panoramicPoints.splice(pointIndex, 1);
    console.log(`Deleted point: ${pointNameToDelete} (ID: ${pointId}) from project ${currentProject.name}`);
    alert(`Point "${pointNameToDelete}" deleted.`);

    if (currentPoint && currentPoint.id === pointId) {
        currentPoint = null;
        resetPointDetailsForm(); 
    }
    renderPanoramicPointList(); 
    renderProjectPointMarkers(); // Refresh map after deletion
}

// --- Map Related Functions ---

function clearProjectPointMarkers() {
    projectPointMarkers.forEach(marker => marker.remove());
    projectPointMarkers = [];
}

function renderProjectPointMarkers() {
    clearProjectPointMarkers();
    if (!currentProject || !currentProject.panoramicPoints || !leafletMap) return;

    currentProject.panoramicPoints.forEach(point => {
        if (point.coordinates && point.coordinates.length === 2) {
            const markerIcon = (currentPoint && currentPoint.id === point.id) ? highlightedIcon : defaultIcon;
            const marker = L.marker(point.coordinates, { icon: markerIcon }).addTo(leafletMap);
            marker.bindTooltip(point.name);
            marker.on('click', () => { 
                // When a marker is clicked, select the point and re-render markers
                // This ensures the clicked marker becomes highlighted and map potentially re-centers
                handleSelectPoint(point.id); 
            });
            projectPointMarkers.push(marker);
        }
    });

    if (currentPoint && currentPoint.coordinates && currentPoint.coordinates.length === 2) {
        leafletMap.setView(currentPoint.coordinates, leafletMap.getZoom() || 17);
    } else if (projectPointMarkers.length > 0) {
        // Optional: if no specific point is selected, fit map to show all markers
        // const group = new L.featureGroup(projectPointMarkers);
        // leafletMap.fitBounds(group.getBounds().pad(0.5));
    }
}


function initializeMap() {
    if (leafletMap) { 
        leafletMap.remove(); 
        leafletMap = null; 
    } 
    
    try {
        leafletMap = L.map('map').setView([47.471, -0.568], 13); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMap);
        leafletMap.invalidateSize(); 
        console.log('Leaflet map initialized and size invalidated.');

        // Initialize icons
        defaultIcon = new L.Icon.Default();
        highlightedIcon = new L.Icon.Default({ 
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

    } catch (error) {
        console.error("Error initializing Leaflet map. Is the 'map' div present in HTML?", error);
        // Fallback or UI notification
        const mapDiv = document.getElementById('map');
        if (mapDiv) {
            mapDiv.innerHTML = '<p style="color:red;">Error initializing map. Leaflet library might be missing or div not found.</p>';
        }
    }
}

function handlePickCoordinates() {
    if (!leafletMap) {
        console.error('Map not initialized. Cannot pick coordinates.');
        alert('Map is not available for picking coordinates.');
        return;
    }
    if (!currentPoint) {
        alert('Please select a panoramic point first before picking coordinates.');
        return;
    }

    console.log('Map click listener activated for coordinate picking. Click on the map.');
    const mapDiv = document.getElementById('map');
    mapDiv.style.cursor = 'crosshair'; 

    leafletMap.once('click', function(e) {
        const pickedCoords = [parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6))];
        
        if (currentPoint) {
            currentPoint.coordinates = pickedCoords; 
            document.getElementById('pointCoordInput').value = pickedCoords.join(', ');
            renderProjectPointMarkers(); // Re-render to show new/moved point and highlight it
            // No need to manually setView here as renderProjectPointMarkers will handle it if currentPoint has coords.
        }
        
        mapDiv.style.cursor = ''; 
        console.log('Coordinates picked and assigned to currentPoint:', pickedCoords);
        alert(`Coordinates picked: ${pickedCoords.join(', ')}. Remember to save the point details.`);
    });
}

// --- Image Management Functions ---

function renderImageList() {
    const imageListDiv = document.getElementById('imageList');
    if (!imageListDiv) {
        console.error("#imageList element not found.");
        return;
    }
    imageListDiv.innerHTML = ''; // Clear existing content

    if (!currentPoint || !currentPoint.imagesByPhase || currentPoint.imagesByPhase.length === 0) {
        imageListDiv.innerHTML = '<div class="list-item">No images for this point yet.</div>';
        return;
    }

    currentPoint.imagesByPhase.forEach(imageObj => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.setAttribute('data-image-id', imageObj.id);
        
        listItem.innerHTML = `<span>Phase: ${imageObj.phaseName}</span><span class="image-name">Image: ${imageObj.imageName}</span>`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'suppr-btn';
        deleteBtn.textContent = 'Suppr';
        deleteBtn.addEventListener('click', () => handleDeleteImageFromPoint(imageObj.id));
        
        listItem.appendChild(deleteBtn);
        imageListDiv.appendChild(listItem);
    });
}

function handleAddNewImageToPoint() {
    if (!currentPoint) {
        alert("Please select a panoramic point first.");
        return;
    }

    // Prompt for custom phase name instead of selecting from phaseOptions
    const customPhaseName = prompt("Enter the desired phase name for this image (e.g., 'Before Construction', 'Phase 1', 'Night View'):");
    if (!customPhaseName || !customPhaseName.trim()) {
        alert("Phase name cannot be empty.");
        return;
    }

    const imageName = prompt("Enter image name (e.g., image.jpg):");
    if (!imageName || !imageName.trim()) {
        alert("Image name cannot be empty.");
        return;
    }

    const newImage = {
        id: generateId(),
        phaseName: customPhaseName.trim(), // Use the directly entered phase name
        imageName: imageName.trim()
    };

    if (!currentPoint.imagesByPhase) {
        currentPoint.imagesByPhase = [];
    }
    currentPoint.imagesByPhase.push(newImage);
    renderImageList();
    console.log(`Image "${newImage.imageName}" for phase "${newImage.phaseName}" added to point "${currentPoint.name}".`); // phaseName from newImage
}

function handleDeleteImageFromPoint(imageId) {
    if (!currentPoint || !currentPoint.imagesByPhase) {
        console.warn("Delete image called without currentPoint or imagesByPhase array.");
        return;
    }

    const imageIndex = currentPoint.imagesByPhase.findIndex(img => img.id === imageId);
    if (imageIndex > -1) {
        const deletedImage = currentPoint.imagesByPhase.splice(imageIndex, 1);
        console.log(`Image "${deletedImage[0].imageName}" (ID: ${imageId}) deleted from point "${currentPoint.name}".`);
    } else {
        console.warn("Image to delete not found:", imageId);
    }
    renderImageList();
}

// --- Export/Import Functions ---
function handleExportJson() {
    if (projectsData.length === 0) {
        alert("No project data to export.");
        return;
    }
    try {
        const jsonString = JSON.stringify(projectsData, null, 2);
        const filename = "panoramicGalleryProjects.json";
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a); // Required for Firefox
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("Data exported as JSON.");
    } catch (error) {
        console.error("Error exporting JSON:", error);
        alert("Error exporting data. See console for details.");
    }
}

console.log('newAdminLogic.js loaded');

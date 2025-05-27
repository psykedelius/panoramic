<?php
session_start();
if (!isset($_SESSION['name']) || empty($_SESSION['name'])) {
    header('Location: admin/login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panoramic Gallery Admin</title>
    <style>
        /* Custom styles for the layout and elements */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f3f4f6; /* bg-gray-100 */
            padding: 1rem; /* p-4 */
        }
        .panel {
            background-color: #ffffff; /* bg-white */
            border-radius: 0.5rem; /* rounded-lg */
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
            padding: 1.5rem; /* p-6 */
            margin-bottom: 1.5rem; /* mb-6 */
        }
        .list-container {
            border: 1px solid #e5e7eb; /* border border-gray-200 */
            border-radius: 0.375rem; /* rounded-md */
            overflow: hidden;
        }
        .list-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem; /* p-3 */
            border-bottom: 1px solid #e5e7eb; /* border-b border-gray-200 */
        }
        .list-item:last-child {
            border-bottom: 0; /* last:border-b-0 */
        }
        .list-item-header {
            font-weight: 600; /* font-semibold */
            color: #374151; /* text-gray-700 */
        }
        .list-item-actions button {
            margin-left: 0.5rem; /* ml-2 */
            padding: 0.25rem 0.75rem; /* px-3 py-1 */
            border-radius: 0.375rem; /* rounded-md */
            font-size: 0.875rem; /* text-sm */
            font-weight: 500; /* font-medium */
        }
        .edit-btn {
            background-color: #3b82f6; /* bg-blue-500 */
            color: #ffffff; /* text-white */
        }
        .edit-btn:hover {
            background-color: #2563eb; /* hover:bg-blue-600 */
        }
        .suppr-btn {
            background-color: #ef4444; /* bg-red-500 */
            color: #ffffff; /* text-white */
        }
        .suppr-btn:hover {
            background-color: #dc2626; /* hover:bg-red-600 */
        }
        .add-new-btn {
            margin-top: 1rem; /* mt-4 */
            padding: 0.5rem 1rem; /* px-4 py-2 */
            background-color: #22c55e; /* bg-green-500 */
            color: #ffffff; /* text-white */
            border-radius: 0.375rem; /* rounded-md */
            transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform; /* transition-colors */
            transition-duration: 200ms; /* duration-200 */
        }
        .add-new-btn:hover {
            background-color: #16a34a; /* hover:bg-green-600 */
        }
        .input-group {
            margin-bottom: 0.75rem; /* mb-3 */
        }
        .input-group label {
            display: block;
            font-size: 0.875rem; /* text-sm */
            font-weight: 500; /* font-medium */
            color: #374151; /* text-gray-700 */
            margin-bottom: 0.25rem; /* mb-1 */
        }
        .input-group input[type="text"] {
            margin-top: 0.25rem; /* mt-1 */
            display: block;
            width: 100%; /* w-full */
            border-radius: 0.375rem; /* rounded-md */
            border: 1px solid #d1d5db; /* border-gray-300 */
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
            padding: 0.5rem; /* p-2 */
        }
        .input-group input[type="text"]:focus {
            border-color: #a78bfa; /* focus:border-indigo-300 */
            outline: 2px solid transparent;
            outline-offset: 2px;
            box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.5); /* focus:ring focus:ring-indigo-200 focus:ring-opacity-50 */
        }
        .btn-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem; /* p-2 */
            border-radius: 9999px; /* rounded-full */
            background-color: #e5e7eb; /* bg-gray-200 */
            transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform; /* transition-colors */
            transition-duration: 200ms; /* duration-200 */
        }
        .btn-icon:hover {
            background-color: #d1d5db; /* hover:bg-gray-300 */
        }
        .btn-icon svg {
            width: 1.25rem; /* w-5 */
            height: 1.25rem; /* h-5 */
            color: #4b5563; /* text-gray-600 */
        }
        .map-container {
            width: 100%; /* w-full */
            height: 24rem; /* h-96 */
            border-radius: 0.5rem; /* rounded-lg */
            overflow: hidden;
        }

        /* Specific styles for the layout as per the image */
        .container {
            display: grid;
            grid-template-columns: 1fr; /* grid-cols-1 */
            gap: 1.5rem; /* gap-6 */
        }
        @media (min-width: 768px) { /* md */
            .container {
                grid-template-columns: repeat(2, 1fr); /* md:grid-cols-2 */
            }
            .project-details-panel, .map-panel {
                grid-column: span 2 / span 2; /* col-span-2 */
            }
        }
        .project-name-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem; /* mb-4 */
            padding-bottom: 1rem; /* pb-4 */
            border-bottom: 1px solid #e5e7eb; /* border-b border-gray-200 */
        }
        .project-name-header h2 {
            font-size: 1.25rem; /* text-xl */
            font-weight: 600; /* font-semibold */
            color: #1f2937; /* text-gray-800 */
        }
        .project-name-header .flex {
            display: flex;
            align-items: center;
        }
        .project-name-header input {
            margin-right: 0.5rem; /* mr-2 */
            padding: 0.5rem; /* p-2 */
        }
        .project-name-header button {
            padding: 0.5rem 1rem; /* px-4 py-2 */
            background-color: #9333ea; /* bg-purple-500 */
            color: #ffffff; /* text-white */
            border-radius: 0.375rem; /* rounded-md */
            transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform; /* transition-colors */
            transition-duration: 200ms; /* duration-200 */
        }
        .project-name-header button:hover {
            background-color: #7e22ce; /* hover:bg-purple-600 */
        }
        .sub-panel {
            background-color: #f9fafb; /* bg-gray-50 */
            border-radius: 0.5rem; /* rounded-lg */
            padding: 1rem; /* p-4 */
            margin-top: 1rem; /* mt-4 */
            border: 1px solid #e5e7eb; /* border border-gray-200 */
        }
        .sub-panels-grid {
            display: grid;
            grid-template-columns: 1fr 1fr; /* grid-cols-1 */
            gap: 1rem; /* gap-4 */
        }
        .panoramic-point-details-panel {
            display: grid;
            grid-template-columns: 1fr; /* grid-cols-1 */
            gap: 1rem; /* gap-4 */
        }
        @media (min-width: 1024px) { /* lg */
            .panoramic-point-details-panel {
                grid-template-columns: repeat(2, 1fr); /* lg:grid-cols-2 */
            }
        }
        .panoramic-point-details-panel form {
            grid-column: span 1 / span 1; /* col-span-1 */
        }
        .panoramic-point-details-panel .list-container {
            grid-column: span 1 / span 1; /* col-span-1 */
        }
        #map {
            width: 100%; /* w-full */
            height: 400px; /* Fixed height for the map, can be made responsive with JS */
        }
        .text-gray-600 {
            color: #4b5563;
        }
        .text-gray-800 {
            color: #1f2937;
        }
        .text-blue-600 {
            color: #2563eb;
        }
        .text-blue-600:hover {
            color: #1e40af; /* hover:text-blue-800 */
        }
        .font-medium {
            font-weight: 500;
        }
        .text-2xl {
            font-size: 1.5rem; /* 24px */
            line-height: 2rem; /* 32px */
        }
        .font-bold {
            font-weight: 700;
        }
        .text-xl {
            font-size: 1.25rem; /* 20px */
            line-height: 1.75rem; /* 28px */
        }
        .text-lg {
            font-size: 1.125rem; /* 18px */
            line-height: 1.75rem; /* 28px */
        }
        .mb-4 {
            margin-bottom: 1rem;
        }
        .mb-3 {
            margin-bottom: 0.75rem;
        }
        .mb-6 {
            margin-bottom: 1.5rem;
        }
        .py-4 {
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        .px-6 {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
        }
        .hidden {
            display: none;
        }
        .flex {
            display: flex;
        }
        .justify-between {
            justify-content: space-between;
        }
        .items-center {
            align-items: center;
        }
        .mr-2 {
            margin-right: 0.5rem;
        }
        .flex-grow {
            flex-grow: 1;
        }
        .ml-2 {
            margin-left: 0.5rem;
        }
    </style>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
</head>
<body>
    <header class="header">
        <h1 class="header-title">Hello <?php echo htmlspecialchars($_SESSION['name']); ?>!</h1>
        <a href="#" class="logout-link" id="logoutBtn">log out</a>
    </header>

    <main class="container">
        
            
            <div class="sub-panel">
                <section class="panel project-list-panel">
                <h2 class="section-title">Project List</h2>
                <div id="projectList" class="list-container">
                    <div class="list-item">
                        <span class="list-item-header">Panoramic Gallery Project 01</span>
                        <div class="list-item-actions">
                            <button class="edit-btn">Edit</button>
                            <button class="suppr-btn">Suppr</button>
                        </div>
                    </div>
                    <div class="list-item">
                        <span class="list-item-header">Panoramic Gallery Project 02</span>
                        <div class="list-item-actions">
                            <button class="edit-btn">Edit</button>
                            <button class="suppr-btn">Suppr</button>
                        </div>
                    </div>
                </div>
                <button id="addNewProjectBtn" class="add-new-btn">Add new</button>
                <button id="saveAllProjectsBtn" class="add-new-btn" style="background-color: #f59e0b; margin-top: 5px;">Save All</button>
            </section>

            </div>
            <div class="sub-panel">
                <section class="panel map-panel">
                    <h2 class="section-title">Leaflet map displaying location of panoramic points</h2>
                    <div id="map" class="map-container"></div>
                </section>
            </div>
        
        <section class="panel project-details-panel">
            <div class="project-name-header">
                <h2 class="section-title">Project Name: <span id="currentProjectNameDisplay">Panoramic Gallery Project 01</span></h2>
                <div class="project-name-actions">
                    <input type="text" id="editProjectNameInput" class="input-text hidden" placeholder="New Project Name">
                    <button id="changeProjectNameBtn" class="change-name-btn">Change Name</button>
                    <button id="shareProjectBtn" class="btn-icon ml-2" title="Share Project Settings">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 1.25rem; height: 1.25rem;">
                            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="sub-panels-grid">
                <div class="sub-panel">
                    <h3 class="sub-section-title">Panoramic point List</h3>
                    <div id="panoramicPointList" class="list-container">
                        <div class="list-item">
                            <span class="list-item-header">Panoramic point 01</span>
                            <div class="list-item-actions">
                                <button class="edit-btn">Edit</button>
                                <button class="suppr-btn">Suppr</button>
                            </div>
                        </div>
                        <div class="list-item">
                            <span class="list-item-header">Panoramic point 02</span>
                            <div class="list-item-actions">
                                <button class="edit-btn">Edit</button>
                                <button class="suppr-btn">Suppr</button>
                            </div>
                        </div>
                    </div>
                    <button id="addNewPointBtn" class="add-new-btn">Add new</button>
                </div>

                <div class="sub-panel panoramic-point-details-panel-inner">
                    <h3 class="sub-section-title">Panoramic point <span id="currentPointNameDisplay">01</span></h3>
                    <form id="pointDetailsForm" class="form-group">
                        <div class="input-group">
                            <label for="pointNameInput">Point name:</label>
                            <input type="text" id="pointNameInput" name="name" class="input-text">
                        </div>

                        <div class="input-group input-group-flex">
                            <label for="pointCoordInput" class="label-mr">Point coord:</label>
                            <input type="text" id="pointCoordInput" name="coordinates" readonly class="input-text flex-grow-input">
                            <button type="button" id="pickCoordBtn" class="btn-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon-size icon-color">
                                    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.087.051.751.751 0 00.713-.001l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.879 0-5.45-3.882-9.47-9.45-9.47S2.55 7.42 2.55 12.87c0 3.9.029 6.889 3.963 8.879a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <div class="input-group">
                            <label for="northOffsetInput">north offset:</label>
                            <input type="text" id="northOffsetInput" name="north_offset" class="input-text">
                        </div>
                        <input type="hidden" id="selectedPointId">
                        <button type="submit" class="add-new-btn">Save Point Details</button>
                    </form>

                    <h4 class="sub-section-title">Image Liste</h4>
                    <div id="imageList" class="list-container">
                        <div class="list-item">
                            <span>phase A</span>
                            <span class="image-name">imagePanoPhaseA.jpg</span>
                            <button class="suppr-btn">Suppr</button>
                        </div>
                        <div class="list-item">
                            <span>phase B</span>
                            <span class="image-name">imagePanoPhaseB.jpg</span>
                            <button class="suppr-btn">Suppr</button>
                        </div>
                    </div>
                    <button id="addNewImageBtn" class="add-new-btn">Add new</button>
                    <input type="file" id="imageUploadInput" accept="image/*" style="display:none;">
                </div>
            </div>
        </section>

    </main>

    <div id="shareProjectModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 1000;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 500px; max-width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0;">Share Project: <span id="shareModalProjectName" style="font-weight: normal;"></span></h3>
                <button id="closeShareModalBtn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>

            <div style="margin-bottom: 15px;">
                <label for="accessLevelSelect" style="display: block; margin-bottom: 5px;">Access Level:</label>
                <select id="accessLevelSelect" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                    <option value="private">Private (Only authorized users)</option>
                    <option value="public">Public (Anyone can view/access)</option>
                </select>
            </div>

            <div id="privateAccessSettings">
                <h4 style="margin-top: 20px; margin-bottom: 10px; font-size: 1rem;">Authorized Users (Private Mode)</h4>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="email" id="newUserEmail" placeholder="user@example.com" style="flex-grow: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <select id="newUserRole" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="view">Can View</option>
                        <option value="edit">Can Edit</option>
                    </select>
                    <button id="addUserToShareListBtn" class="add-new-btn" style="padding: 8px 12px; font-size: 0.9rem;">Add User</button>
                </div>
                <label style="display: block; margin-bottom: 5px;">Current Users:</label>
                <div id="authorizedUsersList" style="border: 1px solid #eee; padding: 10px; border-radius: 4px; min-height: 50px; max-height: 150px; overflow-y: auto;">
                    <!-- Authorized users will be listed here by JavaScript -->
                </div>
            </div>

            <div style="text-align: right; margin-top: 20px;">
                <button id="saveShareSettingsBtn" class="add-new-btn" style="background-color: #22c55e;">Save Settings</button>
            </div>
        </div>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
     integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
     crossorigin=""></script>
    <script src="js/newAdminLogic.js"></script>
</body>
</html>
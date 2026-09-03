function previewFile() {
    const fileInput = document.getElementById("fileInput").files[0];
    const previewSection = document.getElementById("previewSection");

    previewSection.innerHTML = ""; // Clear previous preview

    if (fileInput) {
        const fileURL = URL.createObjectURL(fileInput);
        displayMedia(fileURL, fileInput.type);
    } else {
        previewSection.innerHTML = "<p style='color: red;'>No file selected.</p>";
    }
}

function previewURL() {
    const urlInput = document.getElementById("urlInput").value;
    const previewSection = document.getElementById("previewSection");

    previewSection.innerHTML = ""; // Clear previous preview

    if (urlInput) {
        displayMedia(urlInput, "image/url");
    } else {
        previewSection.innerHTML = "<p style='color: red;'>Please enter a valid URL.</p>";
    }
}

function displayMedia(source, type) {
    const previewSection = document.getElementById("previewSection");

    let mediaElement;
    if (type.startsWith("image") || type === "image/url") {
        mediaElement = document.createElement("img");
        mediaElement.src = source;
        mediaElement.alt = "Selected Image";
    } else if (type.startsWith("video")) {
        mediaElement = document.createElement("video");
        mediaElement.src = source;
        mediaElement.controls = true;
    }

    if (mediaElement) {
        previewSection.appendChild(mediaElement);
    }
}

async function sendToFlask() {
    const fileInput = document.getElementById("fileInput").files[0];
    if (!fileInput) {
        alert("Please select a file first!");
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput);

    let API_URL = "http://127.0.0.1:5000/upload";

    try {
        let response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let result = await response.json(); 

        console.log("Response from Flask:", result);

        if (result.redirect_url) {
            window.open(result.redirect_url, "_blank"); 
        } else {
            document.getElementById("resultSection").innerHTML = `
                <p>File uploaded successfully!</p>
                <pre>${JSON.stringify(result, null, 2)}</pre>
            `;
        }

    } catch (error) {
        console.error("Error connecting to the server:", error);
        alert("Error connecting to the server!\n" + error.message);
    }
}

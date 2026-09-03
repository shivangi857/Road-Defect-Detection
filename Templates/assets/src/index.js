async function sendToFlask() {
    const fileInput = document.getElementById("fileInput").files[0];
    if (!fileInput) {
        alert("Please select a file first!");
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput);

    let API_URL = "http://127.0.0.1:5000/upload";  // Flask URL

    try {
        // Show loading message
        document.getElementById("resultSection").innerText = "Processing...";

        let response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let result = await response.json();
        console.log("Response from Flask:", result);

        // Display result
        document.getElementById("resultSection").innerText = JSON.stringify(result, null, 2);

        // Show uploaded image
        let imageUrl = `http://127.0.0.1:5000/uploads/${result.filename}`;
        let preview = document.createElement("img");
        preview.src = imageUrl;
        preview.alt = "Processed Image";
        preview.style.maxWidth = "100%";
        document.getElementById("previewSection").appendChild(preview);

    } catch (error) {
        console.error("Error:", error);
        alert("Error connecting to the server!");
    }
}

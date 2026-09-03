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
        let response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        let result = await response.json();
        console.log("Response from Flask:", result);
        document.getElementById("resultSection").innerText = JSON.stringify(result, null, 2);
    } catch (error) {
        console.error("Error:", error);
        alert("Error connecting to the server!");
    }
}

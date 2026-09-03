from flask import Flask, request, jsonify, render_template, url_for, session, send_from_directory
import os
from ultralytics import YOLO
from werkzeug.utils import secure_filename
from flask_session import Session
import cv2
import json


app = Flask(__name__, template_folder="templates")


app.config["SECRET_KEY"] = "your_secret_key"
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


UPLOAD_FOLDER = os.path.join(app.root_path, "static", "uploads")
PROCESSED_FOLDER = os.path.join(app.root_path, "static", "processed")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["PROCESSED_FOLDER"] = PROCESSED_FOLDER


model = YOLO(r"C:\Users\shivangi\flask_app\best (1) (1).pt")


@app.route('/')
def intro():
    return render_template('intro.html')

@app.route('/start')
def start():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/team')
def team():
    return render_template('team.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    print(f" File saved at: {os.path.abspath(filepath)}")

    
    results = model.predict(filepath, stream=True)

    predictions = []
    processed_img = cv2.imread(filepath)

    for result in results:
        if not hasattr(result.boxes, 'xyxy'):
            continue  

        boxes = result.boxes.xyxy
        for box, conf, cls in zip(boxes, result.boxes.conf, result.boxes.cls):
            bbox = [int(x) for x in box.tolist()]
            predictions.append({
                "class": model.names[int(cls)],
                "confidence": float(conf),
                "bbox": bbox
            })

            
            x1, y1, x2, y2 = bbox
            cv2.rectangle(processed_img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(processed_img, f"{model.names[int(cls)]} {conf:.2f}",
                        (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    
    processed_filename = "output.jpg"
    processed_path = os.path.join(app.config["PROCESSED_FOLDER"], processed_filename)
    cv2.imwrite(processed_path, processed_img)

    
    predictions_file = os.path.join(app.config["PROCESSED_FOLDER"], "predictions.json")
    with open(predictions_file, "w") as f:
        json.dump(predictions, f)

    return jsonify({"redirect_url": url_for('result')})

@app.route('/result')
def result():
    predictions_file = os.path.join(app.config["PROCESSED_FOLDER"], "predictions.json")
    if os.path.exists(predictions_file):
        with open(predictions_file, "r") as f:
            predictions = json.load(f)
    else:
        predictions = []

    return render_template('result.html', predictions=predictions)

@app.route('/static/processed/<filename>')
def processed_image(filename):
    return send_from_directory(app.config["PROCESSED_FOLDER"], filename)

if __name__ == '__main__':
    app.config["TEMPLATES_AUTO_RELOAD"] = True
    app.run(host="0.0.0.0", port=5000, debug=True)

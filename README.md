# 🏠 SmartHome-LED (IoT Project)

A complete IoT Smart Home system that allows you to control lighting via a **Web Dashboard** or **Hand Gestures** (Ultrasonic Sensor). The system stays synchronized in real-time across all devices using Firebase and sends status notifications via **Telegram**.

> **🎓 Note:** This is a mini-project developed for the **Microprocessor and Internet of Things** course.

## ✨ Features

* **Dual Control:** Toggle the LED remotely via the React Web App or locally using hand waves (Ultrasonic Sensor).
* **Real-time Synchronization:** Status updates instantly across the Web Dashboard and hardware via Firebase Realtime Database.
* **Smart Alerts:** Receive **Telegram notifications** whenever the light is toggled, specifying the source (e.g., "Light ON (via Web App)").
* **Modern Dashboard:** Responsive UI built with React, Tailwind CSS, and Lucide Icons.
* **Connection Status:** Live indicator showing if the dashboard is connected to the cloud.

---

## 👥 Contributors

* **Phuriphat Hemakul** - [GitHub Profile](https://github.com/PhuriphatiZAMU)
* **Kitkhachon Chirawongrungrueang** - [GitHub Profile](https://github.com/Kitkhachon-xx)

---

## 🛠️ Tech Stack

### **Hardware**

* **Microcontroller:** ESP8266 (NodeMCU / Wemos D1 Mini)
* **Sensors:** HC-SR04 Ultrasonic Sensor
* **Output:** LED (or Relay Module for AC lights)

### **Software**

* **Frontend:** React (Vite), Tailwind CSS
* **Backend / DB:** Firebase Realtime Database (REST API)
* **Notifications:** Telegram Bot API
* **Firmware:** C++ (Arduino IDE) with `Firebase_ESP_Client` & `UniversalTelegramBot`

---

## 🔌 Hardware Setup

### Pin Mapping (ESP8266)

| Component | ESP8266 Pin | Description |
| --- | --- | --- |
| **HC-SR04 Trig** | `D5` | Ultrasonic Trigger |
| **HC-SR04 Echo** | `D6` | Ultrasonic Echo |
| **LED (+)** | `D7` | Light Output (Anode) |
| **LED (-)** | `GND` | Ground |

> **Note:** If you are using a Relay Module instead of an LED, connect the Relay's Signal Pin to `D7`.

---

## 🚀 Getting Started

### 1. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Create a **Realtime Database**.
3. Go to **Project Settings > Service accounts > Database secrets** to get your **Database Secret**.
4. Note your **Database URL** (e.g., `https://your-project.firebaseio.com/`).

### 2. Telegram Bot Setup

1. Search for `@BotFather` on Telegram.
2. Create a new bot (`/newbot`) to get your **Bot Token**.
3. Get your **Chat ID** (you can use `@userinfobot`).

### 3. Frontend Setup (Web App)

1. Clone this repository and navigate to the project folder.
2. Install dependencies:
```bash
npm install

```


3. Create a `.env` file in the root directory and add your Firebase credentials:
```env
VITE_DB_URL=https://your-project-id.firebaseio.com
VITE_DB_SECRET=your_firebase_database_secret

```


4. Run the development server:
```bash
npm run dev

```



### 4. Firmware Setup (ESP8266)

1. Open `SmartHome-LED.ino` in the Arduino IDE.
2. Install the required libraries via Library Manager:
* `Firebase Arduino Client Library for ESP8266 and ESP32`
* `UniversalTelegramBot`
* `ArduinoJson`


3. Update the configuration section in the code:
```cpp
#define WIFI_SSID "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define DATABASE_URL "your-project.firebaseio.com"
#define DATABASE_SECRET "your_firebase_database_secret"
#define BOT_TOKEN "your_telegram_bot_token"
#define CHAT_ID "your_telegram_chat_id"

```


4. Upload the code to your ESP8266 board.

---

## 📡 Architecture

1. **Web App:** Reads/Writes boolean status to `home/light/status` on Firebase.
2. **ESP8266:**
* Polls Firebase for changes to update the LED.
* Monitors the Ultrasonic sensor. If a hand is detected (distance 2-15cm), it toggles the state locally and pushes the update to Firebase.


3. **Telegram:** The ESP8266 sends a POST request to the Telegram API whenever the state changes.

---

## 📂 Project Structure

```text
smarthome-led/
├── src/
│   ├── App.jsx        # Main Dashboard Logic (Fetch/Toggle)
│   ├── main.jsx       # Entry Point
│   └── index.css      # Tailwind Import
├── SmartHome-LED.ino  # ESP8266 Firmware Code
├── .env               # Environment Variables (ignored by git)
├── package.json       # Node Dependencies
└── README.md          # Project Documentation

```

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).

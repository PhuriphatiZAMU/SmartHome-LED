#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>
#include <ArduinoJson.h>

// --- 1. ตั้งค่า WiFi ---
#define WIFI_SSID "iQOO Z9 5G"
#define WIFI_PASSWORD "11111111"

// --- 2. ตั้งค่า Firebase ---
#define DATABASE_URL "iotproject-10b6f-default-rtdb.firebaseio.com" 
#define DATABASE_SECRET "QRZHJdbKhU3FcZpFmTbIQANAKQL5mPHFqZFoElhc" 

// --- 3. ตั้งค่า Telegram ---
#define BOT_TOKEN "8450354943:AAHt58_nut8-35eqym7z5XLy0FHevk_hU2A"
#define CHAT_ID "6126149298"

// --- กำหนดขา Pin ---
#define TRIG_PIN D5
#define ECHO_PIN D6
#define LED_PIN D7

// --- ตัวแปรระบบ ---
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
WiFiClientSecure client;
UniversalTelegramBot bot(BOT_TOKEN, client);

bool ledState = false;          
bool objectDetected = false;
unsigned long lastDebounceTime = 0;
unsigned long lastFirebaseCheck = 0;

String dbPath = "/home/light/status"; 

// ฟังก์ชันอ่านระยะทาง
long readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 5000); 
  if (duration == 0) return 999;
  return duration * 0.034 / 2;
}

// 📌 ฟังก์ชันส่ง Telegram (แยกออกมาเพื่อให้เรียกใช้ซ้ำได้)
void sendTelegramAlert(bool state, String source) {
  Serial.println("Sending Telegram...");
  // ระบุแหล่งที่มาด้วยว่าเปิดจากไหน (Sensor หรือ Web)
  String msg = state ? "💡 ไฟเปิดแล้ว (จาก " + source + ")" : "🌑 ไฟปิดแล้ว (จาก " + source + ")";
  
  if (bot.sendMessage(CHAT_ID, msg, "")) {
      Serial.println("Telegram Sent!");
  } else {
      Serial.println("Telegram Failed (Low Memory?)");
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("\nStarting...");
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());

  client.setBufferSizes(512, 512); // ลด Buffer แก้จอฟ้า
  client.setInsecure();

  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET;
  
  config.timeout.wifiReconnect = 10 * 1000;
  config.timeout.socketConnection = 10 * 1000;
  config.timeout.serverResponse = 10 * 1000;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // --- ส่วนที่ 1: รับค่าจาก Web App ---
  if (millis() - lastFirebaseCheck > 500) { 
    if (Firebase.ready()) {
      if (Firebase.RTDB.getBool(&fbdo, dbPath)) {
        bool serverState = fbdo.boolData();
        
        // ถ้าค่าจากเว็บไม่ตรงกับสถานะปัจจุบัน (แสดงว่ามีการกดผ่านเว็บ)
        if (serverState != ledState) {
          ledState = serverState;
          digitalWrite(LED_PIN, ledState ? HIGH : LOW);
          Serial.println("Updated from Web: " + String(ledState));
          
          // ✅ เพิ่มบรรทัดนี้: ส่งแจ้งเตือนเมื่อสั่งผ่านเว็บ
          sendTelegramAlert(ledState, "Web App");
        }
      }
    }
    lastFirebaseCheck = millis();
  }

  // --- ส่วนที่ 2: เซนเซอร์ HC-SR04 ---
  long distance = readDistance();

  if (distance > 2 && distance < 15) {
    if (!objectDetected && (millis() - lastDebounceTime > 500)) {
      
      delay(30); 
      long confirmDist = readDistance();
      
      if (confirmDist > 2 && confirmDist < 15) { 
        
        Serial.println("Hand Wave Confirmed!");
        ledState = !ledState;
        digitalWrite(LED_PIN, ledState ? HIGH : LOW);

        // ส่ง Firebase
        Firebase.RTDB.setBool(&fbdo, dbPath, ledState);
        
        // ✅ ส่งแจ้งเตือนเมื่อสั่งผ่านเซนเซอร์
        sendTelegramAlert(ledState, "Sensor");

        objectDetected = true;
        lastDebounceTime = millis();
      }
    }
  } else {
    if (distance > 20) {
      objectDetected = false;
    }
  }
}
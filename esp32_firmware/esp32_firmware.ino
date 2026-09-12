/*
 * =====================================================================
 * Smart Milk Chilling Can - ESP32 Firmware
 * SIH Hackathon Cold-Chain Monitoring System
 * 
 * Hardware:
 *   - ESP32 NodeMCU / DevKit
 *   - DS18B20 Digital 1-Wire Temperature Sensor (GPIO 4 + 4.7kΩ pull-up)
 *   - Analog pH Sensor Module (Signal connected to GPIO 34 - ADC1_CH6)
 *
 * Destination:
 *   HTTP POST to: http://<LAPTOP_IP>:4000/api/readings
 * =====================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ==========================================
// 1. CONFIGURATION: Wi-Fi Credentials
// ==========================================
// Connect both your ESP32 and Laptop to the SAME Wi-Fi or Mobile Hotspot
const char* ssid     = "YOUR_WIFI_OR_HOTSPOT_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// ==========================================
// 2. CONFIGURATION: Backend Server URL
// ==========================================
// Replace with your laptop's current local IP address
// (Run `ifconfig` or check the dashboard header)
const char* serverUrl = "http://10.80.132.17:4000/api/readings";

// ==========================================
// 3. HARDWARE PIN DEFINITIONS
// ==========================================
#define ONE_WIRE_BUS 4        // DS18B20 Data wire connected to GPIO 4
#define PH_PIN 34             // Analog pH signal connected to GPIO 34 (ADC1_CH6)

// Polling interval in milliseconds (30 seconds)
const unsigned long SEND_INTERVAL_MS = 30000; 

// ==========================================
// 4. SENSOR CALIBRATION PARAMETERS
// ==========================================
// Linear formula: pH = (slope * voltage) + offset
// Calibrate with pH 7.0 and pH 4.0 buffer solutions
// Default typical constants for standard 5V/3.3V analog modules:
float ph_slope = -5.70;   // Slope (m)
float ph_offset = 21.34;  // Intercept (c)

// Setup DS18B20 1-Wire bus
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature ds18b20(&oneWire);

unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==========================================");
  Serial.println("🥛 Smart Milk Chilling Can - ESP32 Node");
  Serial.println("==========================================");

  // Initialize DS18B20
  ds18b20.begin();
  Serial.println("[Sensor] DS18B20 Temperature Probe initialized on GPIO 4");

  // Configure ADC for pH probe (12-bit resolution: 0 - 4095, 3.3V range)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db); // Measures up to ~3.1V
  Serial.println("[Sensor] Analog pH Sensor configured on GPIO 34");

  // Connect to Wi-Fi
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Failed to connect. Will retry during main loop...");
  }
}

// Read and average analog pH probe voltage
float readPH() {
  int numSamples = 20;
  long adcSum = 0;

  for (int i = 0; i < numSamples; i++) {
    adcSum += analogRead(PH_PIN);
    delay(10);
  }

  float averageAdc = (float)adcSum / numSamples;
  // Convert 12-bit ADC reading (0-4095) to Voltage (0 - 3.3V)
  float voltage = (averageAdc / 4095.0) * 3.3;

  // Compute pH using linear calibration
  float phVal = (ph_slope * voltage) + ph_offset;

  // Clamping to realistic bounds (0 - 14)
  if (phVal < 0.0) phVal = 0.0;
  if (phVal > 14.0) phVal = 14.0;

  Serial.print("[pH Probe] ADC: ");
  Serial.print(averageAdc);
  Serial.print(" | Voltage: ");
  Serial.print(voltage, 3);
  Serial.print("V | Calculated pH: ");
  Serial.println(phVal, 2);

  return phVal;
}

// Read temperature in Celsius from DS18B20
float readTemperature() {
  ds18b20.requestTemperatures();
  float tempC = ds18b20.getTempCByIndex(0);

  // Check for sensor disconnect (-127C means disconnected)
  if (tempC == DEVICE_DISCONNECTED_C) {
    Serial.println("[DS18B20] Error: Sensor not detected! Check 4.7kΩ pull-up resistor.");
    return 25.0; // Fallback ambient reading
  }

  Serial.print("[DS18B20] Milk Temperature: ");
  Serial.print(tempC, 2);
  Serial.println(" °C");

  return tempC;
}

// Post telemetry JSON to Express Backend
void sendTelemetry(float tempC, float phVal) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Lost connection. Reconnecting...");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // Construct JSON body
  String jsonPayload = "{\"temperature_c\":" + String(tempC, 2) + ",\"ph\":" + String(phVal, 2) + "}";

  Serial.print("[HTTP] POSTing to ");
  Serial.print(serverUrl);
  Serial.print(" Payload: ");
  Serial.println(jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print("[HTTP] Success! Response code: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.print("[HTTP] Server response: ");
    Serial.println(response);
  } else {
    Serial.print("[HTTP] POST failed. Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }

  http.end();
}

void loop() {
  unsigned long now = millis();

  // Send reading immediately on boot, then every SEND_INTERVAL_MS
  if (now - lastSendTime >= SEND_INTERVAL_MS || lastSendTime == 0) {
    lastSendTime = now;

    Serial.println("\n--- [New Reading Cycle] ---");
    float currentTemp = readTemperature();
    float currentPH = readPH();

    sendTelemetry(currentTemp, currentPH);
  }

  delay(100);
}

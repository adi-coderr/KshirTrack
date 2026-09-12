# ESP32 Hardware Wiring & Flashing Guide

This firmware reads the **DS18B20 digital temperature probe** and the **analog pH electrode module**, then performs an HTTP `POST` request over local Wi-Fi to your laptop backend.

---

## 1. Hardware Pinout & Wiring

| Sensor Pin | ESP32 Pin | Note |
|---|---|---|
| **DS18B20 VCC** (Red) | **3.3V** or **5V** | Power pin |
| **DS18B20 GND** (Black) | **GND** | Ground |
| **DS18B20 DATA** (Yellow/Blue) | **GPIO 4** | **Requires a 4.7kΩ pull-up resistor** between VCC and DATA |
| **pH Module VCC** | **5V** (or 3.3V) | Sensor power |
| **pH Module GND** | **GND** | Common ground with ESP32 |
| **pH Module Po (Analog Out)** | **GPIO 34** | ADC1 Channel (ADC2 pins must NOT be used with Wi-Fi) |

---

## 2. Setting Up in Arduino IDE

1. **Install ESP32 Board Package**:
   - In Arduino IDE, go to **Settings / Preferences** &rarr; Add ESP32 URL:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Go to **Boards Manager** &rarr; Search `esp32` &rarr; Install `esp32 by Espressif Systems`.
   - Select Board: **ESP32 Dev Module** (or your specific board).

2. **Install Required Libraries**:
   - Go to **Library Manager** (`Ctrl+Shift+I` or `Cmd+Shift+I`) and install:
     - `DallasTemperature` by Miles Burton
     - `OneWire` by Paul Stoffregen

3. **Configure Wi-Fi & Laptop IP in [esp32_firmware.ino](file:///Users/adi/Documents/SIH/esp32_firmware/esp32_firmware.ino)**:
   - Line 25:
     ```cpp
     const char* ssid     = "YOUR_PHONE_HOTSPOT_NAME";
     const char* password = "YOUR_HOTSPOT_PASSWORD";
     ```
   - Line 32:
     ```cpp
     const char* serverUrl = "http://10.80.132.17:4000/api/readings";
     ```
     *(Make sure your laptop and ESP32 are connected to the same Wi-Fi or hotspot).*

4. **Upload to ESP32**:
   - Select the USB serial port &rarr; Click **Upload**.
   - Open **Serial Monitor** at **115200 baud** to see live readings being transmitted.

---

## 3. Quick Terminal Test (Simulate an ESP32 Right Now)

To verify the backend accepts readings exactly like an ESP32 would:
```bash
curl -X POST http://localhost:4000/api/readings \
  -H "Content-Type: application/json" \
  -d '{"temperature_c": 5.2, "ph": 6.65}'
```
Watch your dashboard at `http://localhost:3000` immediately update with the reading in real time!

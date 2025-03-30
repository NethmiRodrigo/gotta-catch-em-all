# ESP32 CSI Collection Tool

This repository contains a complete system for collecting and visualizing Channel State Information (CSI) data using ESP32 devices. The system consists of firmware for ESP32 devices and a backend/frontend for data visualization and collection.

## Repository Structure

```
├── firmware/
│ ├── active_ap/ # Access Point (AP) firmware
│ ├── active_sta/ # Station (STA) firmware
│ └── components/ # Shared components for ESP32 projects
├── backend/ # Python-based backend server
├── frontend/ # Web-based visualization interface to help data collection
├── model/ # The statistical model that estimates the location of an individual within an area of interest
├── training-data / # Data collected to calibrate the model
├── testing-data / # Real world data collected to test the model
└── paper/ # The thesis of this project
```

## Quick Start

### Setting up the ESP32 Devices

1. You'll need two ESP32 devices - one configured as an Access Point (AP) and another as a Station (STA).

2. Install ESP-IDF development framework if you haven't already.

3. Configure and flash the devices:

   For the Access Point (AP):

   ```bash
   cd firmware/active_ap
   idf.py menuconfig
   idf.py flash monitor
   ```

   For the Station (STA):

   ```bash
   cd firmware/active_sta
   idf.py menuconfig
   idf.py flash monitor
   ```

The ESP32 CSI firmware code in this repository was not created by me and is the work of other developers in the ESP32 CSI community. Credit for the firmware implementation belongs to its original creators. If you recognize this code and know its origins, please let me know so I can provide proper attribution.

See [Espressif's official documentation](http://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/index.html) for guidance on setting up the esp32 devices

### Setting up the Visualization System

1. Configure the backend:

   ```bash
   cd backend
   # Create and edit config.ini with your settings:
   # - Server host and port
   # - Serial port configuration
   # - CSV file name for data storage
   ```

2. Start the backend server:

   ```bash
   python server.py
   ```

3. Open the frontend interface:
   ```bash
   cd frontend
   # Serve index.html using your preferred web server
   ```

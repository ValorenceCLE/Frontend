# **Vue Web Interface for Raspberry Pi Project**

This repository contains the frontend web interface built with Vue.js for the Raspberry Pi project, aimed at replacing the Control By Web (CBW) system with a custom circuit board powered by an embedded Raspberry Pi.

_[Control By Web](https://controlbyweb.com/)_

## **Background**

- The CBW system provides remote relay control, real-time sensor readings, and a web interface for monitoring and managing hardware.
- This project aims to develop a modern, responsive web interface using **Vue.js** to replace the CBW’s web functionalities.
- In addition to matching CBW's web capabilities, this frontend is designed for improved user experience, better data visualization, and enhanced integration with backend services.

## **Project Features**

- **Real-Time Monitoring**: Display live sensor data collected by the Raspberry Pi.
- **Relay Control**: Toggle relays directly from the web interface.
- **Data Visualization**: Visualize trends and logs using interactive charts powered by **ECharts**.
- **Secure Access**: User authentication and role-based access control.

## **Project Installation**

1. Clone the repository:  
   **`git clone https://github.com/ValorenceCLE/Frontend.git`**

2. Navigate to the project directory:  
   **`cd Frontend`**

3. Install the required dependencies:  
   **`npm install`**

4. Start the development server:  
   **`npm run dev`**

5. Open your browser and navigate to **`http://localhost:3000`** to view the app.

## **Project Configuration**

- The frontend is configured to communicate with backend services hosted on the Raspberry Pi.


## **Technologies Used**

- **Vue 3**: The core framework for building user interfaces.
- **Pinia**: State Management
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Vue Router**: For handling client-side navigation.
- **ECharts**: For advanced data visualization and charting.

## **Acknowledgment**

All code was written and developed by **Landon Bell**, an employee of **Valorence**.

All Hardware was developed by **Kelton Page**, an employee of **Valorence**.

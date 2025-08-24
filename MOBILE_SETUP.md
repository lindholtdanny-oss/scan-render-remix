# Mobile App Setup for LiDAR Scanning

This guide explains how to set up the mobile app to test LiDAR scanning functionality on your iOS device.

## Prerequisites

- iOS device with LiDAR sensor (iPhone 12 Pro or newer, iPad Pro 2020 or newer)
- Mac with Xcode installed (for iOS development)
- Node.js and npm installed

## Setup Instructions

### 1. Export to GitHub
1. Click the "Export to GitHub" button in Lovable
2. Clone the repository to your local machine:
   ```bash
   git clone <your-repo-url>
   cd <your-project-name>
   ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add iOS Platform
```bash
npx cap add ios
```

### 4. Update iOS Dependencies
```bash
npx cap update ios
```

### 5. Build the Project
```bash
npm run build
```

### 6. Sync with Capacitor
```bash
npx cap sync
```

### 7. Run on iOS
```bash
npx cap run ios
```

This will open Xcode where you can:
- Select your iOS device as the target
- Build and run the app on your device
- Test the LiDAR scanning functionality

## LiDAR Features

The integrated LiDAR scanner provides:

- **Room Scanning**: Capture 3D point clouds of your space
- **Real-time Visualization**: See the scan data as it's captured
- **Measurements**: Get accurate room dimensions
- **Export Capability**: Save scan data for later use
- **Point Cloud Rendering**: View captured data in 2D projection

## Device Support

LiDAR scanning is available on:
- iPhone 12 Pro / Pro Max
- iPhone 13 Pro / Pro Max  
- iPhone 14 Pro / Pro Max
- iPhone 15 Pro / Pro Max
- iPad Pro 11" (2020 and newer)
- iPad Pro 12.9" (2020 and newer)

## Testing in Development

For development testing:
- The app shows LiDAR support status
- Provides mock data when LiDAR isn't available
- Gracefully handles unsupported devices

## Next Steps

To enable full LiDAR functionality, you'll need to:
1. Create a custom Capacitor plugin for ARKit integration
2. Implement native iOS code for LiDAR data capture
3. Bridge the native functionality to JavaScript

For detailed mobile development guidance, visit: https://lovable.dev/blogs/TODO
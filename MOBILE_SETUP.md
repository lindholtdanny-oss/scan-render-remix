# Mobile App Setup for LiDAR Scanning

This guide explains how to set up the mobile app to test LiDAR scanning functionality on your iOS device.

## Prerequisites

- iOS device with LiDAR sensor (iPhone 12 Pro or newer, iPad Pro 2020 or newer)  
- Mac with Xcode 14.0 or newer
- Node.js 18.0 or newer and npm installed
- Apple Developer Account (for device testing)

## Quick Setup Instructions

### 1. Export to GitHub
1. In Lovable, click the "GitHub" button in the top right
2. Click "Connect to GitHub" and authorize the app
3. Click "Create Repository" to create a new GitHub repo
4. Clone the repository to your Mac:
   ```bash
   git clone <your-repo-url>
   cd <your-project-name>
   ```

### 2. Install Dependencies & Setup iOS
```bash
# Install all dependencies
npm install

# Add iOS platform (creates ios/ folder)
npx cap add ios

# Build the web app
npm run build

# Sync web app with native iOS project
npx cap sync ios

# Update iOS platform dependencies
npx cap update ios
```

### 3. Configure iOS Project in Xcode
```bash
# Open the iOS project in Xcode
npx cap open ios
```

In Xcode, you need to:
1. **Set Team & Bundle ID**: Select your project → Signing & Capabilities → Select your Apple Developer Team
2. **Set Deployment Target**: Set to iOS 14.0 or higher for LiDAR support
3. **Verify Permissions**: Check that camera and ARKit permissions are in Info.plist (already configured)

### 4. Build & Test on Device
1. Connect your iPhone with LiDAR (iPhone 12 Pro or newer)
2. Select your device in Xcode's device dropdown
3. Click the "Play" button to build and install on your device
4. On your iPhone, trust the developer certificate: Settings → General → VPN & Device Management
5. Open the app and test LiDAR scanning

## Important Notes

- **LiDAR only works on physical devices** - not simulators
- **Camera permissions** will be requested when you first try to scan
- **ARKit permissions** are required for 3D scene reconstruction
- The app will show "LiDAR not supported" on non-LiDAR devices

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
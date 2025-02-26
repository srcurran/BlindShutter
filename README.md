
# React Native Image Processing App

This app allows users to take photos and process them using AI image generation.

## Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will run on `0.0.0.0:5000`

## React Native Setup

1. Install React Native CLI globally:
```bash
npm install -g react-native-cli
```

2. Install iOS dependencies:
```bash
cd ios
pod install
cd ..
```

3. Start Metro bundler:
```bash
npx react-native start
```

4. Run iOS simulator:
```bash
npx react-native run-ios
```

## TestFlight Setup

1. Ensure you have:
- Apple Developer Account
- Xcode latest version
- App Store Connect access

2. Configure iOS app:
- Open `ios/YourApp.xcworkspace` in Xcode
- Set Bundle Identifier
- Sign with your Apple Developer account
- Set version and build numbers

3. Archive and Upload:
- Select "Any iOS Device" as build target
- Product > Archive
- Upload to App Store Connect via Xcode

4. TestFlight Configuration:
- Log into App Store Connect
- Navigate to TestFlight tab
- Add internal testers
- Wait for beta review
- Share TestFlight links with testers

## Environment Variables

Required environment variables:
```
OPENAI_API_KEY=your_key_here
```

Use the Replit Secrets tool to set these variables securely.

Development Setup

This document explains how to install dependencies, start the development server, and run the application on web, mobile devices, and emulators/simulators.

1. Install Dependencies

Clone the repository, then install all required packages:

npm install


Make sure Node.js LTS is installed on your machine before running the above command.

2. Start the Development Server

To start the Expo development server:

npx expo start


This will open the Expo CLI in your terminal or browser.
All platform options (web, Android, iOS) will be available from this screen.

3. Running on Mobile Devices
Option A: Expo Go (recommended for quick testing)

Start the server:

npx expo start


Scan the QR code:

iOS: use the built-in Camera app

Android: use the Expo Go app

The project will load inside Expo Go.

Note: Expo Go has limitations and cannot run custom native modules, but this project does not require them for development.

Option B: Development Build (full native environment)

For teammates needing full native modules or offline builds:

Android:
npx expo run:android

iOS (macOS only):
npx expo run:ios


This will install a development build on your device or emulator.
The dev build connects directly to your local server.

Option C: Emulator/Simulator

After running npx expo start:

Press a to launch the Android emulator

Press i to launch the iOS simulator (macOS only)

Expo will automatically install and run the app inside the emulator.

4. Running on Web

To run the web version of the app:

npx expo start --web


Or, after running npx expo start, press w.

This will open the project in your default browser using Expo's React Native Web renderer.

5. Hot Reloading

Any changes made inside the app directory will automatically refresh on all connected platforms.

If hot reload stops responding, use:

r in the terminal to reload

Shift + R to clear cache and restart

6. Environment Requirements

Node.js LTS installed

A Firebase project configured

Correct Firebase values placed in lib/firebase.ts

No additional global packages are required.


Firebase Security Rules (Development Defaults)

For development, the project uses permissive rules so all teammates can read/write without authentication issues.
Add these rules to your Firebase Firestore Rules panel:

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Allow full access ONLY to authenticated users
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Block all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}


Notes:

All user data is stored under users/{uid} and protected by request.auth.uid == uid.

No public collections are used.

If your dev environment needs temporary open access (not recommended), you can relax the rules, but revert before deployment.

Troubleshooting Guide
1. Expo cannot find devices or refuses to reload

Try clearing cache:

npx expo start -c


Or inside Expo CLI press:

Shift + R

2. Firebase errors: “Missing or insufficient permissions”

Check:

Firebase rules are updated (see section above).

Your Firebase config in lib/firebase.ts matches the correct project.

You are signed in using the same Firebase project on web and mobile.

3. iOS simulator not opening

Requirements:

macOS

Xcode installed

Run:

sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
npx expo run:ios

4. Android emulator not launching

Make sure:

Android Studio is installed

An emulator is created (AVD Manager)

Expo CLI can see it:

adb devices


If no devices appear:

sudo lsof -i :5037
adb kill-server
adb start-server


Then try:

npx expo run:android

5. App stuck on “Loading…” or “Metro bundler not starting”

Check for:

Missing node modules:

rm -rf node_modules
npm install


Invalid imports or circular dependencies (Metro will show the file path).

6. Hot reload not updating changes

Try toggling:

Disable Fast Refresh → re-enable

Restart Expo Go on device

Restart Metro bundler

7. “Firebase app already initialized” error

In lib/firebase.ts, ensure Firebase is initialized once:

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

8. App crashes on mobile but works on web

Check:

Missing native modules (web-only packages will break mobile)

Undefined values passed to UI components

useEffect hooks with missing dependencies

Use:

expo run:android


to get native logs in real time.
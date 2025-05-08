# SilentTalk - Sign Language Recognition App

SilentTalk is a React Native mobile application that allows users to translate sign language gestures into text using a camera interface.

## Features

- Capture sign language gestures through recorded video
- Upload existing videos from your device gallery
- Interpret and display the textual meaning of sign language gestures
- Translate results to Vietnamese
- User-friendly interface with loading animations and visual feedback

## Mockup Implementation

This version of SilentTalk implements a mockup API service that simulates calls to a remote service but runs entirely client-side. This makes the app easy to demo without requiring any backend setup.

### Mock API Features

- Simulates network requests to a remote API
- Recognizes common signs like "Hello", "Thank you", "How are you?" etc.
- Provides mock translations between English and Vietnamese
- Implements random delays to simulate real network latency
- Properly handles online/offline states

## Getting Started

### Prerequisites

- Node.js (16.x or later)
- Expo CLI
- Android or iOS device/emulator

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the application:
   ```
   npm start
   ```
4. Use the Expo Go app to scan the QR code

## How to Use

1. Launch the app
2. Allow camera and microphone permissions when prompted
3. Use the bottom toolbar to:
   - Access your gallery (left button)
   - Record a sign gesture (center button)
   - Flip the camera (right button)
4. After recording or selecting a video, the app will process it and display the recognized sign
5. You can translate the result to Vietnamese by tapping the "Translate to Vietnamese" button

## Mock Recognition Logic

The mock API currently uses the following logic:
- For recorded videos: Always returns "Hello"
- For first uploaded video: Returns "How are you?"
- For second uploaded video: Returns "I don't understand"
- For subsequent uploads: Checks filename for keywords (like "hello", "thank", etc.)
- Fallback: Returns "Unknown Sign" 
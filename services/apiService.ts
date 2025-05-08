import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';

// Interface for the recognition result
interface RecognitionResult {
  success: boolean;
  prediction?: string;
  confidence?: number;
  error?: string;
}

// Mapping of keywords in filenames to specific sign predictions
const filenameToSignMap: Record<string, { prediction: string, confidence: number }> = {
  "hello": { prediction: "Hello", confidence: 0.95 },
  "thank": { prediction: "Thank you", confidence: 0.92 },
  "goodbye": { prediction: "Goodbye", confidence: 0.91 },
  "yes": { prediction: "Yes", confidence: 0.98 },
  "no": { prediction: "No", confidence: 0.97 },
  "please": { prediction: "Please", confidence: 0.90 },
  "help": { prediction: "Help", confidence: 0.92 },
  "love": { prediction: "I love you", confidence: 0.93 },
  "friend": { prediction: "Friend", confidence: 0.89 },
  "family": { prediction: "Family", confidence: 0.88 },
  "hungry": { prediction: "Hungry", confidence: 0.87 },
  "drink": { prediction: "Drink", confidence: 0.86 },
  "name": { prediction: "Name", confidence: 0.84 },
  "time": { prediction: "Time", confidence: 0.85 },
  "school": { prediction: "School", confidence: 0.86 }
};

/**
 * Mock service for sign language recognition (no server required)
 */
export default {
  /**
   * Check if the device has an internet connection
   * @returns Promise with connection status
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Use NetInfo to check connectivity status
      const netInfoState = await NetInfo.fetch();
      
      // If it's a cellular or wifi connection and isConnected is true
      if (netInfoState.isConnected && 
         (netInfoState.type === 'cellular' || netInfoState.type === 'wifi')) {
        // Double-check with a lightweight fetch
        try {
          const response = await fetch('https://www.google.com', { 
            method: 'HEAD',
            signal: AbortSignal.timeout(3000) // 3 second timeout
          });
          return response.ok;
        } catch (error) {
          console.log('Network fetch check failed:', error);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.log('Network connection check failed:', error);
      return false;
    }
  },

  /**
   * Process a video for sign language recognition (mock implementation)
   * @param videoUri URI to the video file
   * @param isRecorded Optional flag to indicate if the video was recorded by the user
   * @returns Promise with the mock recognition result
   */
  async processVideo(videoUri: string, isRecorded: boolean = false): Promise<RecognitionResult> {
    try {
      console.log(`Processing video locally (mock): ${videoUri}`);
      
      // Check for internet connection first
      const hasConnection = await this.checkConnection();
      if (!hasConnection) {
        return {
          success: false,
          error: 'No internet connection. The sign recognition model requires internet access.'
        };
      }
      
      // Get file info to verify it exists
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      if (!fileInfo.exists) {
        throw new Error('Video file does not exist');
      }
      
      console.log(`File size: ${fileInfo.size} bytes`);
      
      // If the video was recorded by the user, always return "Hello"
      if (isRecorded) {
        return {
          success: true,
          prediction: "Hello",
          confidence: 0.98
        };
      }
      
      // For uploaded videos, check for keywords in the filename
      const filename = videoUri.split('/').pop() || '';
      const filenameLower = filename.toLowerCase();
      
      // Look for keywords in the filename
      for (const [keyword, signInfo] of Object.entries(filenameToSignMap)) {
        if (filenameLower.includes(keyword)) {
          return {
            success: true,
            prediction: signInfo.prediction,
            confidence: signInfo.confidence
          };
        }
      }
      
      // Default response if no match found
      return {
        success: true,
        prediction: "Unknown Sign",
        confidence: 0.6
      };
    } catch (error: any) {
      console.error('Error processing video:', error.message);
      
      // Return error response
      return {
        success: false,
        error: error.message || 'Failed to process video'
      };
    }
  },
  
  /**
   * Check if the local mock service is running (always returns true)
   * @returns Promise with mock server status
   */
  async checkServerStatus() {
    // Check for internet connection
    const hasConnection = await this.checkConnection();
    
    return { 
      isRunning: hasConnection, 
      message: hasConnection ? 'Mock service running' : 'No internet connection',
      modelAvailable: hasConnection
    };
  },
}; 
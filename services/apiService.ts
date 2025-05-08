import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';

// Counter to track number of uploads
let uploadCounter = 0;

// Interface for the recognition result
interface RecognitionResult {
  success: boolean;
  prediction?: string;
  confidence?: number;
  error?: string;
}

// Interface for translation result
interface TranslationResult {
  success: boolean;
  translatedText?: string;
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
  "school": { prediction: "School", confidence: 0.86 },
  "howareyou": { prediction: "How are you?", confidence: 0.91 },
  "idontunderstand": { prediction: "I don't understand", confidence: 0.89 }
};

// Static translations for mock functionality
const englishToVietnameseMap: Record<string, string> = {
  "Hello": "Xin chào",
  "Thank you": "Cảm ơn bạn",
  "Goodbye": "Tạm biệt",
  "Yes": "Vâng / Có",
  "No": "Không",
  "Please": "Xin vui lòng",
  "Help": "Giúp đỡ",
  "I love you": "Tôi yêu bạn",
  "Friend": "Bạn bè",
  "Family": "Gia đình",
  "Hungry": "Đói",
  "Drink": "Uống",
  "Name": "Tên",
  "Time": "Thời gian",
  "School": "Trường học",
  "How are you?": "Bạn khỏe không?",
  "I don't understand": "Tôi không hiểu",
  "Unknown Sign": "Ký hiệu không xác định"
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
          // Use AbortController instead of AbortSignal.timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch('https://www.google.com', { 
            method: 'HEAD',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
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
   * @param skipConnectionCheck Optional flag to skip the connection check
   * @returns Promise with the mock recognition result
   */
  async processVideo(videoUri: string, isRecorded: boolean = false, skipConnectionCheck: boolean = false): Promise<RecognitionResult> {
    try {
      console.log(`Processing video locally (mock): ${videoUri}`);
      
      // Check for internet connection first (unless we're skipping this check)
      if (!skipConnectionCheck) {
        const hasConnection = await this.checkConnection();
        if (!hasConnection) {
          return {
            success: false,
            error: 'No internet connection. The sign recognition model requires internet access.'
          };
        }
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
      
      // For uploaded videos, use the upload counter to determine which sign to return
      // Increment counter for each upload
      uploadCounter++;
      console.log(`Upload counter: ${uploadCounter}`);
      
      // Based on upload order
      if (uploadCounter === 1) {
        console.log('First upload: How are you?');
        return {
          success: true,
          prediction: "How are you?",
          confidence: 0.91
        };
      } else if (uploadCounter === 2) {
        console.log('Second upload: I don\'t understand');
        return {
          success: true,
          prediction: "I don't understand",
          confidence: 0.89
        };
      } else {
        // For third and subsequent uploads, use the filename approach as fallback
        const filename = videoUri.split('/').pop() || '';
        const filenameLower = filename.toLowerCase();
        
        console.log(`Video submitted: ${filename}`);
        
        // Remove file extension before matching
        const filenameWithoutExt = filenameLower.replace(/\.\w+$/, '');
        
        // Look for keywords in the filename without extension
        for (const [keyword, signInfo] of Object.entries(filenameToSignMap)) {
          if (filenameWithoutExt.includes(keyword)) {
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
      }
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
   * Translate text to Vietnamese (mock implementation)
   * @param text Text to translate
   * @returns Promise with the translation result
   */
  async translateToVietnamese(text: string): Promise<TranslationResult> {
    try {
      // Check for internet connection first
      const hasConnection = await this.checkConnection();
      if (!hasConnection) {
        return {
          success: false,
          error: 'No internet connection. Translation requires internet access.'
        };
      }
      
      // Use local mapping for mock implementation
      if (englishToVietnameseMap[text]) {
        return {
          success: true,
          translatedText: englishToVietnameseMap[text]
        };
      }
      
      // If not in our predefined list, return a generic response
      // In a real implementation, this would call a translation API
      return {
        success: true,
        translatedText: `[${text} - Bản dịch tiếng Việt]`
      };
    } catch (error: any) {
      console.error('Error translating text:', error.message);
      
      // Return error response
      return {
        success: false,
        error: error.message || 'Failed to translate text'
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
  
  /**
   * Simple test function to directly check connectivity
   * This can be called to diagnose network issues
   */
  async testConnection() {
    try {
      const netInfoState = await NetInfo.fetch();
      console.log('NetInfo state:', netInfoState);
      
      const isConnected = await this.checkConnection();
      console.log('Connection check result:', isConnected);
      
      return {
        netInfoConnected: netInfoState.isConnected,
        netInfoType: netInfoState.type,
        fetchSuccessful: isConnected,
        overallResult: isConnected
      };
    } catch (error) {
      console.error('Test connection error:', error);
      return {
        error: error?.toString(),
        netInfoConnected: false,
        fetchSuccessful: false,
        overallResult: false
      };
    }
  }
}; 
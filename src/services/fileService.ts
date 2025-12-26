import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Alert, Linking, Platform } from 'react-native';
import { Payslip, PayslipFileType } from '../types/payslip';

// Import the bundled PDF asset
const requirementPdf = require('../../assets/files/requirement.pdf');

/**
 * Result of a file operation
 */
export interface FileOperationResult {
  success: boolean;
  message: string;
  filePath?: string;
}

/**
 * Get the MIME type for a file based on its type
 */
function getMimeType(fileType: PayslipFileType): string {
  switch (fileType) {
    case 'pdf':
      return 'application/pdf';
    case 'image':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Get the file extension for a file type
 */
function getFileExtension(fileType: PayslipFileType): string {
  switch (fileType) {
    case 'pdf':
      return 'pdf';
    case 'image':
      return 'png';
    default:
      return 'bin';
  }
}

/**
 * Get the payslips directory
 */
function getPayslipsDirectory(): Directory {
  return new Directory(Paths.document, 'payslips');
}

/**
 * Get the file for a payslip
 */
function getPayslipFile(payslip: Payslip): File {
  const extension = getFileExtension(payslip.file.type);
  const fileName = `payslip-${payslip.id}.${extension}`;
  return new File(getPayslipsDirectory(), fileName);
}

/**
 * Ensure the payslips directory exists
 */
async function ensurePayslipsDirectory(): Promise<void> {
  const dir = getPayslipsDirectory();
  if (!dir.exists) {
    await dir.create();
  }
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Copy the bundled PDF asset to the payslip file location
 */
async function createSamplePayslipFile(_payslip: Payslip, file: File): Promise<void> {
  // Load the bundled PDF asset
  const asset = Asset.fromModule(requirementPdf);
  await asset.downloadAsync();

  if (!asset.localUri) {
    throw new Error('Failed to load bundled PDF asset');
  }

  // Create a File instance from the asset's local URI
  const assetFile = new File(asset.localUri);
  
  // Copy the asset file to the destination
  await assetFile.copy(file);
}

/**
 * Download a payslip file to device storage
 */
export async function downloadPayslip(payslip: Payslip, forceRedownload = false): Promise<FileOperationResult> {
  try {
    await ensurePayslipsDirectory();
    
    const file = getPayslipFile(payslip);
    
    // Check if file already exists
    if (file.exists) {
      if (forceRedownload) {
        // Delete old file to force re-download
        await file.delete();
      } else {
        // File already exists - on iOS, open share sheet to save to Files
        if (Platform.OS === 'ios') {
          return await saveToFilesOnIOS(payslip, file.uri);
        }
        return {
          success: true,
          message: 'File already downloaded',
          filePath: file.uri,
        };
      }
    }
    
    // Create the sample payslip file
    await createSamplePayslipFile(payslip, file);
    
    // Verify the file was created
    if (file.exists) {
      // On iOS, open share sheet which allows saving to Files app
      if (Platform.OS === 'ios') {
        return await saveToFilesOnIOS(payslip, file.uri);
      }
      
      // On Android, we need to save to public storage for the user to see it
      if (Platform.OS === 'android') {
        try {
          const pickedDirectory = await Directory.pickDirectoryAsync();
          
          if (pickedDirectory) {
            // Read the file we just created internally as base64
            const base64 = await file.base64();
            
            const mimeType = getMimeType(payslip.file.type);
            const extension = getFileExtension(payslip.file.type);
            const fileName = `payslip-${payslip.id}.${extension}`;
            
            // Create file in the user-selected directory
            const newFile = await pickedDirectory.createFile(fileName, mimeType);
            
            // Write data to the new file (convert base64 to bytes)
            const bytes = base64ToBytes(base64);
            await newFile.write(bytes);
            
            return {
              success: true,
              message: 'Payslip saved to device',
              filePath: newFile.uri,
            };
          }
        } catch (error) {
          console.warn('Android directory picker error:', error);
          // Fall back to returning the internal file result
        }
      }

      return {
        success: true,
        message: `Payslip saved successfully`,
        filePath: file.uri,
      };
    } else {
      return {
        success: false,
        message: 'Failed to save payslip file',
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `Download failed: ${errorMessage}`,
    };
  }
}

/**
 * Handle saving to Files app on iOS
 * Saves the file and directly opens Files app (skips share sheet)
 */
async function saveToFilesOnIOS(
  payslip: Payslip,
  filePath: string
): Promise<FileOperationResult> {
  const extension = getFileExtension(payslip.file.type);
  const fileName = `payslip-${payslip.id}.${extension}`;

  // File is already saved in app's Documents folder
  // Offer to open Files app directly (no share sheet)
  return new Promise((resolve) => {
    Alert.alert(
      'Download Complete',
      `Payslip saved as "${fileName}". Open Files app to view it in the app\'s folder.`,
      [
        {
          text: 'OK',
          style: 'cancel',
          onPress: () => {
            resolve({
              success: true,
              message: 'Payslip downloaded successfully',
              filePath,
            });
          },
        },
        {
          text: 'Open Files',
          onPress: async () => {
            try {
              // Open Files app on iOS
              await Linking.openURL('shareddocuments://');
              resolve({
                success: true,
                message: 'Opening Files app...',
                filePath,
              });
            } catch {
              resolve({
                success: true,
                message: 'Payslip saved. Open the Files app to view it.',
                filePath,
              });
            }
          },
        },
      ]
    );
  });
}

/**
 * Preview a payslip file using the native viewer
 */
export async function previewPayslip(payslip: Payslip, forceRedownload = false): Promise<FileOperationResult> {
  try {
    // Ensure the payslips directory and internal file exist
    await ensurePayslipsDirectory();
    const file = getPayslipFile(payslip);
    
    // Check if the internal file exists
    const exists = file.exists;
    
    if (!exists || forceRedownload) {
      // Download the file if it doesn't exist
      if (exists && forceRedownload) {
        await file.delete();
      }
      await createSamplePayslipFile(payslip, file);
      
      // Verify the file was created
      if (!file.exists) {
        return {
          success: false,
          message: 'Could not prepare file for preview',
        };
      }
    }
    
    // Always use the internal file:// URI for preview (not content:// URIs)
    const filePath = file.uri;
    const mimeType = getMimeType(payslip.file.type);
    
    // Check if sharing is available (iOS uses this approach)
    const isSharingAvailable = await Sharing.isAvailableAsync();
    
    if (Platform.OS === 'ios') {
      if (isSharingAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType,
          dialogTitle: `Payslip ${payslip.id}`,
          UTI: payslip.file.type === 'pdf' ? 'com.adobe.pdf' : 'public.image',
        });
        return {
          success: true,
          message: 'File opened successfully',
          filePath,
        };
      }
    } else if (Platform.OS === 'android') {
      // On Android, download to user-selected folder and open the file
      return await previewPayslipOnAndroid(payslip, file, mimeType);
    }
    
    // Web fallback or unsupported platform
    if (isSharingAvailable) {
      await Sharing.shareAsync(filePath, { mimeType });
      return {
        success: true,
        message: 'File shared successfully',
        filePath,
      };
    }
    
    return {
      success: false,
      message: 'File preview is not available on this device',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `Preview failed: ${errorMessage}`,
    };
  }
}

/**
 * Handle preview on Android - downloads to user-selected folder and opens the file
 */
async function previewPayslipOnAndroid(
  payslip: Payslip,
  internalFile: File,
  mimeType: string
): Promise<FileOperationResult> {
  try {
    // Request directory permission from user using modern API
    const pickedDirectory = await Directory.pickDirectoryAsync();
    
    if (!pickedDirectory) {
      return {
        success: false,
        message: 'Storage permission is required to save and open the file',
      };
    }

    // Read the internal file as base64
    const base64 = await internalFile.base64();

    const extension = getFileExtension(payslip.file.type);
    const fileName = `payslip-${payslip.id}.${extension}`;

    // Create file in the user-selected directory
    const savedFile = await pickedDirectory.createFile(fileName, mimeType);

    // Write data to the new file (convert base64 to bytes)
    const bytes = base64ToBytes(base64);
    await savedFile.write(bytes);

    // Now open the file with an appropriate viewer
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: savedFile.uri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: mimeType,
      });
      
      return {
        success: true,
        message: 'File saved and opened successfully',
        filePath: savedFile.uri,
      };
    } catch (openError) {
      console.warn('Could not open file directly:', openError);
      
      // If we can't open directly, use share sheet as fallback
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(savedFile.uri, {
          mimeType,
          dialogTitle: `Open ${fileName}`,
        });
        return {
          success: true,
          message: 'File saved. Choose an app to open it.',
          filePath: savedFile.uri,
        };
      }
      
      // File was saved but couldn't be opened
      return {
        success: true,
        message: `File saved to selected folder as ${fileName}`,
        filePath: savedFile.uri,
      };
    }
  } catch (error) {
    console.warn('Android preview error:', error);
    
    // Fallback: use share sheet with internal file
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
      await Sharing.shareAsync(internalFile.uri, {
        mimeType,
        dialogTitle: `Payslip ${payslip.id}`,
      });
      return {
        success: true,
        message: 'Choose an option to save or open the file',
        filePath: internalFile.uri,
      };
    }
    
    return {
      success: false,
      message: 'Could not save or open the file',
    };
  }
}

/**
 * Delete a downloaded payslip file
 */
export async function deleteDownloadedPayslip(payslip: Payslip): Promise<FileOperationResult> {
  try {
    const file = getPayslipFile(payslip);
    
    if (!file.exists) {
      return {
        success: true,
        message: 'File was already deleted',
      };
    }
    
    await file.delete();
    
    return {
      success: true,
      message: 'File deleted successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `Delete failed: ${errorMessage}`,
    };
  }
}

/**
 * Show an alert with the result of a file operation
 */
export function showFileOperationAlert(result: FileOperationResult, title: string = 'Download'): void {
  Alert.alert(
    result.success ? `${title} Successful` : `${title} Failed`,
    result.message,
    [{ text: 'OK' }]
  );
}

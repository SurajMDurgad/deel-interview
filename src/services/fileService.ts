import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
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
 * Check if a path exists using legacy API
 */
async function checkPathExists(uri: string): Promise<boolean> {
  try {
    const info = await FileSystemLegacy.getInfoAsync(uri);
    return info.exists;
  } catch {
    return false;
  }
}

/**
 * Ensure the payslips directory exists
 */
async function ensurePayslipsDirectory(): Promise<void> {
  const dir = getPayslipsDirectory();
  const exists = await checkPathExists(dir.uri);
  if (!exists) {
    await dir.create();
  }
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

  // Use legacy API to copy the file (more reliable)
  await FileSystemLegacy.copyAsync({
    from: asset.localUri,
    to: file.uri,
  });
}

/**
 * Download a payslip file to device storage
 */
export async function downloadPayslip(payslip: Payslip, forceRedownload = false): Promise<FileOperationResult> {
  try {
    await ensurePayslipsDirectory();
    
    const file = getPayslipFile(payslip);
    
    // Check if file already exists
    const exists = await checkPathExists(file.uri);
    if (exists) {
      if (forceRedownload) {
        // Delete old file to force re-download
        await file.delete();
      } else {
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
    if (await checkPathExists(file.uri)) {
      // On Android, we need to save to public storage for the user to see it
      if (Platform.OS === 'android') {
        try {
          const permissions = await FileSystemLegacy.StorageAccessFramework.requestDirectoryPermissionsAsync();
          
          if (permissions.granted) {
            // Read the file we just created internally
            const base64 = await FileSystemLegacy.readAsStringAsync(file.uri, { 
              encoding: FileSystemLegacy.EncodingType.Base64 
            });
            
            const mimeType = getMimeType(payslip.file.type);
            const extension = getFileExtension(payslip.file.type);
            const fileName = `payslip-${payslip.id}.${extension}`;
            
            // Create file in the user-selected directory
            const newUri = await FileSystemLegacy.StorageAccessFramework.createFileAsync(
              permissions.directoryUri, 
              fileName, 
              mimeType
            );
            
            // Write data to the new file
            await FileSystemLegacy.writeAsStringAsync(newUri, base64, { 
              encoding: FileSystemLegacy.EncodingType.Base64 
            });
            
            return {
              success: true,
              message: 'Payslip saved to device',
              filePath: newUri,
            };
          }
        } catch (error) {
          console.warn('Android SAF error:', error);
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
 * Preview a payslip file using the native viewer
 */
export async function previewPayslip(payslip: Payslip, forceRedownload = false): Promise<FileOperationResult> {
  try {
    // First, ensure the file is downloaded
    const downloadResult = await downloadPayslip(payslip, forceRedownload);
    
    if (!downloadResult.success || !downloadResult.filePath) {
      return {
        success: false,
        message: downloadResult.message || 'Could not prepare file for preview',
      };
    }
    
    const filePath = downloadResult.filePath;
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
      // On Android, use IntentLauncher to open with appropriate app
      try {
        // For Android, we need to use a content:// URI
        // The expo-file-system new API doesn't expose getContentUriAsync
        // So we use sharing as the fallback
        if (isSharingAvailable) {
          await Sharing.shareAsync(filePath, { mimeType });
          return {
            success: true,
            message: 'File opened successfully',
            filePath,
          };
        }
        
        // Try intent launcher with file URI
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: filePath,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: mimeType,
        });
        return {
          success: true,
          message: 'File opened successfully',
          filePath,
        };
      } catch {
        // Fallback to sharing if intent fails
        if (isSharingAvailable) {
          await Sharing.shareAsync(filePath, { mimeType });
          return {
            success: true,
            message: 'File opened via share',
            filePath,
          };
        }
      }
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
 * Delete a downloaded payslip file
 */
export async function deleteDownloadedPayslip(payslip: Payslip): Promise<FileOperationResult> {
  try {
    const file = getPayslipFile(payslip);
    
    const exists = await checkPathExists(file.uri);
    
    if (!exists) {
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

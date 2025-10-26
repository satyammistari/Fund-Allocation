import axios from 'axios';
import toast from 'react-hot-toast';

<<<<<<< HEAD
// Environment variables - Use process.env for Create React App
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY || '';
=======
// Environment variables with fallbacks
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '';
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
>>>>>>> 285a861e64433230c2995fc3476a647205a444b0

// Check if Pinata is configured
const isPinataConfigured = PINATA_API_KEY && PINATA_SECRET_KEY;

<<<<<<< HEAD
// Log configuration status in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Pinata Configuration:', {
    hasApiKey: !!PINATA_API_KEY,
    hasSecretKey: !!PINATA_SECRET_KEY,
    isConfigured: isPinataConfigured,
    apiKeyLength: PINATA_API_KEY.length,
    secretKeyLength: PINATA_SECRET_KEY.length
  });
}

=======
>>>>>>> 285a861e64433230c2995fc3476a647205a444b0
const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

export interface UploadProgress {
  percentage: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
}

export interface IPFSUploadResult {
  ipfsHash: string;
  pinSize: number;
  timestamp: string;
  url: string;
}

/**
 * Upload file to IPFS via Pinata
 */
export const uploadToIPFS = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<IPFSUploadResult> => {
<<<<<<< HEAD
  // Check if Pinata is configured
  if (!isPinataConfigured) {
    console.error('❌ Pinata not configured! Please add API keys to .env file');
    console.log('📝 Required environment variables:');
    console.log('   REACT_APP_PINATA_API_KEY=your_api_key');
    console.log('   REACT_APP_PINATA_SECRET_KEY=your_secret_key');
    
    // In development, return a mock response
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Using mock IPFS upload for development');
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockHash = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const result = {
            ipfsHash: mockHash,
            pinSize: file.size,
            timestamp: new Date().toISOString(),
            url: `https://mock-ipfs.io/ipfs/${mockHash}`,
          };
          console.log('🔄 Mock IPFS Upload:', result);
          onProgress?.({ percentage: 100, status: 'complete' });
          resolve(result);
        }, 1000);
      });
    }
    
    throw new Error('Pinata not configured. Please add API credentials to .env file');
=======
  // In development without Pinata, return a mock response
  if (process.env.NODE_ENV === 'development' && !isPinataConfigured) {
    console.warn('⚠️ Pinata credentials not found. Using mock IPFS upload.');
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockHash = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const result = {
          ipfsHash: mockHash,
          pinSize: file.size,
          timestamp: new Date().toISOString(),
          url: `https://mock-ipfs.io/ipfs/${mockHash}`,
        };
        console.log('Mock IPFS Upload:', result);
        onProgress?.({ percentage: 100, status: 'complete' });
        resolve(result);
      }, 1000);
    });
>>>>>>> 285a861e64433230c2995fc3476a647205a444b0
  }
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    onProgress?.({ percentage: 10, status: 'uploading' });

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        fileSize: file.size.toString(),
      },
    });
    formData.append('pinataMetadata', metadata);

    // Add options
    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', options);

    onProgress?.({ percentage: 30, status: 'uploading' });

    // Upload to Pinata
    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round(
              (progressEvent.loaded * 70) / progressEvent.total + 30
            );
            onProgress?.({ percentage, status: 'uploading' });
          }
        },
      }
    );

    onProgress?.({ percentage: 100, status: 'complete' });

    const result: IPFSUploadResult = {
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp,
      url: `${PINATA_GATEWAY}${response.data.IpfsHash}`,
    };

    console.log('✅ File uploaded to IPFS:', result);
    return result;
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);
    onProgress?.({ percentage: 0, status: 'error' });
    
    if (error.response) {
      throw new Error(`Upload failed: ${error.response.data.error || error.message}`);
    }
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Upload multiple files to IPFS
 */
export const uploadMultipleToIPFS = async (
  files: File[],
  onProgress?: (index: number, progress: UploadProgress) => void
): Promise<IPFSUploadResult[]> => {
  const results: IPFSUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadToIPFS(files[i], (progress) => {
        onProgress?.(i, progress);
      });
      results.push(result);
    } catch (error: any) {
      console.error(`Error uploading file ${i}:`, error);
      toast.error(`Failed to upload ${files[i].name}`);
      throw error;
    }
  }

  return results;
};

/**
 * Upload JSON data to IPFS
 */
export const uploadJSONToIPFS = async (
  data: any,
  filename: string = 'data.json'
): Promise<IPFSUploadResult> => {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const file = new File([blob], filename, { type: 'application/json' });

    return await uploadToIPFS(file);
  } catch (error: any) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error(`JSON upload failed: ${error.message}`);
  }
};

/**
 * Get file from IPFS
 */
export const getFromIPFS = async (ipfsHash: string): Promise<Blob> => {
  try {
    const response = await axios.get(`${PINATA_GATEWAY}${ipfsHash}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching from IPFS:', error);
    throw new Error(`Failed to fetch from IPFS: ${error.message}`);
  }
};

/**
 * Get JSON data from IPFS
 */
export const getJSONFromIPFS = async (ipfsHash: string): Promise<any> => {
  try {
    const response = await axios.get(`${PINATA_GATEWAY}${ipfsHash}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching JSON from IPFS:', error);
    throw new Error(`Failed to fetch JSON from IPFS: ${error.message}`);
  }
};

/**
 * Get IPFS URL for a hash
 */
export const getIPFSUrl = (ipfsHash: string): string => {
  return `${PINATA_GATEWAY}${ipfsHash}`;
};

/**
 * Validate file type
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.some(
    (type) =>
      file.type.includes(type) ||
      (fileExtension && type.includes(fileExtension))
  );
};

/**
 * Compress image before upload
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

/**
 * Extract GPS coordinates from image EXIF data
 */
export const extractGPSFromImage = async (
  file: File
): Promise<{ latitude: string; longitude: string } | null> => {
  // This is a placeholder - in production, use a library like exif-js
  // For now, return null
  console.log('GPS extraction not implemented yet for:', file.name);
  return null;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if Pinata is configured
 */
<<<<<<< HEAD
export const checkPinataConfigured = (): boolean => {
=======
export const isPinataConfigured = (): boolean => {
>>>>>>> 285a861e64433230c2995fc3476a647205a444b0
  return !!(PINATA_API_KEY && PINATA_SECRET_KEY);
};

export const getIPFSConfigStatus = () => ({
<<<<<<< HEAD
  isConfigured: checkPinataConfigured(),
=======
  isConfigured: isPinataConfigured(),
>>>>>>> 285a861e64433230c2995fc3476a647205a444b0
  hasApiKey: !!PINATA_API_KEY,
  hasSecretKey: !!PINATA_SECRET_KEY,
  isDevelopment: process.env.NODE_ENV === 'development',
});

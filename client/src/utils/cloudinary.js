import api from './api';

/**
 * Uploads a file directly to Cloudinary bypassing the local server.
 * Requires the backend to provide a signature.
 * 
 * @param {File} file - The file to upload
 * @param {string} folder - Destination folder in Cloudinary (e.g., 'profile/avatars')
 * @returns {Promise<string>} - The secure URL of the uploaded asset
 */
export const uploadToCloudinaryDirect = async (file, folder) => {
    // Step 1: Get signature from backend
    const { data: sigData } = await api.get(`/api/upload/signature?folder=${folder}`);
    
    // Step 2: Push directly to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sigData.apiKey);
    formData.append('timestamp', sigData.timestamp);
    formData.append('signature', sigData.signature);
    formData.append('folder', folder);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`Cloudinary error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.secure_url;
};

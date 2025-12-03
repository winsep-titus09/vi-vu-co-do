// client/src/features/upload/api.js
import apiClient from "../../lib/api-client";

export const uploadApi = {
  /**
   * Upload single image
   * @param {File} file - The image file to upload
   * @param {string} folder - Cloudinary folder (default: "uploads")
   * @returns {Promise<{url: string, public_id: string}>}
   */
  uploadImage: async (file, folder = "uploads") => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post(
      `/upload/image?folder=${folder}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },

  /**
   * Upload multiple images
   * @param {File[]} files - Array of image files to upload
   * @param {string} folder - Cloudinary folder (default: "uploads")
   * @returns {Promise<{images: Array<{url: string, public_id: string}>, count: number}>}
   */
  uploadImages: async (files, folder = "uploads") => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await apiClient.post(
      `/upload/images?folder=${folder}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
};

/**
 * Utility functions for handling profile pictures
 */
import API_BASE_URL from '../config/api';

/**
 * Get the full URL for a profile picture
 * @param {string} profilePic - The profile picture path or URL
 * @returns {string|null} - The full URL or null if no profile picture
 */
export const getProfilePicUrl = (profilePic) => {
  if (!profilePic) return null;
  
  // If it's already a full URL, return as is
  if (profilePic.startsWith('http')) {
    return profilePic;
  }
  
  // If it's a relative path, construct the full URL
  if (profilePic.startsWith('/')) {
    return `${API_BASE_URL}${profilePic}`;
  }
  
  // If it's just a filename, construct the full URL
  return `${API_BASE_URL}/api/auth/profile-pic/${profilePic}`;
};

/**
 * Get the user's initials for display when no profile picture is available
 * @param {string} name - The user's name
 * @returns {string} - The user's initials
 */
export const getUserInitials = (name) => {
  if (!name) return "U";
  return name.charAt(0).toUpperCase();
};

/**
 * Check if a profile picture URL is valid
 * @param {string} profilePic - The profile picture URL
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidProfilePic = (profilePic) => {
  return profilePic && profilePic.trim() !== "";
}; 
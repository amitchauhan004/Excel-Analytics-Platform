import React, { useState, useEffect } from "react";
import axios from "axios";
import { getProfilePicUrl, getUserInitials } from "../utils/profileUtils";

const UserSettings = () => {
    const [name, setName] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const [currentProfilePic, setCurrentProfilePic] = useState(null);
    const [password, setPassword] = useState("");
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setName(userData.name);
                setCurrentProfilePic(userData.profilePic);
            } catch (err) {
                console.error("Error parsing user data:", err);
                // Clear invalid data
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        }
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append("name", name);
        if (password) formData.append("password", password);
        if (profilePic) formData.append("profilePic", profilePic);

        try {
            const res = await axios.put("http://localhost:5000/api/auth/update", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            // Update localStorage with new user data
            const updatedUser = res.data.user;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            // Dispatch storage event to notify other components
            window.dispatchEvent(new Event('storage'));
            
            // Update the user state
            setUser(updatedUser);
            setCurrentProfilePic(updatedUser.profilePic);
            
            // Clear password field and new profile pic
            setPassword("");
            setProfilePic(null);
            
            // Show success message
            alert("Profile updated successfully!");
            
        } catch (err) {
            console.error("Error updating user:", err.response || err);
            const errorMessage = err.response?.data?.msg || "Failed to update user details";
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveProfilePic = async () => {
        if (!window.confirm("Are you sure you want to remove your profile picture?")) {
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.put("http://localhost:5000/api/auth/update", {
                name: name,
                removeProfilePic: true
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            // Update localStorage with new user data
            const updatedUser = res.data.user;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            // Dispatch storage event to notify other components
            window.dispatchEvent(new Event('storage'));
            
            // Update the user state
            setUser(updatedUser);
            setCurrentProfilePic(null);
            setProfilePic(null);
            
            alert("Profile picture removed successfully!");
            
        } catch (err) {
            console.error("Error removing profile picture:", err.response || err);
            const errorMessage = err.response?.data?.msg || "Failed to remove profile picture";
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDeleteAccount = async () => {
        if (!deletePassword) {
            alert("Please enter your password to confirm account deletion.");
            return;
        }

        setIsDeleting(true);
        try {
            const res = await axios.delete("http://localhost:5000/api/auth/delete-account", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                data: {
                    password: deletePassword
                }
            });

            alert("Account deleted successfully!");
            
            // Clear localStorage and redirect to login
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // Redirect to login page
            window.location.href = "/login";
            
        } catch (err) {
            console.error("Error deleting account:", err.response || err);
            const errorMessage = err.response?.data?.msg || "Failed to delete account. Please check your password.";
            alert(errorMessage);
            setDeletePassword("");
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDeleteAccount = () => {
        setShowDeleteConfirm(false);
        setDeletePassword("");
    };

    const getLocalProfilePicUrl = () => {
        if (profilePic) {
            return URL.createObjectURL(profilePic);
        } else if (currentProfilePic) {
            return getProfilePicUrl(currentProfilePic);
        }
        return null;
    };

    return (
        <div className="flex justify-center items-center min-h-screen text-gray-900 p-4 relative" style={{
            backgroundImage: 'url(/bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}>
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/10"></div>
            
            <form
                onSubmit={handleUpdate}
                className="p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md lg:w-96 bg-white text-gray-900 relative z-10"
            >
                <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
                    User Account Settings
                </h2>
                <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {getLocalProfilePicUrl() ? (
                                <img
                                    src={getLocalProfilePicUrl()}
                                    alt="Profile Preview"
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span className="text-gray-500 text-xs sm:text-sm">
                                    No Image
                                </span>
                            )}
                        </div>
                        {/* Camera Icon */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors duration-200 shadow-lg">
                            <label htmlFor="profile-pic-input" className="cursor-pointer">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                            </label>
                            <input
                                id="profile-pic-input"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProfilePic(e.target.files[0])}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Profile Picture Actions */}
                {currentProfilePic && (
                    <div className="text-center mb-4 sm:mb-6">
                        <button
                            type="button"
                            onClick={handleRemoveProfilePic}
                            disabled={isLoading}
                            className={`px-3 py-1 rounded-lg font-medium transition duration-300 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm ${
                                isLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            {isLoading ? "Removing..." : "Remove Photo"}
                        </button>
                    </div>
                )}
                
                <div className="mb-4 sm:mb-6">
                    <label className="block font-medium mb-2 text-gray-700 text-sm sm:text-base">
                        Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 border-gray-300 focus:ring-purple-500 text-sm sm:text-base"
                        required
                    />
                </div>
                <div className="mb-4 sm:mb-6">
                    <label className="block font-medium mb-2 text-gray-700 text-sm sm:text-base">
                        New Password (leave blank to keep current)
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 border-gray-300 focus:ring-purple-500 text-sm sm:text-base"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full p-2 sm:p-3 rounded-lg font-bold transition duration-300 bg-purple-500 hover:bg-purple-600 text-white text-sm sm:text-base ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </button>

                {/* Delete Account Section */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-300">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-center text-red-600">
                        Danger Zone
                    </h3>
                    <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className={`w-full p-2 sm:p-3 rounded-lg font-bold transition duration-300 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        🗑️ Delete Account
                    </button>
                </div>
            </form>

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-4 bg-white text-gray-900">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-red-600">
                            ⚠️ Delete Account
                        </h3>
                        <p className="mb-3 sm:mb-4 text-gray-700 text-sm sm:text-base">
                            This action cannot be undone. All your data, files, and account information will be permanently deleted.
                        </p>
                        <div className="mb-3 sm:mb-4">
                            <label className="block font-medium mb-2 text-gray-700 text-sm sm:text-base">
                                Enter your password to confirm:
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 border-gray-300 focus:ring-red-500 text-sm sm:text-base"
                                placeholder="Enter your password"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={confirmDeleteAccount}
                                disabled={isDeleting}
                                className={`flex-1 p-2 sm:p-3 rounded-lg font-bold transition duration-300 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base ${
                                    isDeleting ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {isDeleting ? "Deleting..." : "Delete Account"}
                            </button>
                            <button
                                type="button"
                                onClick={cancelDeleteAccount}
                                disabled={isDeleting}
                                className={`flex-1 p-2 sm:p-3 rounded-lg font-bold transition duration-300 bg-gray-300 hover:bg-gray-400 text-gray-900 text-sm sm:text-base ${
                                    isDeleting ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserSettings;
import React, { useState, useEffect } from "react";
import API_BASE_URL from "../apiConfig";
import axios from "axios";
import { getProfilePicUrl, getUserInitials } from "../utils/profileUtils";
import { useToast, ConfirmDialog } from "../components/Toast";

const UserSettings = () => {
  const { success, error, info } = useToast();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // profile, preferences, security, danger

  // Profile Form States
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [currentProfilePic, setCurrentProfilePic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // Preference States (Persisted in localStorage)
  const [defaultChartType, setDefaultChartType] = useState("bar");
  const [autoAiAnalysis, setAutoAiAnalysis] = useState(true);
  const [maxRowsLimit, setMaxRowsLimit] = useState(500);

  // Danger Zone States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'danger' });

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
      }
    }

    // Load saved preferences
    const savedPrefs = localStorage.getItem("xcelflow_user_prefs");
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.defaultChartType) setDefaultChartType(prefs.defaultChartType);
        if (prefs.autoAiAnalysis !== undefined) setAutoAiAnalysis(prefs.autoAiAnalysis);
        if (prefs.maxRowsLimit) setMaxRowsLimit(prefs.maxRowsLimit);
      } catch (e) {
        console.error("Error loading preferences:", e);
      }
    }
  }, []);

  // Save Preferences to LocalStorage
  const handleSavePreferences = (e) => {
    e.preventDefault();
    const prefs = {
      defaultChartType,
      autoAiAnalysis,
      maxRowsLimit
    };
    localStorage.setItem("xcelflow_user_prefs", JSON.stringify(prefs));
    success("Analytics preferences saved successfully!");
  };

  // Profile Update Handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    if (profilePic) formData.append("profilePic", profilePic);

    try {
      const res = await axios.put(`${API_BASE_URL}auth/update`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));

      setUser(updatedUser);
      setCurrentProfilePic(updatedUser.profilePic);
      setProfilePic(null);

      success("Profile details updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err.response || err);
      const errorMessage = err.response?.data?.msg || "Failed to update profile";
      error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove Photo Handler
  const handleRemoveProfilePic = () => {
    setConfirmDialog({
      show: true,
      title: "Remove Profile Picture",
      message: "Are you sure you want to remove your profile picture?",
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog({ show: false, title: '', message: '', onConfirm: null, type: 'danger' });
        await removeProfilePic();
      }
    });
  };

  const removeProfilePic = async () => {
    setIsLoading(true);
    try {
      const res = await axios.put(`${API_BASE_URL}auth/update`, {
        name,
        removeProfilePic: true
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));

      setUser(updatedUser);
      setCurrentProfilePic(null);
      setProfilePic(null);

      success("Profile picture removed!");
    } catch (err) {
      console.error("Error removing picture:", err);
      error("Failed to remove profile picture.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password Update Handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error("New password and confirm password do not match!");
      return;
    }
    if (newPassword.length < 6) {
      error("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`${API_BASE_URL}auth/update`, {
        name,
        password: newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");

      success("Password updated successfully!");
    } catch (err) {
      console.error("Error updating password:", err);
      error("Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Export Account Data Handler
  const handleExportData = () => {
    const exportData = {
      user: user,
      preferences: {
        defaultChartType,
        autoAiAnalysis,
        maxRowsLimit
      },
      exportedAt: new Date().toISOString(),
      platform: "XcelFlow"
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `xcelflow_backup_${user?.email || 'user'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    info("Account data backup downloaded.");
  };

  // Delete Account Handler
  const confirmDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      error("Please enter your password to confirm deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}auth/delete-account`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        data: {
          password: deletePassword
        }
      });

      success("Account deleted successfully.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error deleting account:", err);
      error("Failed to delete account. Please verify your password.");
      setDeletePassword("");
    } finally {
      setIsDeleting(false);
    }
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
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      {confirmDialog.show && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ show: false, title: '', message: '', onConfirm: null, type: 'danger' })}
        />
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">User Settings & Preferences</h1>
        <p className="text-slate-500 text-sm sm:text-base mt-1">Manage your account profile, security credentials, and AI analytics preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm h-fit">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "profile"
                  ? "bg-sky-50 text-sky-700 border-l-4 border-sky-500 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile Info</span>
            </button>

            <button
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "preferences"
                  ? "bg-sky-50 text-sky-700 border-l-4 border-sky-500 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              <span>AI & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "security"
                  ? "bg-sky-50 text-sky-700 border-l-4 border-sky-500 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Security</span>
            </button>

            <button
              onClick={() => setActiveTab("danger")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "danger"
                  ? "bg-rose-50 text-rose-700 border-l-4 border-rose-500 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Data & Danger</span>
            </button>
          </nav>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          {/* TAB 1: Profile Settings */}
          {activeTab === "profile" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Profile Details</h2>
              <p className="text-slate-500 text-sm mb-6">Update your avatar, display name, and view account roles.</p>

              <form onSubmit={handleUpdateProfile}>
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center overflow-hidden">
                      {getLocalProfilePicUrl() ? (
                        <img src={getLocalProfilePicUrl()} alt="Profile Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sky-700 font-bold text-2xl">{user ? getUserInitials(user.name) : "U"}</span>
                      )}
                    </div>
                    <label htmlFor="profile-pic-input" className="absolute bottom-0 right-0 w-7 h-7 bg-sky-600 hover:bg-sky-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </label>
                    <input id="profile-pic-input" type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} className="hidden" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{user?.name || "User"}</h3>
                    <p className="text-xs text-slate-500 mb-2">{user?.email}</p>
                    <div className="flex items-center gap-2">
                      <span className="badge-pill-info">{user?.role === 'admin' ? '🛡️ System Admin' : '👤 Standard Member'}</span>
                      {currentProfilePic && (
                        <button type="button" onClick={handleRemoveProfilePic} className="text-xs text-rose-600 hover:underline font-semibold">Remove Photo</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-premium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="input-premium bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-1">Email address cannot be changed directly.</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={isLoading} className="btn-primary">
                    {isLoading ? "Saving Profile..." : "Save Profile Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: AI & Analytics Preferences */}
          {activeTab === "preferences" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-1">AI & Analytics Preferences</h2>
              <p className="text-slate-500 text-sm mb-6">Customize default charts, AI auto-analysis triggers, and dataset limit parameters.</p>

              <form onSubmit={handleSavePreferences} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Default Visualization Type</label>
                  <select
                    value={defaultChartType}
                    onChange={(e) => setDefaultChartType(e.target.value)}
                    className="input-premium"
                  >
                    <option value="bar">📊 Bar Chart (Best for Categories)</option>
                    <option value="line">📈 Line Chart (Best for Trends over Time)</option>
                    <option value="pie">🍕 Pie Chart (Best for Distribution)</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Automated AI Analysis on Upload</div>
                    <div className="text-xs text-slate-500">Automatically run OpenRouter AI insight detection when a new file is uploaded.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoAiAnalysis}
                    onChange={(e) => setAutoAiAnalysis(e.target.checked)}
                    className="w-5 h-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">AI Analysis Row Sampling Limit</label>
                  <select
                    value={maxRowsLimit}
                    onChange={(e) => setMaxRowsLimit(Number(e.target.value))}
                    className="input-premium"
                  >
                    <option value={100}>100 Rows (Fastest performance)</option>
                    <option value={500}>500 Rows (Recommended balanced accuracy)</option>
                    <option value={1000}>1,000 Rows (Deep insight analysis)</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="btn-primary">
                    Save Analytics Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Security & Password */}
          {activeTab === "security" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Security & Authentication</h2>
              <p className="text-slate-500 text-sm mb-6">Update your account password and review active token session security.</p>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-premium"
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-premium"
                    placeholder="Repeat new password"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-pass"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <label htmlFor="show-pass" className="text-xs text-slate-600 cursor-pointer font-medium">Show password characters</label>
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isLoading} className="btn-primary">
                    {isLoading ? "Updating Password..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: Data & Danger Zone */}
          {activeTab === "danger" && (
            <div className="space-y-6">
              {/* Data Export Box */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Export Account Data</h2>
                <p className="text-slate-500 text-sm mb-4">Download a complete JSON archive of your account profile metadata and saved preferences.</p>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export Data Backup (JSON)</span>
                </button>
              </div>

              {/* Danger Zone Box */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-rose-900 mb-1">Danger Zone</h2>
                <p className="text-rose-700 text-sm mb-6">Permanently delete your user account and all uploaded Excel datasets, data rows, and analytics history.</p>

                {!showDeleteModal ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all text-sm"
                  >
                    Delete Account Permanently
                  </button>
                ) : (
                  <form onSubmit={confirmDeleteAccount} className="p-4 bg-white border border-rose-200 rounded-xl space-y-4">
                    <div className="text-sm font-bold text-rose-800">Confirm Deletion with Password</div>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="input-premium border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                      required
                    />
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isDeleting}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all"
                      >
                        {isDeleting ? "Deleting Account..." : "Confirm & Delete Everything"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold py-2.5 px-5 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
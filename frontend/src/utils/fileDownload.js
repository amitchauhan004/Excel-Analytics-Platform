import axios from "axios";
import API_BASE_URL from "../apiConfig";

/**
 * Downloads a file securely with token authentication
 * @param {Object} file - The file object containing downloadUrl, storedName, or originalName
 */
export const downloadFile = async (file) => {
  if (!file) return;

  const token = localStorage.getItem("token");
  let url = "";

  if (file.storedName) {
    url = `${API_BASE_URL}files/download/${file.storedName}`;
  } else if (file.downloadUrl) {
    url = file.downloadUrl.startsWith("http")
      ? file.downloadUrl
      : `${API_BASE_URL.replace('/api/', '')}${file.downloadUrl}`;
  } else {
    alert("Download URL not available for this file.");
    return;
  }

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", file.originalName || file.filename || "download.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.warn("Direct blob download failed, falling back to query token method:", err);
    const separator = url.includes("?") ? "&" : "?";
    window.open(`${url}${separator}token=${token}`, "_blank");
  }
};

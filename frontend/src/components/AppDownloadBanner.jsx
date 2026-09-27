import React, { useState, useEffect, useRef } from "react";

const AppDownloadBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [platform, setPlatform] = useState("other");
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  
  const progressIntervalRef = useRef(null);

  const AUTO_DISMISS_DURATION = 8000; // 8 seconds auto-dismiss

  useEffect(() => {
    // 1. Check if app is already running in PWA standalone mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 2. Detect User Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // 3. Capture PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Handle Auto-Dismiss Countdown
  useEffect(() => {
    if (!isVisible || isHovered || isStandalone) return;

    const startTime = Date.now();
    const endTime = startTime + AUTO_DISMISS_DURATION;

    progressIntervalRef.current = setInterval(() => {
      const remaining = endTime - Date.now();
      const pct = Math.max(0, (remaining / AUTO_DISMISS_DURATION) * 100);
      setProgress(pct);

      if (remaining <= 0) {
        clearInterval(progressIntervalRef.current);
        setIsVisible(false);
      }
    }, 50);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isVisible, isHovered, isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native browser install prompt
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show platform-specific install guide modal
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleReopen = () => {
    setProgress(100);
    setIsVisible(true);
  };

  // If running inside PWA standalone mode, don't show anything
  if (isStandalone) return null;

  return (
    <>
      {/* Top Floating Push-Style Notification Alert */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[99999] w-[92vw] sm:w-[460px] transition-all duration-500 ease-out transform ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "-translate-y-16 opacity-0 scale-95 pointer-events-none"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-slate-900/95 backdrop-blur-xl border border-sky-500/40 shadow-2xl rounded-2xl p-4 text-white relative overflow-hidden ring-1 ring-sky-400/20">
          {/* Top subtle glow bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"></div>

          <div className="flex items-start justify-between gap-3">
            {/* App Icon + Text */}
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-sky-400/30 p-1.5 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-2 ring-sky-500/20">
                  <img src="/logo.png" alt="XcelFlow App" className="w-full h-full object-contain" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500"></span>
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    App Available
                  </span>
                  <span className="text-[10px] text-slate-400">Notification</span>
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight mt-0.5 truncate">
                  Download XcelFlow App
                </h4>
                <p className="text-xs text-sky-200/80 line-clamp-1 mt-0.5">
                  Install for fast access, offline analytics & mobile app experience!
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              title="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action Row */}
          <div className="mt-3.5 flex items-center justify-between gap-3 pt-2.5 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">
              {isHovered ? "Auto-dismiss paused" : "Tap to install on device"}
            </span>

            <button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5 ring-1 ring-sky-400/40"
            >
              <svg className="w-3.5 h-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download App</span>
            </button>
          </div>

          {/* Progress bar indicator at bottom */}
          {!isHovered && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
              <div
                className="h-full bg-sky-400 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Small Restore Badge on Bottom Right when notification is hidden */}
      {!isVisible && (
        <button
          onClick={handleReopen}
          className="fixed bottom-5 right-5 z-[9990] bg-slate-900/90 hover:bg-slate-800 text-white border border-sky-500/40 px-3.5 py-2.5 rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 flex items-center gap-2 text-xs font-semibold group hover:scale-105 hover:ring-2 hover:ring-sky-400/50 animate-fadeIn"
          title="Download XcelFlow App"
        >
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 p-0.5 flex items-center justify-center border border-sky-400/40">
            <img src="/logo.png" alt="XcelFlow" className="w-full h-full object-contain" />
          </div>
          <span className="hidden sm:inline text-sky-200 group-hover:text-white">Download App</span>
          <svg className="w-4 h-4 text-sky-400 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      )}

      {/* Interactive Download/Install Instructions Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-2 shadow-lg shadow-sky-500/30 flex items-center justify-center">
                  <img src="/logo.png" alt="XcelFlow" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">How to Install XcelFlow</h3>
                  <p className="text-xs text-sky-300">Official Web App Setup</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab/Platform selection */}
            <div className="flex bg-slate-800/80 rounded-xl p-1 mb-5 border border-slate-700/60">
              <button
                onClick={() => setPlatform("ios")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  platform === "ios"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📱 iPhone / iPad
              </button>
              <button
                onClick={() => setPlatform("android")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  platform === "android"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🤖 Android
              </button>
              <button
                onClick={() => setPlatform("desktop")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  platform === "desktop"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                💻 PC / Mac
              </button>
            </div>

            {/* Step-by-Step Content */}
            <div className="space-y-4 mb-6 text-sm">
              {platform === "ios" && (
                <div className="space-y-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                    <p className="text-slate-200">Open Safari browser on your iPhone or iPad.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                    <p className="text-slate-200">
                      Tap the <strong className="text-white">Share button</strong> (
                      <span className="inline-block bg-slate-700 px-1.5 py-0.5 rounded text-sky-300 font-mono">⎋ / 📤</span>
                      ) at the bottom toolbar.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                    <p className="text-slate-200">
                      Scroll down and select <strong className="text-white">"Add to Home Screen"</strong> (➕).
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                    <p className="text-slate-200">Tap <strong className="text-white">"Add"</strong> on top right. XcelFlow App will appear on your home screen!</p>
                  </div>
                </div>
              )}

              {platform === "android" && (
                <div className="space-y-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                    <p className="text-slate-200">Open Chrome browser on your Android mobile device.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                    <p className="text-slate-200">
                      Tap the <strong className="text-white">Three Dots menu (⋮)</strong> in top right corner.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                    <p className="text-slate-200">
                      Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                    <p className="text-slate-200">Confirm by clicking <strong className="text-white">Install</strong>.</p>
                  </div>
                </div>
              )}

              {platform === "desktop" && (
                <div className="space-y-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                    <p className="text-slate-200">Look at the browser URL bar (address bar) at the top.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                    <p className="text-slate-200">
                      Click the <strong className="text-white">Install Icon (⊕ / 📥)</strong> on the right side of URL bar.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                    <p className="text-slate-200">
                      Or click the browser menu (⋮) → <strong className="text-white">"Install XcelFlow..."</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl border border-slate-700 transition-colors"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AppDownloadBanner;

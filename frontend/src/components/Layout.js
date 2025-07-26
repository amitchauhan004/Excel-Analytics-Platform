import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", icon: "🏠", label: "Dashboard" },
    { path: "/upload", icon: "📤", label: "Upload Files" },
    { path: "/analyze", icon: "📊", label: "Analyze Data" },
    { path: "/history", icon: "📜", label: "History" },
    { path: "/ai-insights", icon: "🤖", label: "AI Insights" },
    { path: "/settings", icon: "⚙️", label: "User Settings" },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Premium Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[60] w-72 bg-gradient-to-b from-primary-600 via-primary-700 to-primary-800 text-white shadow-premium-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">XcelFlow</h1>
                <p className="text-xs text-white/70">Analytics Platform</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button 
              onClick={closeSidebar}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="text-white text-xl">✕</span>
            </button>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`sidebar-item ${
                location.pathname === item.path ? "sidebar-item-active" : ""
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {location.pathname === item.path && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="mt-auto p-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-xs text-white/60">Premium Analytics</p>
            <p className="text-xs text-white/40">v2.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header with 3-dot menu */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-secondary-200 sticky top-0 z-[55]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="h-5 w-5" />
              </div>
              <span className="text-lg font-display font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">XcelFlow</span>
            </div>
            
            {/* 3-dot menu button */}
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <div className="flex flex-col gap-1">
                <div className="w-6 h-0.5 bg-secondary-600 rounded-full"></div>
                <div className="w-6 h-0.5 bg-secondary-600 rounded-full"></div>
                <div className="w-6 h-0.5 bg-secondary-600 rounded-full"></div>
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-secondary-200 py-6">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="h-5 w-5" />
                </div>
                <span className="text-lg font-display font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">XcelFlow</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-secondary-600">
                <Link to="/privacy-policy" className="hover:text-primary-600 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms-conditions" className="hover:text-primary-600 transition-colors">
                  Terms & Conditions
                </Link>
                <a href="mailto:aksainikhedla04@gmail.com" className="hover:text-primary-600 transition-colors">
                  Contact Support
                </a>
              </div>
              
              <div className="text-sm text-secondary-500">
                © 2025 XcelFlow. All Rights Reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
import React, { useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import DataView from "./pages/DataView";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import AdminPanel from "./pages/AdminPanel";
import UserSettings from "./pages/UserSettings";
import DataAnalysis from "./pages/DataAnalysis";
import History from "./pages/History";
import AIInsights from "./pages/AIInsights";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import Layout from "./components/Layout"; // Import Layout component

function App() {
  // Global error handling for chart errors
  useEffect(() => {
    const handleGlobalError = (event) => {
      if (event.error && event.error.message) {
        const errorMessage = event.error.message.toLowerCase();
        if (errorMessage.includes('legenditemtext.reduce') || 
            errorMessage.includes('legenditemtext') ||
            errorMessage.includes('chart') ||
            errorMessage.includes('google')) {
          console.warn('Global chart error caught in App:', event.error.message);
          // Prevent the error from breaking the app
          event.preventDefault();
          return false;
        }
      }
    };

    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.message) {
        const errorMessage = event.reason.message.toLowerCase();
        if (errorMessage.includes('legenditemtext.reduce') || 
            errorMessage.includes('legenditemtext') ||
            errorMessage.includes('chart') ||
            errorMessage.includes('google')) {
          console.warn('Global unhandled chart error caught in App:', event.reason.message);
          // Prevent the error from breaking the app
          event.preventDefault();
          return false;
        }
      }
    };

    // Add global error listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Cleanup function
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <BrowserRouter>
      <Switch>
        {/* Public Routes */}
        <Route exact path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-conditions" component={TermsConditions} />

        {/* Admin Panel without Sidebar */}
        <PrivateRoute path="/admin" component={AdminPanel} />

        {/* Routes with Sidebar */}
        <Layout>
          <PrivateRoute path="/dashboard" component={Dashboard} />
          <PrivateRoute path="/upload" component={Upload} />
          <PrivateRoute path="/data" component={DataView} />
          <PrivateRoute path="/settings" component={UserSettings} />
          <PrivateRoute path="/analyze" component={DataAnalysis} />
          <PrivateRoute path="/history" component={History} />
          <PrivateRoute path="/ai-insights" component={AIInsights} />
        </Layout>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
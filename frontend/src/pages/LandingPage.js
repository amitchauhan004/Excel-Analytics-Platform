import React, { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../apiConfig";

const LandingPage = () => {
  const history = useHistory();
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState({ type: null, message: "" });

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ type: null, message: "" });

    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactStatus({
        type: "error",
        message: "Please fill in all required fields (Name, Email, Message)."
      });
      return;
    }

    try {
      setContactSubmitting(true);
      const res = await axios.post(`${API_BASE_URL}contact`, contactForm);
      if (res.data.success) {
        setContactStatus({
          type: "success",
          message: res.data.message || "Thank you! Your message has been sent successfully."
        });
        setContactForm({ name: "", email: "", subject: "General Inquiry", message: "" });
      } else {
        setContactStatus({
          type: "error",
          message: res.data.message || "Failed to send message. Please try again."
        });
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      const errMsg =
        err.response?.data?.message ||
        "An unexpected error occurred while submitting your message. Please try again.";
      setContactStatus({ type: "error", message: errMsg });
    } finally {
      setContactSubmitting(false);
    }
  };

  // Intersection Observer for scroll-triggered entrance animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -50px 0px",
      threshold: 0.15
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const elements = document.querySelectorAll(".reveal-base");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const handleGetStarted = () => {
    history.push("/login");
  };

  const handleWatchDemo = () => {
    setShowDemoVideo(true);
  };

  const handleCloseDemo = () => {
    setShowDemoVideo(false);
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 75;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white overflow-x-hidden">
      {/* Video Modal */}
      {showDemoVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-medium text-slate-300 ml-2">XcelFlow Product Overview</span>
              </div>
              <button
                onClick={handleCloseDemo}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8 text-center bg-slate-950/90">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-400 mx-auto mb-4 flex items-center justify-center border border-sky-500/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">XcelFlow Platform Live Demo</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Upload your Excel file, generate automated charts, and receive instant AI decision intelligence in under 30 seconds.
              </p>
              <button
                onClick={() => {
                  handleCloseDemo();
                  handleGetStarted();
                }}
                className="btn-primary px-6 py-3"
              >
                Launch Platform & Try Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center p-1.5 shadow-lg shadow-sky-500/20">
              <img src="/logo.png" alt="XcelFlow Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
                XcelFlow
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border border-slate-700">
                AI Platform
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-white transition-colors cursor-pointer">Features</a>
            <a href="#demo" onClick={(e) => scrollToSection(e, "demo")} className="hover:text-white transition-colors cursor-pointer">Platform Capabilities</a>
            <a href="#usecases" onClick={(e) => scrollToSection(e, "usecases")} className="hover:text-white transition-colors cursor-pointer">Use Cases</a>
            <a href="#about" onClick={(e) => scrollToSection(e, "about")} className="hover:text-white transition-colors cursor-pointer">About ZAMYT</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="hover:text-white transition-colors cursor-pointer">Contact Us</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm font-semibold text-sky-400 bg-slate-900 border border-sky-500/30 hover:border-sky-400 hover:bg-sky-500/10 px-4 py-2 rounded-xl transition-all shadow-md shadow-sky-500/10 active:scale-95"
            >
              <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </Link>
            <button
              onClick={handleGetStarted}
              className="btn-primary text-sm px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-sky-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Get Started Free</span>
            </button>
          </div>

          {/* Mobile Menu Toggle & Quick Login Icon (Next to 3 bars) */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-sky-500/25 hover:brightness-110 active:scale-95 transition-all border border-sky-400/30"
              aria-label="Sign In"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Login</span>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <div className="flex flex-col gap-1.5 items-center justify-center w-5 h-5">
                  <div className="w-5 h-0.5 bg-slate-200 rounded-full"></div>
                  <div className="w-5 h-0.5 bg-slate-200 rounded-full"></div>
                  <div className="w-5 h-0.5 bg-slate-200 rounded-full"></div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 p-5 shadow-2xl space-y-4 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              <a
                href="#features"
                onClick={(e) => { scrollToSection(e, "features"); setIsMobileMenuOpen(false); }}
                className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-200 flex items-center justify-between"
              >
                <span>Features</span>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </a>
              <a
                href="#demo"
                onClick={(e) => { scrollToSection(e, "demo"); setIsMobileMenuOpen(false); }}
                className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-200 flex items-center justify-between"
              >
                <span>Platform Capabilities</span>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </a>
              <a
                href="#usecases"
                onClick={(e) => { scrollToSection(e, "usecases"); setIsMobileMenuOpen(false); }}
                className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-200 flex items-center justify-between"
              >
                <span>Use Cases</span>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </a>
              <a
                href="#about"
                onClick={(e) => { scrollToSection(e, "about"); setIsMobileMenuOpen(false); }}
                className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-200 flex items-center justify-between"
              >
                <span>About ZAMYT</span>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </a>
              <a
                href="#contact"
                onClick={(e) => { scrollToSection(e, "contact"); setIsMobileMenuOpen(false); }}
                className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-200 flex items-center justify-between"
              >
                <span>Contact Us</span>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </a>
            </nav>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl border border-sky-500/30 bg-slate-900 text-sm font-semibold text-sky-400 hover:text-white flex items-center justify-center gap-2 shadow-md"
              >
                <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In</span>
              </Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleGetStarted(); }}
                className="btn-primary w-full py-3 text-sm font-semibold rounded-xl text-center flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Get Started Free</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-24 lg:pt-36 lg:pb-32 overflow-hidden">
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Release Badge */}
          <div className="reveal-base reveal-hidden-down inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-8 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>XcelFlow 2.0 Engine Live</span>
            <span className="text-slate-600">•</span>
            <span className="text-sky-400 font-semibold">AI Decision Intelligence</span>
          </div>

          {/* Headline */}
          <h1 className="reveal-base reveal-hidden-up text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.15] max-w-5xl mx-auto mb-6">
            Turn Spreadsheet Data into{" "}
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Strategic Decision Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="reveal-base reveal-hidden-up text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            XcelFlow parses your raw Excel files, detects hidden patterns, models scenario impacts, and generates executive AI narratives without complex formulas.
          </p>

          {/* Action CTAs */}
          <div className="reveal-base reveal-hidden-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleGetStarted}
              className="btn-primary text-base px-8 py-4 rounded-xl shadow-lg shadow-sky-500/25 w-full sm:w-auto font-bold flex items-center justify-center gap-2"
            >
              <span>Launch Platform Free</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button
              onClick={handleWatchDemo}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 text-base px-7 py-4 rounded-xl w-full sm:w-auto font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Watch 1-Min Overview</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="reveal-base reveal-hidden-up pt-8 border-t border-slate-900 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Instant XLSX Parsing</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>OpenRouter AI Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Enterprise Grade Security</span>
            </div>
          </div>

          {/* Interactive Product Window Mockup */}
          <div id="demo" className="reveal-base reveal-hidden-zoom mt-16 relative max-w-5xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-left p-1">
            <div className="bg-slate-950 px-4 py-3 rounded-t-xl border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">xcelflow.app / dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Copilot Active</span>
              </div>
            </div>

            <div className="p-6 bg-slate-900 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Uploaded Dataset</div>
                <div className="text-sm font-semibold text-white truncate">Q3_Financial_Performance.xlsx</div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>14,280 Rows Processed</span>
                  <span className="text-emerald-400 font-medium">99.8% Health</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">AI Recommendation</div>
                <div className="text-sm font-medium text-sky-400">Optimize Inventory Tier 2</div>
                <div className="mt-4 text-xs text-slate-400">Projected Margin Gain: <span className="text-white font-bold">+14.6%</span></div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Forecast Projections</div>
                <div className="text-sm font-semibold text-white">Q4 Revenue Estimate</div>
                <div className="mt-4 text-xs text-slate-400">Model Confidence: <span className="text-emerald-400 font-bold">High (94%)</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section id="features" className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-base reveal-hidden-up text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-4">
              Built for Serious Data Teams
            </h2>
            <p className="text-slate-400 text-lg">
              Everything you need to transform raw spreadsheet files into action-ready executive reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Multi-Dataset Intelligence",
                desc: "Combine multiple Excel spreadsheets and automatically map relationships across datasets.",
                animClass: "reveal-hidden-left delay-100",
                icon: (
                  <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 01-2-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )
              },
              {
                title: "Autonomous AI Agent",
                desc: "AI scans your spreadsheets 24/7 to flag anomalies, revenue risks, and growth opportunities.",
                animClass: "reveal-hidden-up delay-200",
                icon: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "Decision Impact Simulator",
                desc: "Run what-if scenario models on pricing, headcounts, and expenses before taking action.",
                animClass: "reveal-hidden-right delay-300",
                icon: (
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                title: "Predictive Forecast Engine",
                desc: "Project next quarter trends using linear and exponential statistical forecasting models.",
                animClass: "reveal-hidden-left delay-100",
                icon: (
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              },
              {
                title: "Business Health Index",
                desc: "Get an aggregated health score evaluating stability, cash growth, and operational risk.",
                animClass: "reveal-hidden-up delay-200",
                icon: (
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "AI Data Story Mode",
                desc: "Convert numbers and chart graphics into concise executive summaries ready for stakeholders.",
                animClass: "reveal-hidden-right delay-300",
                icon: (
                  <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                )
              }
            ].map((f, i) => (
              <div key={i} className={`reveal-base ${f.animClass} bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg`}>
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Use Cases */}
      <section id="usecases" className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-base reveal-hidden-up text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Designed for Teams & Decision Makers
            </h2>
            <p className="text-slate-400 text-base">
              Whether you are a founder, business analyst, or finance manager, XcelFlow saves hours of spreadsheet work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="reveal-base reveal-hidden-left bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="text-sky-400 font-semibold text-sm mb-2">For Founders & Execs</div>
              <h3 className="text-xl font-bold text-white mb-3">Executive Visibility</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Skip digging through raw sheets. Get instant health scores, growth metrics, and narrative summaries.
              </p>
            </div>

            <div className="reveal-base reveal-hidden-up bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="text-indigo-400 font-semibold text-sm mb-2">For Finance & Operations</div>
              <h3 className="text-xl font-bold text-white mb-3">Scenario Modeling</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Test how cost increases or sales drops affect profitability before committing capital.
              </p>
            </div>

            <div className="reveal-base reveal-hidden-right bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="text-emerald-400 font-semibold text-sm mb-2">For Data Analysts</div>
              <h3 className="text-xl font-bold text-white mb-3">Automated Discovery</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Accelerate exploratory data analysis with automated chart building and AI anomaly flags.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About ZAMYT Section */}
      <section id="about" className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="reveal-base reveal-hidden-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4">
                <span>About ZAMYT</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-6 leading-tight">
                Redefining Decision Intelligence for Modern Businesses
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-6">
                ZAMYT is an advanced software engineering and AI research team committed to building intuitive, high-performance tools for data-driven teams worldwide.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                With XcelFlow, our mission is to eliminate the friction between raw spreadsheet files and strategic execution — empowering business leaders to ask complex questions and receive immediate, verified answers.
              </p>
              <div className="flex items-center gap-4">
                <button onClick={handleGetStarted} className="btn-primary text-sm px-6 py-3">
                  Join ZAMYT Ecosystem
                </button>
              </div>
            </div>

            {/* Right Cards */}
            <div className="reveal-base reveal-hidden-right grid grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
                <div className="text-3xl font-extrabold text-sky-400 font-display mb-1">99.9%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Parser Reliability</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
                <div className="text-3xl font-extrabold text-indigo-400 font-display mb-1">50K+</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Rows Processed/sec</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
                <div className="text-3xl font-extrabold text-emerald-400 font-display mb-1">24/7</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Autonomous AI Agent</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
                <div className="text-3xl font-extrabold text-amber-400 font-display mb-1">100%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Data Privacy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-24 bg-slate-950 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-base reveal-hidden-up text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4">
              <span>Get In Touch</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              We'd Love to Hear From You
            </h2>
            <p className="text-slate-400 text-base">
              Have questions about XcelFlow, custom enterprise integrations, or technical support? Drop us a message below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Contact Info Cards */}
            <div className="lg:col-span-5 space-y-6 reveal-base reveal-hidden-left">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Direct Support Email</h4>
                    <p className="text-slate-400 text-sm mb-2">Our team usually replies within 2 hours.</p>
                    <a href="mailto:support@zamyt.in" className="text-sky-400 font-semibold text-sm hover:underline">
                      support@zamyt.in
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M9 16h.01M9 12h.01M9 8h.01M15 16h.01M15 12h.01M15 8h.01" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">ZAMYT Headquarters</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      ZAMYT AI & Technology Labs<br />
                      Empowering Data Teams Worldwide
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Live Platform Support</h4>
                    <p className="text-slate-400 text-sm">
                      24/7 Monitoring & System Health active for all registered accounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="lg:col-span-7 reveal-base reveal-hidden-right">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>

                <h3 className="text-2xl font-bold text-white mb-2">Send us a Message</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Fill in your details and we will respond as soon as possible.
                </p>

                {/* Status Banners */}
                {contactStatus.type === "success" && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-start gap-3 animate-fade-in">
                    <svg className="w-6 h-6 shrink-0 mt-0.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-sm">{contactStatus.message}</p>
                      <button
                        onClick={() => setContactStatus({ type: null, message: "" })}
                        className="mt-2 text-xs font-bold underline hover:text-emerald-300"
                      >
                        Send another message
                      </button>
                    </div>
                  </div>
                )}

                {contactStatus.type === "error" && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-start gap-3 animate-fade-in">
                    <svg className="w-6 h-6 shrink-0 mt-0.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold text-sm">{contactStatus.message}</p>
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Your Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={contactForm.name}
                        onChange={handleContactChange}
                        placeholder="Amit Chauhan"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        placeholder="amit@example.com"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Inquiry Category
                    </label>
                    <select
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleContactChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Enterprise / Demo Request">Enterprise / Demo Request</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Technical Support">Technical Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Your Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows="4"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      placeholder="Tell us how we can help you..."
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="w-full btn-primary py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactSubmitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="reveal-base reveal-hidden-zoom py-20 bg-gradient-to-r from-sky-900/40 via-slate-900 to-indigo-900/40 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-6">
            Ready to Supercharge Your Excel Data?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join analysts and business leaders using XcelFlow to turn spreadsheet rows into smart decision intelligence.
          </p>
          <button
            onClick={handleGetStarted}
            className="btn-primary text-base px-9 py-4 rounded-xl font-bold shadow-lg shadow-sky-500/30"
          >
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center p-1.5 shadow-lg shadow-sky-500/20">
              <img src="/logo.png" alt="XcelFlow Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-slate-300">XcelFlow by ZAMYT</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 text-xs">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-white transition-colors">Terms of Service</Link>
            <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="hover:text-white transition-colors cursor-pointer">Contact Us</a>
            <a href="mailto:support@zamyt.in" className="hover:text-white transition-colors">Support</a>
          </div>

          <div className="text-xs text-slate-600">
            © 2025 XcelFlow • A ZAMYT Product. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
import React, { useEffect, useState, useRef } from "react";
import { useHistory, Link } from "react-router-dom";

const LandingPage = () => {
  const history = useHistory();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollAnimations, setScrollAnimations] = useState({});
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);
  const videoRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Trigger animation when element comes into view
          setScrollAnimations(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        } else {
          // Reset animation when element goes out of view
          setScrollAnimations(prev => ({
            ...prev,
            [entry.target.id]: false
          }));
        }
      });
    }, observerOptions);

    // Function to observe sections
    const observeSections = () => {
      const sections = document.querySelectorAll('[data-scroll-animation]');
      sections.forEach(section => {
        if (observerRef.current) {
          observerRef.current.observe(section);
        }
      });
    };

    // Initial observation
    observeSections();

    // Re-observe sections after a short delay to ensure DOM is ready
    const reobserveTimer = setTimeout(() => {
      observeSections();
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(reobserveTimer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Re-observe sections when component updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (observerRef.current) {
        const sections = document.querySelectorAll('[data-scroll-animation]');
        sections.forEach(section => {
          observerRef.current.observe(section);
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [scrollAnimations]);

  const handleGetStarted = () => {
    history.push("/login");
  };

  const handleWatchDemo = () => {
    setShowDemoVideo(true);
    setShowVideoOverlay(false);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseDemo = () => {
    setShowDemoVideo(false);
    setShowVideoOverlay(true);
    document.body.style.overflow = 'unset';
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showDemoVideo) {
        handleCloseDemo();
      }
    };

    if (showDemoVideo) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDemoVideo]);

  const handleVideoPlay = () => {
    setShowVideoOverlay(false);
  };

  const handleVideoPause = () => {
    setShowVideoOverlay(true);
  };

  const handleVideoEnded = () => {
    setShowVideoOverlay(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 overflow-hidden">
      {/* Demo Video Modal */}
      {showDemoVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-premium text-white">
              <h3 className="text-xl font-display font-bold">XcelFlow Demo</h3>
              <button
                onClick={handleCloseDemo}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 transform hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Video Container */}
            <div className="relative bg-black">
              <video
                ref={videoRef}
                className="w-full h-auto max-h-[70vh]"
                controls
                autoPlay
                poster="/demo-thumbnail.jpg"
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnded}
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                <source src="/demo-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video Overlay with Play Button */}
              {showVideoOverlay && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 cursor-pointer"
                  onClick={() => videoRef.current && videoRef.current.play()}
                >
                  <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:bg-opacity-100">
                    <svg className="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-gray-50">
              <div className="text-center">
                <h4 className="text-lg font-display font-bold mb-2">See XcelFlow in Action</h4>
                <p className="text-secondary-600 mb-4">
                  Watch how XcelFlow transforms your Excel data into powerful insights in just minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleGetStarted}
                    className="btn-primary px-6 py-2 transform transition-all duration-300 hover:scale-105"
                  >
                    Start Free Trial
                  </button>
                  <button
                    onClick={handleCloseDemo}
                    className="btn-secondary px-6 py-2 transform transition-all duration-300 hover:scale-105"
                  >
                    Close Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4" id="hero-section" data-scroll-animation>
        {/* Background Elements with animations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-premium rounded-full opacity-10 blur-3xl transition-all duration-1000 ease-out ${isVisible ? 'animate-pulse' : 'opacity-0'}`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-premium-2 rounded-full opacity-10 blur-3xl transition-all duration-1000 ease-out delay-300 ${isVisible ? 'animate-pulse' : 'opacity-0'}`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-premium-3 rounded-full opacity-5 blur-3xl transition-all duration-1000 ease-out delay-600 ${isVisible ? 'animate-pulse' : 'opacity-0'}`}></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className={`mb-8 transition-all duration-1000 ease-out ${scrollAnimations['hero-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-premium rounded-2xl shadow-premium-lg mb-6 transition-all duration-1000 ease-out delay-200 hover:scale-110 hover:rotate-3 ${scrollAnimations['hero-section'] ? 'animate-bounce' : 'scale-0'}`}>
              <img src="/logo.png" alt="Logo" className="h-12 w-12" />
            </div>
            <h1 className={`text-6xl md:text-7xl font-display font-bold mb-6 transition-all duration-1000 ease-out delay-400 ${scrollAnimations['hero-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              Welcome to{" "}
              <span className="gradient-text animate-pulse">XcelFlow</span>
            </h1>
            <p className={`text-xl md:text-2xl text-secondary-600 mb-8 leading-relaxed transition-all duration-1000 ease-out delay-600 ${scrollAnimations['hero-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              Transform your Excel data into actionable insights with our powerful{" "}
              <span className="font-semibold text-primary-600">Premium Analytics Platform</span>
            </p>
          </div>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 ease-out delay-800 ${scrollAnimations['hero-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <button 
              onClick={handleGetStarted} 
              className="btn-primary text-lg px-8 py-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Get Started Free
            </button>
            <button 
              onClick={handleWatchDemo}
              className="btn-secondary text-lg px-8 py-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch Demo
            </button>
          </div>

          {/* Stats with staggered animations */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 transition-all duration-1000 ease-out delay-1000 ${scrollAnimations['hero-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="card-premium-hover p-6 transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-pulse">
              <div className="text-3xl font-bold gradient-text mb-2">10K+</div>
              <div className="text-secondary-600">Active Users</div>
            </div>
            <div className="card-premium-hover p-6 transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-pulse delay-200">
              <div className="text-3xl font-bold gradient-text mb-2">1M+</div>
              <div className="text-secondary-600">Files Processed</div>
            </div>
            <div className="card-premium-hover p-6 transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-pulse delay-400">
              <div className="text-3xl font-bold gradient-text mb-2">99.9%</div>
              <div className="text-secondary-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white" id="features-section" data-scroll-animation>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ease-out ${scrollAnimations['features-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Why Choose <span className="gradient-text animate-pulse">XcelFlow</span>?
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Experience the next generation of data analytics with our comprehensive suite of tools designed for professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🚀", title: "Lightning Fast", description: "Process massive Excel files in seconds with our optimized algorithms and cloud infrastructure.", gradient: "bg-gradient-premium" },
              { icon: "🔒", title: "Enterprise Security", description: "Bank-level encryption and compliance with industry standards to keep your data secure.", gradient: "bg-gradient-premium-2" },
              { icon: "🤖", title: "AI-Powered Insights", description: "Advanced machine learning algorithms uncover hidden patterns and trends in your data.", gradient: "bg-gradient-premium-3" },
              { icon: "📊", title: "Advanced Analytics", description: "Comprehensive analytics tools with interactive charts and real-time data visualization.", gradient: "bg-gradient-premium-4" },
              { icon: "🌍", title: "Global Access", description: "Access your analytics from anywhere with our responsive web platform and mobile apps.", gradient: "bg-gradient-premium-5" },
              { icon: "⚡", title: "Real-time Sync", description: "Automatic synchronization across all your devices with real-time collaboration features.", gradient: "bg-gradient-to-r from-success-500 to-success-600" }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`card-premium-hover p-8 transform transition-all duration-700 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-xl ${scrollAnimations['features-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                style={{ transitionDelay: `${scrollAnimations['features-section'] ? index * 150 : 0}ms` }}
              >
                <div className={`w-16 h-16 ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 transform transition-all duration-300 hover:scale-110 hover:rotate-6`}>
                  <span className="text-2xl animate-bounce">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{feature.title}</h3>
                <p className="text-secondary-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-gradient-to-br from-secondary-50 to-primary-50" id="testimonials-section" data-scroll-animation>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ease-out ${scrollAnimations['testimonials-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Trusted by <span className="gradient-text animate-pulse">Professionals</span>
            </h2>
            <p className="text-xl text-secondary-600">
              See what industry leaders are saying about XcelFlow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { initials: "JD", name: "John Doe", role: "Data Scientist, TechCorp", quote: "XcelFlow has completely transformed our data analysis workflow. The AI insights are incredibly accurate and save us hours of manual work." },
              { initials: "JS", name: "Jane Smith", role: "Business Analyst, FinanceCo", quote: "The file upload process is seamless, and the analytics tools are incredibly powerful. It's like having a data science team at your fingertips." },
              { initials: "SL", name: "Sarah Lee", role: "Operations Manager, StartupXYZ", quote: "I love how intuitive XcelFlow is. The AI-powered insights have helped us make data-driven decisions that increased our efficiency by 40%." }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className={`card-premium-hover p-8 transform transition-all duration-700 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-xl ${scrollAnimations['testimonials-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                style={{ transitionDelay: `${scrollAnimations['testimonials-section'] ? index * 200 : 0}ms` }}
              >
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 bg-gradient-premium rounded-full flex items-center justify-center text-white font-bold mr-4 transform transition-all duration-300 hover:scale-110 hover:rotate-12 ${index === 1 ? 'bg-gradient-premium-2' : index === 2 ? 'bg-gradient-premium-3' : ''}`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="font-display font-bold">{testimonial.name}</h4>
                    <p className="text-secondary-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-secondary-700 italic leading-relaxed">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-premium text-white" id="cta-section" data-scroll-animation>
        <div className={`max-w-4xl mx-auto text-center px-4 transition-all duration-1000 ease-out ${scrollAnimations['cta-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 animate-pulse">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who trust XcelFlow for their analytics needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted} 
              className="bg-white text-primary-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-premium transform hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              Start Free Trial
            </button>
            <button 
              onClick={handleWatchDemo}
              className="border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 bg-secondary-900 text-white" id="footer-section" data-scroll-animation>
        <div className={`max-w-7xl mx-auto px-4 text-center transition-all duration-1000 ease-out ${scrollAnimations['footer-section'] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-6">
              <img src="/logo.png" alt="Logo" className="h-5 w-5" />
            </div>
            <span className="text-xl font-display font-bold">XcelFlow</span>
          </div>
          <p className="text-secondary-400 mb-6">
            © 2025 XcelFlow. All Rights Reserved.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/privacy-policy" className="text-secondary-400 hover:text-white transition-colors transform hover:scale-105">
              Privacy Policy
            </Link>
            <Link to="/terms-conditions" className="text-secondary-400 hover:text-white transition-colors transform hover:scale-105">
              Terms & Conditions
            </Link>
            <a href="mailto:aksainikhedla04@gmail.com" className="text-secondary-400 hover:text-white transition-colors transform hover:scale-105">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const TermsConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="h-5 w-5" />
                </div>
                <span className="text-xl font-display font-bold gradient-text">
                  XcelFlow
                </span>
              </Link>
            </div>

            <Link to="/" className="btn-secondary py-2 px-4 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="card-premium p-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-8 text-center">
            Terms and Conditions
          </h1>
          <p className="text-secondary-600 text-center mb-4">
            XcelFlow is a product developed and operated by{" "}
            <strong>ZAMYT</strong>.
          </p>

          <div className="prose prose-lg max-w-none">
            <p className="text-secondary-600 mb-8 text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            {/* 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  By accessing or using XcelFlow ("the Platform"), you agree to
                  comply with and be bound by these Terms and Conditions. If you
                  do not agree with any part of these Terms, you must not use
                  the Platform.
                </p>
                <p>
                  These Terms govern your use of XcelFlow and all related
                  services provided by ZAMYT.
                </p>
              </div>
            </section>

            {/* 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                2. Description of Service
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>XcelFlow is an AI-powered Excel analytics platform that provides:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Excel file upload and processing</li>
                  <li>Data visualization and charts</li>
                  <li>AI-generated insights and summaries</li>
                  <li>Dashboard and reporting features</li>
                  <li>File management and history</li>
                  <li>Automation and analytics tools</li>
                </ul>
              </div>
            </section>

            {/* 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                3. User Accounts
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  To access certain features, you may need to create an account.
                  You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain confidentiality of your account credentials</li>
                  <li>Be responsible for all activities under your account</li>
                  <li>Notify us of any unauthorized account use</li>
                </ul>
              </div>
            </section>

            {/* 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                4. Acceptable Use Policy
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload harmful, illegal, or malicious content</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Attempt to hack, disrupt, or misuse the Platform</li>
                  <li>Infringe intellectual property rights</li>
                  <li>Share or misuse user data</li>
                </ul>
              </div>
            </section>

            {/* 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                5. Data & File Handling
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  You retain ownership of your uploaded files. By using the
                  Platform, you grant XcelFlow permission to process your data
                  solely for providing analytics and insights.
                </p>
                <p>
                  We follow industry-standard security practices but cannot
                  guarantee absolute protection against data loss or breaches.
                </p>
              </div>
            </section>

            {/* 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                6. Intellectual Property
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  All software, design, branding, and content of XcelFlow are
                  owned by ZAMYT and protected by intellectual property laws.
                </p>
                <p>
                  You may not copy, modify, distribute, or reverse-engineer any
                  part of the Platform without permission.
                </p>
              </div>
            </section>

            {/* 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                7. Privacy & Data Protection
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  Your use of XcelFlow is also governed by our Privacy Policy.
                  By using the Platform, you consent to our data practices.
                </p>
              </div>
            </section>

            {/* 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                8. Service Availability
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  We strive to provide uninterrupted service but do not guarantee
                  continuous availability. Features may change or be discontinued
                  without prior notice.
                </p>
              </div>
            </section>

            {/* 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                9. Disclaimer & Limitation of Liability
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  XcelFlow is provided "as is". We do not guarantee the accuracy
                  of analytics or insights. ZAMYT shall not be liable for any
                  direct or indirect damages arising from the use of the Platform.
                </p>
              </div>
            </section>

            {/* 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                10. Governing Law
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  These Terms shall be governed by and interpreted in accordance
                  with the laws of India.
                </p>
              </div>
            </section>

            {/* 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                11. Changes to Terms
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  We reserve the right to update these Terms at any time.
                  Continued use of the Platform after changes indicates acceptance
                  of the updated Terms.
                </p>
              </div>
            </section>

            {/* 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                12. Contact Information
              </h2>
              <div className="bg-secondary-50 p-6 rounded-xl">
                <div className="space-y-2 text-secondary-700">
                  <p><strong>Product:</strong> XcelFlow by ZAMYT</p>
                  <p><strong>Company:</strong> ZAMYT</p>
                  <p><strong>Team:</strong> ZAMYT Team</p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a href="tel:+918058637318" className="text-primary-600 hover:text-primary-700">
                      +91 8058637318
                    </a>
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:support@zamyt.in" className="text-primary-600 hover:text-primary-700">
                      support@zamyt.in
                    </a>
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsConditions;

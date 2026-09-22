import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="h-5 w-5" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">
                XcelFlow
              </span>
            </Link>

            <Link to="/" className="btn-secondary py-2 px-4 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="card-premium p-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4 text-center">
            Privacy Policy
          </h1>

          <p className="text-secondary-600 text-center mb-4">
            XcelFlow is a product developed and operated by{" "}
            <strong>ZAMYT</strong>.
          </p>

          <p className="text-secondary-600 mb-6 text-center">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          {/* Trust Summary Box */}
          <div className="bg-primary-50 border border-primary-200 p-6 rounded-xl mb-8">
            <h3 className="font-bold text-lg mb-2">🔒 Your Data, Your Control</h3>
            <p className="text-secondary-700">
              We respect your privacy. Your uploaded files and data are processed
              securely and are never sold or misused.
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-secondary-700">

            {/* 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                1. Information We Collect
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and email address</li>
                <li>Uploaded files (Excel, CSV, etc.)</li>
                <li>Usage data and analytics</li>
                <li>Device and browser information</li>
                <li>Communication with support</li>
              </ul>
            </section>

            {/* 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and improve XcelFlow services</li>
                <li>To analyze uploaded files and generate insights</li>
                <li>To enhance user experience and features</li>
                <li>To ensure security and prevent misuse</li>
                <li>To communicate updates and support</li>
              </ul>
            </section>

            {/* 2.1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                2.1 Uploaded File & Data Processing
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your uploaded files are processed only for analysis.</li>
                <li>We do not sell, rent, or share your data.</li>
                <li>Demo version data may be temporarily stored for processing.</li>
                <li>Full version users may have saved dashboards and history.</li>
                <li>You can request deletion of your data anytime.</li>
              </ul>
            </section>

            {/* 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                3. Information Sharing
              </h2>
              <p>
                We do not share your personal or uploaded data with third parties,
                except when required by law or trusted service providers under
                strict confidentiality agreements.
              </p>
            </section>

            {/* 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                4. Data Security
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption in transit and at rest</li>
                <li>Secure cloud storage</li>
                <li>Access control and authentication</li>
                <li>Regular security updates</li>
              </ul>
              <p>
                However, no system is 100% secure, and we cannot guarantee absolute
                security.
              </p>
            </section>

            {/* 4.1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                4.1 AI & Third-Party Services
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>XcelFlow may use AI APIs and cloud services for analysis.</li>
                <li>Only necessary data is processed by third-party tools.</li>
                <li>Third parties are not allowed to use your data for their purposes.</li>
              </ul>
            </section>

            {/* 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                5. Data Retention
              </h2>
              <p>
                We retain data only as long as necessary to provide services or
                comply with legal obligations.
              </p>
            </section>

            {/* 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                6. Your Rights
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your data</li>
                <li>Request correction or deletion</li>
                <li>Export your data</li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            {/* 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                7. Cookies
              </h2>
              <p>
                We use cookies to improve functionality and analyze usage patterns.
                You can control cookies through browser settings.
              </p>
            </section>

            {/* 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                8. Children’s Privacy
              </h2>
              <p>
                XcelFlow is not intended for children under 13 years of age.
              </p>
            </section>

            {/* 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                9. Changes to Policy
              </h2>
              <p>
                We may update this policy periodically. Changes will be posted on
                this page.
              </p>
            </section>

            {/* 10 */}
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

export default PrivacyPolicy;

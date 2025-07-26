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
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="h-5 w-5" />
                </div>
                <span className="text-xl font-display font-bold gradient-text">XcelFlow</span>
              </Link>
            </div>
            
            <Link
              to="/"
              className="btn-secondary py-2 px-4 text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="card-premium p-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-8 text-center">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-secondary-600 mb-8 text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                1. Information We Collect
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  <strong>Personal Information:</strong> We collect information you provide directly to us, such as when you create an account, upload files, or contact us. This may include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address</li>
                  <li>Profile information and preferences</li>
                  <li>Files you upload to our platform</li>
                  <li>Communication history with our support team</li>
                </ul>
                
                <p>
                  <strong>Usage Information:</strong> We automatically collect certain information about your use of our services, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Log data (IP address, browser type, pages visited)</li>
                  <li>Device information (operating system, device type)</li>
                  <li>Analytics data (usage patterns, feature interactions)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                2. How We Use Your Information
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and analyze your uploaded files</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                  <li>Detect, prevent, and address technical issues</li>
                  <li>Ensure the security and integrity of our platform</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                3. Information Sharing and Disclosure
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
                  <li><strong>Consent:</strong> We may share information with your explicit consent</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                4. Data Security
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>We implement appropriate technical and organizational security measures to protect your personal information, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Secure data storage and backup procedures</li>
                </ul>
                <p>However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                5. Data Retention
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>We retain your personal information for as long as necessary to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Maintain business records</li>
                </ul>
                <p>You may request deletion of your account and associated data at any time by contacting us.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                6. Your Rights and Choices
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Opt-out:</strong> Opt out of certain communications and data processing</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                7. Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>We use cookies and similar tracking technologies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze how you use our platform</li>
                  <li>Provide personalized content and features</li>
                  <li>Improve our services and user experience</li>
                </ul>
                <p>You can control cookie settings through your browser preferences.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                8. Children's Privacy
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                9. International Data Transfers
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                11. Contact Information
              </h2>
              <div className="bg-secondary-50 p-6 rounded-xl">
                <p className="text-secondary-700 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-secondary-700">
                  <p><strong>Name:</strong> Amit Chauhan</p>
                  <p><strong>Phone:</strong> <a href="tel:+918058637318" className="text-primary-600 hover:text-primary-700">+91 8058637318</a></p>
                  <p><strong>Email:</strong> <a href="mailto:aksainikhedla04@gmail.com" className="text-primary-600 hover:text-primary-700">aksainikhedla04@gmail.com</a></p>
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
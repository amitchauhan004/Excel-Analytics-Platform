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
            Terms and Conditions
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-secondary-600 mb-8 text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  By accessing and using XcelFlow ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These Terms and Conditions ("Terms") govern your use of the XcelFlow platform and services. By using our platform, you agree to these Terms in full.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                2. Description of Service
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  XcelFlow is an Excel analytics platform that provides the following services:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Excel file upload and storage</li>
                  <li>Data analysis and visualization</li>
                  <li>Chart generation and export</li>
                  <li>AI-powered insights and recommendations</li>
                  <li>File management and organization</li>
                  <li>User account management</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                3. User Accounts and Registration
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  <strong>Account Creation:</strong> To use certain features of the Platform, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
                <p>
                  <strong>Account Termination:</strong> We reserve the right to terminate or suspend accounts that violate these Terms or for any other reason at our sole discretion.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                4. Acceptable Use Policy
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>You agree not to use the Platform to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload malicious files or content</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Harass, abuse, or harm others</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the Platform</li>
                  <li>Use automated tools to access the service</li>
                  <li>Share account credentials with others</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                5. File Upload and Content
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  <strong>File Types:</strong> You may upload Excel files (.xlsx, .xls) and other supported formats as specified on the Platform.
                </p>
                <p>
                  <strong>Content Ownership:</strong> You retain ownership of the content you upload. By uploading files, you grant us a limited license to process and analyze the data for providing our services.
                </p>
                <p>
                  <strong>Data Processing:</strong> We process your data in accordance with our Privacy Policy and applicable data protection laws.
                </p>
                <p>
                  <strong>File Storage:</strong> We provide secure storage for your uploaded files, but we are not responsible for data loss due to technical issues or account termination.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                6. Intellectual Property Rights
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  <strong>Platform Rights:</strong> The Platform, including its software, design, and content, is owned by us and protected by intellectual property laws.
                </p>
                <p>
                  <strong>User Content:</strong> You retain all rights to your uploaded content. You grant us a non-exclusive, worldwide license to use your content for providing our services.
                </p>
                <p>
                  <strong>Analytics and Insights:</strong> Generated analytics, charts, and insights are provided for your use but may not be redistributed without permission.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                7. Privacy and Data Protection
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                </p>
                <p>
                  By using the Platform, you consent to the collection and use of your information as described in our Privacy Policy.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                8. Service Availability and Modifications
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  <strong>Service Availability:</strong> We strive to maintain high availability but do not guarantee uninterrupted access to the Platform. We may temporarily suspend services for maintenance or updates.
                </p>
                <p>
                  <strong>Service Modifications:</strong> We reserve the right to modify, suspend, or discontinue any part of the Platform at any time with or without notice.
                </p>
                <p>
                  <strong>Updates:</strong> We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                9. Disclaimers and Limitations
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  <strong>Service "As Is":</strong> The Platform is provided "as is" without warranties of any kind, either express or implied.
                </p>
                <p>
                  <strong>No Guarantees:</strong> We do not guarantee the accuracy, completeness, or usefulness of any analysis, insights, or recommendations provided by the Platform.
                </p>
                <p>
                  <strong>Limitation of Liability:</strong> To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
                </p>
                <p>
                  <strong>Data Loss:</strong> We are not responsible for any data loss, corruption, or unauthorized access to your files or account.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                10. Indemnification
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  You agree to indemnify and hold harmless XcelFlow and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your use of the Platform</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Your content or uploaded files</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                11. Governing Law and Disputes
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  <strong>Governing Law:</strong> These Terms are governed by and construed in accordance with the laws of India.
                </p>
                <p>
                  <strong>Dispute Resolution:</strong> Any disputes arising from these Terms or your use of the Platform shall be resolved through negotiation, mediation, or legal proceedings as appropriate.
                </p>
                <p>
                  <strong>Jurisdiction:</strong> You agree to submit to the jurisdiction of the courts in India for any legal proceedings.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                12. Severability and Waiver
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
                </p>
                <p>
                  <strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                13. Entire Agreement
              </h2>
              <div className="space-y-4 text-secondary-700">
                <p>
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and XcelFlow regarding your use of the Platform and supersede all prior agreements and understandings.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                14. Contact Information
              </h2>
              <div className="bg-secondary-50 p-6 rounded-xl">
                <p className="text-secondary-700 mb-4">
                  If you have any questions about these Terms and Conditions, please contact us:
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

export default TermsConditions; 
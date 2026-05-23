import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'MemoryLane privacy policy - how we collect, use, and protect your personal information and photos.',
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: May 24, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>
              <strong>Account Information:</strong> When you create an account, we collect your email address and display name. Your password is encrypted and never stored in plaintext.
            </p>
            <p>
              <strong>Photos:</strong> Photos you upload are stored securely in encrypted cloud storage (Supabase Storage). We do not access your photos for any purpose other than processing your restoration requests.
            </p>
            <p>
              <strong>Usage Data:</strong> We collect anonymized usage data to improve our service, including pages visited, features used, and general device information (browser type, operating system).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain our AI photo restoration services</li>
              <li>To process your photo restoration and animation requests</li>
              <li>To send service-related notifications (account verification, processing updates)</li>
              <li>To improve our services through anonymized usage analytics</li>
              <li>To ensure platform security and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Photo Storage & Retention</h2>
            <p>
              Your uploaded photos and restored results are stored securely and associated with your account. You can delete your photos at any time from your Dashboard or History page. Upon account deletion, all associated photos and data are permanently removed within 30 days.
            </p>
            <p>
              <strong>Third-Party Processing:</strong> Photos are temporarily sent to our AI service providers (Replicate, OpenAI) for processing. These providers process photos on-demand and do not store your photos after processing is complete.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Data Security</h2>
            <p>
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Encryption at rest (AES-256) and in transit (TLS 1.3)</li>
              <li>Row-Level Security (RLS) policies to ensure data isolation between users</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Cookies & Tracking</h2>
            <p>
              We use essential cookies for authentication and session management. We may use Google AdSense cookies for advertising purposes. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> — Authentication, database, and file storage</li>
              <li><strong>Replicate / OpenAI</strong> — AI photo processing (temporary, on-demand)</li>
              <li><strong>Google AdSense</strong> — Advertising (may use cookies)</li>
              <li><strong>Vercel</strong> — Hosting and CDN</li>
              <li><strong>Sentry</strong> — Error monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access, download, or delete your personal data</li>
              <li>Delete your account and all associated data</li>
              <li>Opt out of non-essential communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Children&apos;s Privacy</h2>
            <p>
              Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the updated policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:support@memorylane.app" className="text-blue-600 hover:underline">
                support@memorylane.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

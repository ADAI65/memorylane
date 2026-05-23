import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'MemoryLane terms of service - rules and guidelines for using our AI photo restoration platform.',
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: May 24, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MemoryLane (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>
              MemoryLane provides AI-powered photo restoration, colorization, animation, and related services. Basic photo restoration is provided free of charge. Premium features are available with daily usage limits.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p>
              You must create an account to use the Service. You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Upload content that is illegal, harmful, threatening, or otherwise objectionable</li>
              <li>Upload images of individuals without their consent</li>
              <li>Attempt to exploit, hack, or overload the Service</li>
              <li>Use automated tools to bypass usage limits</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Use the Service for any purpose that violates applicable law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Intellectual Property</h2>
            <p>
              <strong>Your Photos:</strong> You retain all rights to photos you upload. By uploading photos, you grant us a limited license to process them using our AI services.
            </p>
            <p>
              <strong>Restored Results:</strong> You own the output of our restoration services. We do not claim ownership of your restored or enhanced photos.
            </p>
            <p>
              <strong>Platform:</strong> The MemoryLane platform, including its design, code, and branding, is protected by intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Usage Limits</h2>
            <p>
              Free-tier services are provided with reasonable usage limits to ensure fair access for all users. We reserve the right to adjust limits or temporarily restrict access for accounts that exceed normal usage patterns.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee that:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Restoration results will meet your expectations</li>
              <li>The Service will be uninterrupted or error-free</li>
              <li>AI-generated content will be historically or factually accurate</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, MemoryLane shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time from your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
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

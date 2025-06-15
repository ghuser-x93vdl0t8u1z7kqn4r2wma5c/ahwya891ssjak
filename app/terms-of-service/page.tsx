// app/terms-of-service/page.tsx
import React from "react";
import Navbar from "@/app/landing-page/components/Navbar/Navbar";
import Footer from "@/app/landing-page/components/Footer/Footer";

export default function TermsOfService() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-green-light py-12 px-6 max-w-4xl mx-auto font-sans">
        <h1 className="text-4xl yatra-one-text font-extrabold text-purple-attention uppercase mb-10 tracking-wide text-center">
          Terms of Service
        </h1>

        <section className="space-y-8 text-gray-input-text text-lg leading-relaxed">
          <p>
            Welcome to Lahara.work — a realm where opportunity meets ambition,
            and where the pursuit of your craft intertwines with the rhythms of
            a digital marketplace. Yet, before embarking on this journey, you
            must understand the path you walk and the rules that govern it.
          </p>

          <p>
            We do not guarantee that jobs will be available, nor that any
            project will come your way. The ebb and flow of work depends on many
            tides beyond our control — market demand, client discretion, your
            own persistence and skill. This platform is your stage, but the
            spotlight is never promised.
          </p>

          <p>
            Integrity is the bedrock of our community. Any attempt to defraud,
            deceive, or manipulate others on this platform — whether by
            misrepresenting skills, credentials, or deliverables — will result
            in immediate and irrevocable banishment from Lahara.work. We hold no
            tolerance for bad faith.
          </p>

          <p>
            When a user applies for a job, and when a client hires an applicant,
            both parties explicitly agree to the job details, deliverables,
            timelines, and applicant information as presented within Lahara.work.
            This mutual acceptance forms a binding understanding between the
            client and freelancer. Lahara.work acts solely as the platform
            facilitating this connection and disclaims responsibility for any
            disputes arising from the execution or interpretation of these
            agreements.
          </p>

          <p>
            Payments processed outside of this application, between users or
            clients directly, sever us of responsibility. Should disputes or
            losses arise from such external dealings, Lahara.work shall bear no
            liability, and users proceed at their own risk.
          </p>

          <p>
            To maintain and enhance this platform, a withdrawal fee of 5% is
            applied to all funds transferred out of the Lahara.work wallet. This
            fee is non-negotiable and supports operational costs, security
            upkeep, and ongoing innovation.
          </p>

          <section className="border border-purple-attention rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-semibold text-purple-attention mb-4">
              In-App Currency and Payment Verification
            </h2>
            <p className="mb-4">
              All purchases of in-app currency via third-party payment services,
              including but not limited to eSewa, require manual verification by
              Lahara.work before the corresponding in-app balance is credited to
              your account.
            </p>
            <p className="mb-4">
              By initiating a payment, you acknowledge and accept that your
              payment is not automatically credited and may take time to verify.
              Lahara.work reserves the right to delay, withhold, or reject
              crediting funds based on verification outcomes.
            </p>
            <p className="mb-4">
              You are responsible for providing accurate and complete transaction
              details for verification. Failure to do so may result in delays or
              inability to credit your account.
            </p>
            <p className="mb-4">
              Lahara.work is not liable for any issues, delays, or failures
              caused by the third-party payment providers. Any disputes with the
              payment service must be resolved directly with the provider.
            </p>
            <p className="mb-0">
              Once your in-app currency balance has been credited, any withdrawal
              of funds will incur a 5% processing fee, which will be deducted
              from the amount withdrawn.
            </p>
          </section>

          <p>
            By using this Service, you agree to comply with all applicable laws,
            regulations, and rules. You alone bear responsibility for the content
            you produce, the agreements you enter, and the actions you take.
          </p>

          <p>
            We reserve the right, at our sole discretion, to modify, suspend,
            or terminate the Service or your access to it, with or without
            notice, for any reason including violation of these Terms.
          </p>

          <p>
            Your use of Lahara.work constitutes your acceptance of these Terms,
            as well as any future amendments or updates we may enact. It is your
            responsibility to stay informed of changes; continued use implies
            consent.
          </p>

          <p>
            While we strive to ensure the platform’s security, stability, and
            performance, we disclaim any warranties — express or implied —
            including, but not limited to, merchantability, fitness for a
            particular purpose, or non-infringement.
          </p>

          <p>
            We shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of your use of or
            inability to use the platform, even if advised of the possibility of
            such damages.
          </p>

          <p>
            This agreement is governed by the laws applicable to Lahara.work’s
            jurisdiction, without regard to conflict of laws principles.
          </p>

          <p>
            Should any provision of these Terms be held invalid or
            unenforceable, the remaining provisions shall continue in full force
            and effect.
          </p>

          <p>
            Your journey with Lahara.work is yours to shape. With each project,
            each connection, each moment spent here, you become part of a larger
            story — a living network fueled by trust, transparency, and tenacity.
            Respect these Terms, and we will walk this path together.
          </p>

          <p className="mt-10 text-center text-sm text-purple-attention font-semibold">
            Questions or concerns? Reach out to us anytime at{" "}
            <a href="mailto:support@lahara.work" className="underline hover:text-purple">
              support@lahara.work
            </a>{" "}
            or visit our{" "}
            <a href="/contact" className="underline hover:text-purple">
              Contact Page
            </a>
            .
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

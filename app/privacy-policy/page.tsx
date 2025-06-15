// app/privacy-policy/page.tsx
import React from "react";
import Navbar from "@/app/landing-page/components/Navbar/Navbar";
import Footer from "@/app/landing-page/components/Footer/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-green-light py-12 px-6 max-w-4xl mx-auto font-sans">
        <h1 className="text-4xl yatra-one-text font-extrabold text-purple-attention uppercase mb-10 tracking-wide text-center">
          Privacy Policy
        </h1>

        <section className="space-y-6 text-gray-input-text text-lg leading-relaxed">
          <p>
            This Privacy Policy (&quot;Policy&quot;) delineates the protocols, procedures, and
            practices adopted by Lahara.work (&quot;we&quot;,&quot;us&quot;,&quot;our&quot;) regarding the
            collection, use, processing, disclosure, safeguarding, and retention of
            information gathered from users (&quot;you&quot; or &quot;your&quot;) interacting with our
            digital services, including but not limited to websites, applications,
            software platforms, and any affiliated services (collectively, the
            &quot;Service&quot;).
          </p>

          <p>
            We employ various technological infrastructures and third-party service
            providers, with Supabase being a principal partner, to manage backend
            operations, data persistence, authentication, and security. While such
            partnerships are integral to Service functionality, we disclaim any and
            all liability for data breaches or unauthorized access resulting from
            vulnerabilities inherent in these third-party systems, despite our
            reasonable efforts to secure user data through appropriate contractual
            and technical safeguards.
          </p>

          <p>
            Your authentication credentials, including passwords and related
            security information, are subjected to one-way cryptographic hashing
            algorithms before storage to mitigate exposure risks. Users acknowledge
            that despite such technical mitigations, no system can guarantee
            invulnerability to cyber threats or unauthorized intrusions.
          </p>

          <p>
            Messages and communication data exchanged between users on our platform
            are encrypted both during transmission and while stored on our servers,
            employing industry-standard encryption protocols such as TLS and AES.
            Nonetheless, it is crucial to understand that these encryption
            mechanisms do not constitute end-to-end encryption; accordingly,
            certain metadata and content may be accessible by the Service providers
            under specific circumstances, including for maintenance, compliance, or
            security investigations.
          </p>

          <p>
            Information collected from your interactions with the Service may
            encompass personally identifiable information (&quot;PII&quot;), usage statistics,
            device and browser metadata, IP addresses, and behavioral data.
            Collection is limited strictly to the minimum necessary to facilitate
            Service provision, ensure security, conduct analytics, and comply with
            legal obligations.
          </p>

          <p>
            We do not engage in the sale, barter, or rental of your personal data to
            third parties for commercial purposes. However, we may share or disclose
            your information under circumstances including, but not limited to,
            compliance with valid legal processes, governmental requests, law
            enforcement investigations, or to protect the rights, property, or
            safety of Lahara.work, its users, or others.
          </p>

          <p>
            Your rights concerning your personal data include, where applicable, the
            rights to access, rectify, erase, restrict processing, object to
            processing, and data portability. Exercising these rights may be subject
            to verification processes and limitations as mandated by applicable
            laws and regulations.
          </p>

          <p>
            Data retention periods are determined based on operational necessity,
            legal requirements, and security considerations. User data will be
            retained only for as long as reasonably required to fulfill the purposes
            outlined in this Policy or as otherwise legally mandated.
          </p>

          <p>
            While we implement commercially reasonable technical and organizational
            measures to safeguard your information against unauthorized access,
            alteration, disclosure, or destruction, no method of electronic
            transmission or storage is entirely secure. You accept the inherent
            risks of electronic communications and transmission of information over
            the internet.
          </p>

          <p>
            By accessing, registering for, or using the Service, you explicitly
            consent to the collection, use, and disclosure of your information as
            described in this Policy, and you acknowledge that your continued use
            signifies your agreement to be bound by the terms herein.
          </p>

          <p>
            We reserve the unilateral, exclusive, and absolute right to amend,
            modify, revise, or update this Policy at any time, with or without prior
            notice. It is your responsibility to periodically review this Policy
            for changes. Continued use of the Service following any such amendments
            shall constitute acceptance of those changes.
          </p>

          <p>
            We encourage you to contact our designated privacy officer or support
            team via the contact mechanisms provided within the Service should you
            have any questions, concerns, or requests regarding this Policy or your
            personal data.
          </p>

          <p>
            This Policy shall be governed by and construed in accordance with the
            laws of the jurisdiction in which Lahara.work operates, without regard
            to conflict of law principles.
          </p>

          <p>
            If any provision of this Policy is found invalid or unenforceable, that
            provision shall be severed, and the remaining provisions shall remain in
            full force and effect.
          </p>

          <p>
            Use of our Service is conditioned on your acceptance and compliance with
            this Policy. This document, together with any other legal notices and
            policies published by Lahara.work, constitutes the entire agreement
            between you and Lahara.work regarding privacy and data protection.
          </p>

          <p className="mt-10 text-center text-sm text-purple-attention font-semibold">
            Questions or concerns? Reach out to us anytime at{" "}
            <a
              href="mailto:support@lahara.work"
              className="underline hover:text-purple"
            >
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

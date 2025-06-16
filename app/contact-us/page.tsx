'use client';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import Navbar from '../landing-page/components/Navbar/Navbar';
import Footer from '../landing-page/components/Footer/Footer';

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('contact_form').insert([
        { name: name.trim(), email: email.trim(), message: message.trim() }
      ]);
      if (error) throw error;
      setFormSuccess("Thank you for contacting us! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 bg-white text-body px-4 pb-2">
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-12 p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold yatra-one-text text-purple">{/* purple accent + yatra-one font */}
            Contact Us
          </h1>
          <p className="mt-4 text-body">
            We&apos;d love to hear from you. Whether you&apos;re a freelancer, client, or curious visitor — reach out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-purple">Get in touch</h2>
              <p className="text-body mt-2">
                Our team is here to help. Drop us a message and we&apos;ll get back to you as soon as we can.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-heading">Email</p>
                <Link href="mailto:contact@lahara.work" className="text-purple hover:underline">
                  contact@lahara.work
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-heading">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full border border-gray-input-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-heading">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full border border-gray-input-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-heading">Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="mt-1 block w-full border border-gray-input-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple"
                value={message}
                onChange={e => setMessage(e.target.value)}
                disabled={loading}
              ></textarea>
            </div>

            {formError && <div className="text-red text-sm">{formError}</div>}
            {formSuccess && <div className="text-purple text-sm">{formSuccess}</div>}

            <button
              type="submit"
              className="bg-purple hover:bg-purple-attention text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

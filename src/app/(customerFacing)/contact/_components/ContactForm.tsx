'use client';

import { useState, type FormEvent } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      });

      if (!res.ok) throw new Error('Failed to send');
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="mt-12 text-center">
        <p className="text-sm font-medium tracking-wider uppercase">Thank you</p>
        <p className="mt-2 text-sm text-gray-500">
          Your message has been sent. We&rsquo;ll be in touch shortly.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-xs tracking-wider uppercase underline underline-offset-4 transition-colors hover:text-gray-500"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-xs tracking-wider uppercase text-gray-500">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-2 w-full border-b border-gray-300 bg-transparent py-2 text-sm outline-none transition-colors placeholder:text-gray-300 focus:border-black"
          placeholder="Your name"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs tracking-wider uppercase text-gray-500">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-2 w-full border-b border-gray-300 bg-transparent py-2 text-sm outline-none transition-colors placeholder:text-gray-300 focus:border-black"
          placeholder="your@email.com"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-xs tracking-wider uppercase text-gray-500">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-2 w-full resize-none border-b border-gray-300 bg-transparent py-2 text-sm outline-none transition-colors placeholder:text-gray-300 focus:border-black"
          placeholder="Tell us what you have in mind…"
        />
      </div>

      {/* Error */}
      {status === 'error' && (
        <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-black py-3 text-xs font-medium tracking-widest text-white uppercase transition-colors hover:bg-gray-900 disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

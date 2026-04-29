"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    property: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // SIMPLE PHONE VALIDATION
    if (!formData.phone || formData.phone.replace(/\D/g, "").length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        // RESET FORM DATA AFTER SUCCESS
        setFormData({ name: "", phone: "", property: "", location: "" });
      } else {
        alert("Failed to submit request. Please try again.");
      }
    } catch {
      alert("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
          ✓
        </div>
        <h3 className="text-2xl font-bold text-zinc-900">Request submitted!</h3>
        <p className="mt-4 text-zinc-600">
          We have received your details and will contact you within 24 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-8 text-sm font-bold text-zinc-900 underline"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-zinc-900">
            Full Name
          </label>
          <input
            autoFocus
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="mt-2 h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none disabled:opacity-50"
            disabled={loading}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-zinc-900">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="mt-2 h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none disabled:opacity-50"
            disabled={loading}
          />
        </div>

        {/* Property Name */}
        <div>
          <label htmlFor="property" className="block text-sm font-semibold text-zinc-900">
            Property Name
          </label>
          <input
            type="text"
            id="property"
            required
            value={formData.property}
            onChange={handleChange}
            placeholder="E.g. Shivay Resort"
            className="mt-2 h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none disabled:opacity-50"
            disabled={loading}
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-zinc-900">
            Property Location
          </label>
          <input
            type="text"
            id="location"
            required
            value={formData.location}
            onChange={handleChange}
            placeholder="E.g. Manali, Himachal Pradesh"
            className="mt-2 h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none disabled:opacity-50"
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 py-4 font-bold text-white transition hover:bg-zinc-800 disabled:bg-zinc-400"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {/* WhatsApp Fallback */}
      {!loading && (
        <div className="mt-8 border-t border-zinc-100 pt-8 text-center">
          <p className="text-sm text-zinc-500">Or contact us instantly on WhatsApp</p>
          <a
            href="https://wa.me/919019650157?text=Hi, I want to book a room at Shivay Resort"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-50"
          >
            <span className="text-green-500">●</span> Chat on WhatsApp
          </a>
        </div>
      )}

      {/* TRUST LINE */}
      <div className="mt-8 text-center text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
        No spam • Quick setup • 24-hour response
      </div>
    </div>
  );
}

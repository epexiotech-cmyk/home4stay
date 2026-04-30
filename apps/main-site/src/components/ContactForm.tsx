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
      <div className="rounded-3xl border border-border bg-surface p-12 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success text-2xl font-bold">
          ✓
        </div>
        <h3 className="text-3xl font-extrabold text-primary">Request submitted!</h3>
        <p className="mt-4 text-secondary">
          We have received your details and will contact you within 24 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-8 text-sm font-bold text-primary underline underline-offset-8 hover:text-accent transition-colors"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-10 shadow-2xl">
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-primary mb-2">
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
            className="h-14 w-full rounded-xl border border-border bg-surface-alt px-5 text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50 transition-all"
            disabled={loading}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-bold text-primary mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="h-14 w-full rounded-xl border border-border bg-surface-alt px-5 text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50 transition-all"
            disabled={loading}
          />
        </div>

        {/* Property Name */}
        <div>
          <label htmlFor="property" className="block text-sm font-bold text-primary mb-2">
            Property Name
          </label>
          <input
            type="text"
            id="property"
            required
            value={formData.property}
            onChange={handleChange}
            placeholder="E.g. Shivay Resort"
            className="h-14 w-full rounded-xl border border-border bg-surface-alt px-5 text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50 transition-all"
            disabled={loading}
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-bold text-primary mb-2">
            Property Location
          </label>
          <input
            type="text"
            id="location"
            required
            value={formData.location}
            onChange={handleChange}
            placeholder="E.g. Manali, Himachal Pradesh"
            className="h-14 w-full rounded-xl border border-border bg-surface-alt px-5 text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50 transition-all"
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-secondary w-full py-5 text-lg rounded-xl"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {/* WhatsApp Fallback */}
      {!loading && (
        <div className="mt-12 border-t border-border pt-10 text-center">
          <p className="text-sm text-secondary mb-6">Or contact us instantly on WhatsApp</p>
          <a
            href="https://wa.me/919019650157?text=Hi, I want to book a room at Shivay Resort"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-8 py-4 text-sm font-bold text-primary shadow-sm hover:shadow-md hover:bg-surface-alt transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Chat on WhatsApp
          </a>
        </div>
      )}

      {/* TRUST LINE */}
      <div className="mt-12 text-center text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em]">
        No spam • Quick setup • 24-hour response
      </div>
    </div>
  );
}

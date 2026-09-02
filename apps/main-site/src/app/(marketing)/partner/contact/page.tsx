import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <section className="bg-zinc-50 py-20 px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl">
            Get your booking website started
          </h1>
          <p className="mt-4 text-xl text-zinc-600">
            Fill the details and we&apos;ll contact you within 24 hours
          </p>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="mx-auto max-w-xl px-6 py-20">
        <ContactForm />
      </section>
    </div>
  );
}

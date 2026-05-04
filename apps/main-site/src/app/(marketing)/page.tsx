"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const PROPERTIES = [
  {
    id: 1,
    title: "Luxury Himalayan Retreat",
    location: "Manali, Himachal Pradesh",
    price: "8,500",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800",
    type: "Villa"
  },
  {
    id: 2,
    title: "Coastal Breeze Villa",
    location: "Anjuna, Goa",
    price: "12,000",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    type: "Villa"
  },
  {
    id: 3,
    title: "Vintage Heritage Home",
    location: "Jaipur, Rajasthan",
    price: "5,500",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800",
    type: "Homestay"
  },
  {
    id: 4,
    title: "Serene Lakeside Cottage",
    location: "Udaipur, Rajasthan",
    price: "7,200",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=800",
    type: "Budget Stay"
  },
  {
    id: 5,
    title: "Modern Jungle Stay",
    location: "Wayanad, Kerala",
    price: "4,800",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800",
    type: "Homestay"
  },
  {
    id: 6,
    title: "Royal Palace Suite",
    location: "Jodhpur, Rajasthan",
    price: "15,000",
    rating: "5.0",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
    type: "Villa"
  },
  {
    id: 7,
    title: "Backwater Zen House",
    location: "Alleppey, Kerala",
    price: "6,000",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
    type: "Homestay"
  },
  {
    id: 8,
    title: "Mountain View Cabin",
    location: "Shimla, Himachal Pradesh",
    price: "3,500",
    rating: "4.5",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
    type: "Budget Stay"
  },
  {
    id: 9,
    title: "Elegant Tea Estate Villa",
    location: "Munnar, Kerala",
    price: "9,000",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    type: "Villa"
  },
  {
    id: 10,
    title: "Rustic Desert Camp",
    location: "Jaisalmer, Rajasthan",
    price: "2,500",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&q=80&w=800",
    type: "Budget Stay"
  },
  {
    id: 11,
    title: "Urban Chic Apartment",
    location: "Bandra, Mumbai",
    price: "10,500",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1449156001533-cb3941e246ee?auto=format&fit=crop&q=80&w=800",
    type: "Homestay"
  },
  {
    id: 12,
    title: "Quiet Riverbank Home",
    location: "Rishikesh, Uttarakhand",
    price: "4,000",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800",
    type: "Homestay"
  }
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProperties = activeCategory === "All" 
    ? PROPERTIES 
    : PROPERTIES.filter(p => p.type === activeCategory);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* SECTION 1: Hero */}
      <section className="bg-background pt-60 pb-32 px-6 text-center overflow-hidden relative">
        {/* Abstract Background Blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

        {/* Categories as floating bullet points */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 animate-in fade-in slide-in-from-top-10 duration-1000 delay-200 fill-mode-both">
          {["All", "Homestay", "Villa", "Budget Stay"].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`group flex items-center px-5 py-2.5 rounded-full border transition-all duration-500 shadow-sm ${
                activeCategory === category 
                  ? "bg-white border-primary shadow-lg scale-105" 
                  : "border-gray-200 bg-white/40 backdrop-blur-md text-gray-600 hover:bg-white hover:shadow-lg hover:border-primary"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 mr-2.5 ${
                activeCategory === category ? "bg-primary" : "bg-primary/40 group-hover:bg-primary"
              }`} />
              <span className={`text-sm font-bold ${activeCategory === category ? "text-gray-900" : "text-gray-600"}`}>
                {category}
              </span>
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-[800px] animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
          <h1 className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl leading-[1.1]">
            Find <span className="text-primary italic">your</span> perfect <span className="text-primary italic">stay.</span>
          </h1>
          <p className="mt-8 text-xl text-gray-500 font-medium max-w-[600px] mx-auto leading-relaxed">
            Discover handpicked homestays, luxury villas, and authentic experiences tailored for your next journey.
          </p>
        </div>
      </section>

      {/* SECTION 2: Featured Properties */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Featured Properties</h2>
            <p className="text-gray-500 mt-1 font-medium">Handpicked stays for your next adventure</p>
          </div>
          <Link href="/explore" className="hidden sm:flex items-center gap-2 text-sm font-bold text-primary hover:underline underline-offset-4 transition-all">
            View all properties
            <span className="text-lg">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[400px]">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <Link key={property.id} href={`/explore/${property.id}`} className="group cursor-pointer animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                <Image 
                  src={property.image} 
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 hover:text-red-500 transition-colors"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </div>
                <div className="absolute bottom-4 left-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  {property.type}
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{property.title}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-gray-900">★</span>
                    <span className="text-sm font-bold text-gray-700">{property.rating}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500 mb-3">{property.location}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-gray-900">₹{property.price}</span>
                  <span className="text-sm font-medium text-gray-500">/ night</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-xl font-bold text-gray-400">No properties found in this category.</p>
            <button onClick={() => setActiveCategory("All")} className="mt-4 text-primary font-bold hover:underline">Show all properties</button>
          </div>
        )}
        </div>

        <Link href="/explore" className="mt-16 block text-center w-full sm:hidden py-4 rounded-2xl border-2 border-gray-100 text-sm font-black text-gray-900 hover:bg-gray-50 transition-all">
          View all properties
        </Link>
      </section>

      {/* SECTION 3: CTA */}
      <section className="mx-auto w-[95vw] mb-20">
        <div className="relative overflow-hidden rounded-[3rem] bg-gray-900 px-8 py-20 text-center text-white shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1449156001533-cb3941e246ee?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-30" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-4xl font-black text-white sm:text-5xl tracking-tight">Own a property?</h2>
            <p className="mt-6 text-lg text-gray-300 font-medium leading-relaxed">
              Earn extra income by listing your home on Home4Stay. Reach thousands of travelers looking for authentic experiences.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-black rounded-full hover:bg-primary-dark hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                List Your Property
              </button>
              <button className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-md text-white font-black rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


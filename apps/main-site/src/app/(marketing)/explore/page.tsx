"use client";

import Image from "next/image";
import Link from "next/link";
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

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProperties = activeCategory === "All" 
    ? PROPERTIES 
    : PROPERTIES.filter(p => p.type === activeCategory);

  return (
    <div className="min-h-screen bg-background pt-80 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl mb-4">
            Find your next <span className="text-primary italic">adventure</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-xl">
            Browse through our curated collection of premium homestays, villas, and budget stays.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-16">
          {["All", "Homestay", "Villa", "Budget Stay"].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`group flex items-center px-6 py-3 rounded-full border transition-all duration-500 shadow-sm ${
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
          
          <div className="ml-auto flex items-center gap-4">
             <button className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-white hover:shadow-md transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filters
             </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[600px]">
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
              <p className="text-2xl font-black text-gray-300">No properties found in this category.</p>
              <button onClick={() => setActiveCategory("All")} className="mt-4 text-primary font-black hover:underline">Show all properties</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

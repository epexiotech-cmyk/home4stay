# Home4Stay Project Documentation - Progress Report

This document provides a comprehensive breakdown of the Home4Stay monorepo architecture, features, and technical standards. It is designed to help new developers understand the "What", "How", and "Why" behind our implementation.

---

## 📂 Project Structure
- **`apps/main-site`**: The public-facing marketing platform and administrative nerve center. Handles lead generation, property management, and partner relations.
- **`apps/property-site`**: The dynamic engine that powers hundreds of individual property websites. It uses a single code base to serve different property profiles based on the URL.
- **`packages/data`**: The shared brain of the project. Contains the property database, shared types, and data access logic used by both applications.

---

## 🏗️ 1. Core Architecture (The Shared Data Layer)
### What it is:
A centralized package (`@home4stay/data`) that prevents code duplication and ensures data consistency across the entire monorepo.

### How it works:
- **Central Database**: All property information is stored in `packages/data/property.json`.
- **Data Access Layer (DAL)**: Instead of apps reading files directly, they use safe helper functions like `getProperty(slug)` and `getAllProperties()`.
- **Type Safety**: TypeScript interfaces (like `Property` and `Room`) are defined once and enforced everywhere, preventing "undefined" errors.

### Why it matters:
If you add a new room or change a price in the JSON, the marketing site and the property site update **instantly** without needing a single code change.

---

## 🏠 2. Dynamic Property Engine (`apps/property-site`)
### What it is:
A high-performance "Site Generator" that renders custom websites for every property in our database.

### How it works:
- **Slug-Based Routing**: When a user visits `/shivay-resort`, the app identifies `shivay-resort` as a "slug," fetches that specific data from the DAL, and populates the UI.
- **Smart Booking System**:
    - **Dynamic Pricing**: Uses React logic to calculate stay duration (nights) and total costs in real-time.
    - **WhatsApp-First UX**: Instead of complex checkout forms, we generate a pre-filled WhatsApp link with the booking details. This handles 90% of the conversion friction in the Indian market.
    - **Trust Signals**: Features like "Instant Confirmation" and "Secure Booking" are baked into the layout to maximize user confidence.

---

## 📊 3. Admin & Business Suite (`apps/main-site`)
### What it is:
A secure administrative area for the Home4Stay team to manage the business.

### Features & Implementation:
- **Route Guarding (Middleware)**: Every admin page is protected. If you aren't logged in (verified via a secure cookie), the system instantly redirects you to `/admin/login`.
- **Leads CRM Dashboard**: 
    - A real-time view of all property owner inquiries.
    - Features "Click-to-Copy" phone numbers and "Call/WhatsApp" quick-actions for high-speed outreach.
    - Sorting and filtering ensure that "New" leads are never buried under old data.
- **Property Management Hub**:
    - An interface to "spawn" new property websites. 
    - **Slug Hardening**: If you add "Royal Villa" twice, the system automatically creates `royal-villa` and `royal-villa-1` to prevent broken links.
    - **Smart Normalization**: A custom engine that standardizes input. It fixes sloppy typing (e.g., `"manali"` -> `"Manali"`) and handles complex terms like `"3BHK"` or `"Eco-Friendly"` automatically.

---

## 📣 4. Marketing & Data Integrity
### How we protect our data:
- **Atomic Secure Writes**: When the system writes to our JSON database (for leads or properties), it first writes to a temporary file and *then* renames it. This prevents "partial writes" or file corruption if a server crashes mid-save.
- **Input Sanitization**: Every piece of data entering the system is trimmed, title-cased, and cleaned of extra spaces to maintain a "Premium" feel across the UI.

### Lead Capture:
The "Partner with Us" form uses a hardened API endpoint that validates every field and stores inquiries safely, triggering an immediate update on the Admin Dashboard.

---

## ✨ 5. Design & Tech Standards
- **Design System**: Built on a modern "Zinc-900" (Black & White) aesthetic. It uses high-contrast typography and subtle glassmorphism to feel "Premium" and "High-Trust."
- **Next.js 15+ & React 19**: Utilizing the latest React features like Server Components for speed and Client Components for interactivity.
- **Indian Market Localization**: Currencies are formatted using the Indian numbering system (`₹3,00,000` instead of `300,000`).

---

## 🚀 6. Latest Updates & Enhancements
### 🏨 Room Management System
- **Granular Inventory Control**: Admins can now manage specific room types for each property.
- **Smart Validation**: 
  - Prevents zero or negative pricing.
  - **Duplicate Check**: Ensures no two rooms in the same property share a name.
  - **Whitespace Normalization**: Automatically cleans up messy room names (e.g., `" Deluxe   Suite "` -> `"Deluxe Suite"`).

### 🖼️ Image Management & Optimization
- **High-Performance Media Pipeline**:
  - **Sharp Integration**: Every image is now processed locally using the industry-standard `sharp` library.
  - **Auto-Conversion**: All uploads are converted to **WebP** (80% quality) for maximum speed.
  - **Cinematic Resizing**: Images are automatically cropped and resized to **1920x1080 (1080p)** to ensure a uniform, premium look in galleries.
- **Media Security Guards**:
  - **Payload Limits**: Strictly enforces a **5MB maximum** file size to protect server resources.
  - **MIME Validation**: Only authentic image files (JPEG, PNG, WebP) are accepted.
  - **Inventory Cap**: Limits each property to **10 high-quality images** to maintain site performance.
  - **Fetch Resilience**: Robust error handling for broken or private image URLs.

### 💎 Data Quality & UX Polish
- **Advanced "Smart Title Case"**: 
  - Intelligently handles small words (*and, of, the, in*).
  - **Acronym Support**: Preserves official terms like `HP`, `UK`, `USA`.
  - **Hyphenation Logic**: Correctly capitalizes terms like `Eco-Friendly`.
  - **Unit Intelligence**: Recognizes and capitalizes housing units like `3BHK` or `2BHK`.
- **Admin Workflow Improvements**:
  - Integrated navigation links for "Rooms" and "Images" directly onto property cards.
  - Live gallery previews in the admin panel for instant feedback.

### 🔒 Final Hardening & Production Readiness
- **Room Data Integrity**:
  - **Normalized room names**: Automatically cleans up whitespace and formatting (trim + remove extra spaces).
  - **Case-insensitive duplicate prevention**: Ensures unique room names within a single property profile.
  - **Strict positive pricing validation**: Prevents broken or zero-cost listings.
- **Image Pipeline Hardening**:
  - **5MB file size limit**: Protects server memory and storage from payload overload.
  - **MIME type validation**: Strictly enforces `image/*` formats to prevent malicious or incompatible file uploads.
  - **Safe fetch handling**: Robust resilience against broken, private, or invalid image URLs.
  - **Max 10 images per property**: A critical performance guard to keep property sites lean and fast.
- **Media Reliability**:
  - **Self-hosted image system**: No longer relies on external URLs; all assets are optimized and hosted locally.
  - **Atomic write pattern**: Every database update uses a secure write-to-temp-then-rename cycle to prevent data loss.
  - **Graceful failure handling**: Integrated error wrapping for both network fetch and `sharp` processing stages.
- **System Stability Upgrade**:
  - All critical APIs are now professionally guarded against invalid input, duplicate entries, and corrupted payloads.
  - Ensures production-safe behavior even under high administrative usage.

---

### 🚀 Developer Onboarding Checklist
1.  **Run the project**: `npm run dev` in the root.
2.  **Add a property**: Go to `/admin/properties` (login with `admin` / `123456`) and add a test property.
3.  **Manage Assets**: Click on **"Rooms"** or **"Images"** on the property card to build your inventory.
4.  **View the result**: Check `/explore` on the main site or visit `localhost:3001/[your-slug]` to see your optimized gallery and rooms live.


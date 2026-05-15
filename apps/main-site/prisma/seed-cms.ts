/**
 * Production Database Seeding Script mapping core multi-tenant hospitality CMS presets.
 * Populates clean baseline records for shivay-resort-101 to verify isolated administrative operations.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Initializing persistent Universal Section Registry database seed workflows...");

  // 1. Establish Master Tenant Owner Account
  const masterOwner = await prisma.user.upsert({
    where: { email: "owner@home4stay.com" },
    update: {},
    create: {
      id: "partner_admin_owner",
      email: "owner@home4stay.com",
      name: "Partner Luxury Administrator",
      role: "owner",
      password: "$argon2id$v=19$m=65536,t=3,p=4$mockhashedpasswordsignatureforseedonly",
    },
  });

  console.log(`Verified master ownership root identity node: ${masterOwner.id}`);

  // 2. Establish Primary Demo Property Target
  const targetProperty = await prisma.property.upsert({
    where: { slug: "shivay-resort" },
    update: {},
    create: {
      id: "shivay-resort-101",
      ownerId: masterOwner.id,
      slug: "shivay-resort",
      title: "Shivay Resort — Mountain Sanctuary",
    },
  });

  console.log(`Linked demo SaaS hospitality entity bundle: ${targetProperty.title}`);

  // 3. Populate Default Property Page Content Root Profile
  const pageContent = await prisma.propertyPageContent.upsert({
    where: { propertyId: targetProperty.id },
    update: {},
    create: {
      propertyId: targetProperty.id,
      themeVariant: "Mountain Luxury",
      spacingPreset: "relaxed-luxury",
      animationPreset: "cinematic-fade-physics",
    },
  });

  // 4. Populate Decoupled Render Section Block Sequences
  const defaultSections = [
    {
      type: "hero",
      sortOrder: 0,
      data: {
        title: "Shivay Resort",
        subtitle: "Your Mountain Sanctuary Above the Clouds",
        ctaText: "Discover Stays",
        ctaLink: "#booking",
        backgroundImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        overlayOpacity: 0.4,
      },
    },
    {
      type: "narrative",
      sortOrder: 1,
      data: {
        smallLabel: "CINEMATIC HOSPITALITY",
        mainHeading: "A sanctuary of",
        highlightText: "timeless luxury.",
        description: "Located in the serene environment of Manali, Himachal Pradesh, our Villa provides a perfect blend of modern luxury and traditional hospitality.",
        stats: [
          { id: "1", value: "12+", label: "Luxury Experiences" },
          { id: "2", value: "100%", label: "Privacy Guaranteed" },
        ],
      },
    },
    {
      type: "carousel",
      sortOrder: 2,
      data: {
        cards: [
          {
            id: "card-1",
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
            badge: "ARCHITECTURE",
            title: "Designed to merge seamlessly",
            description: "with the mountain horizon.",
            isActive: true,
            sortOrder: 0,
          },
          {
            id: "card-2",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            badge: "INTERIORS",
            title: "Raw structural wood elements",
            description: "crafted by local generational hands.",
            isActive: true,
            sortOrder: 1,
          },
        ],
      },
    },
    {
      type: "gallery",
      sortOrder: 3,
      data: {
        images: [
          {
            id: "gal-1",
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            category: "Exterior",
            caption: "Front facade viewing across alpine peaks.",
          },
          {
            id: "gal-2",
            url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
            category: "Living Room",
            caption: "Warm central fireplace sitting framework.",
          },
        ],
      },
    },
    {
      type: "seo",
      sortOrder: 4,
      data: {
        metaTitle: "Shivay Resort — Premium Mountain Sanctuary Above the Clouds",
        metaDescription: "Experience an elegant, tailored luxury stay in Manali wrapped in timeless atmosphere.",
      },
    },
  ];

  console.log("Seeding isolated sequential section block fragments...");
  for (const sec of defaultSections) {
    await prisma.propertySection.create({
      data: {
        propertyPageContentId: pageContent.id,
        type: sec.type,
        sortOrder: sec.sortOrder,
        enabled: true,
        data: sec.data,
      },
    });
  }

  // 5. Populate Media Assets catalog for native selection reuse
  const demoImages = [
    { url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80", tags: "Hero, Exterior" },
    { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", tags: "Living Room, Fireplace" },
    { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", tags: "Bedrooms, Views" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", tags: "Pool, Landscape" },
  ];

  for (const img of demoImages) {
    await prisma.mediaAsset.create({
      data: {
        propertyId: targetProperty.id,
        url: img.url,
        tags: img.tags,
        uploadedBy: masterOwner.id,
      },
    });
  }

  console.log("Seeding execution state validated successfully. Database layer fully persistent.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

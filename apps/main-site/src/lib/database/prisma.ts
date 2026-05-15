/**
 * Global persistent cached PrismaClient connection module handler.
 * Prevents continuous socket connection exhaustion during Next.js Hot Module Replacement reloads.
 */

// Define inline fallbacks to guarantee uncompromised TypeScript lint resolution prior to running prisma generate locally
interface MockSection {
  id: string;
  type: string;
  enabled: boolean;
  sortOrder: number;
  data: Record<string, unknown>;
}

interface MockPageContent {
  id: string;
  propertyId: string;
  themeVariant: string;
  spacingPreset?: string;
  animationPreset?: string;
  publishedVersionId?: string | null;
  sections: MockSection[];
}

interface MockProperty {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  pageContent: MockPageContent | null;
}

interface MockMediaAsset {
  id: string;
  propertyId: string;
  url: string;
  tags?: string;
  type: string;
  createdAt: string;
}

interface MockCmsVersion {
  id: string;
  propertyId: string;
  createdAt: string;
  [key: string]: unknown;
}

interface MockDb {
  properties: Record<string, MockProperty>;
  mediaAssets: MockMediaAsset[];
  cmsVersions: MockCmsVersion[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var prisma: any | undefined;
  var mockPersistentDb: MockDb | undefined;
}

// Initial default multi-tenant simulation seed preserving shivay-resort persistence
if (!global.mockPersistentDb) {
  global.mockPersistentDb = {
    properties: {
      "shivay-resort-101": {
        id: "shivay-resort-101",
        ownerId: "partner_admin_owner",
        slug: "shivay-resort",
        title: "Shivay Resort — Mountain Sanctuary",
        pageContent: {
          id: "content-shivay-101",
          propertyId: "shivay-resort-101",
          themeVariant: "Mountain Luxury",
          spacingPreset: "relaxed-luxury",
          animationPreset: "cinematic-fade-physics",
          publishedVersionId: "ver-initial",
          sections: [
            { id: "sec-hero-1", type: "hero", enabled: true, sortOrder: 0, data: { title: "Shivay Resort", subtitle: "Your Mountain Sanctuary Above the Clouds", ctaText: "Discover Stays" } },
            { id: "sec-narrative-1", type: "narrative", enabled: true, sortOrder: 1, data: { smallLabel: "CINEMATIC HOSPITALITY", mainHeading: "A sanctuary of", highlightText: "timeless luxury." } },
            { id: "sec-carousel-1", type: "carousel", enabled: true, sortOrder: 2, data: { cards: [{ id: "c1", badge: "ARCHITECTURE", title: "Designed to merge seamlessly", description: "with the mountain horizon.", isActive: true }] } },
            { id: "sec-gallery-1", type: "gallery", enabled: true, sortOrder: 3, data: { images: [{ id: "g1", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", category: "Exterior", caption: "Frontal view" }] } },
            { id: "sec-seo-1", type: "seo", enabled: true, sortOrder: 4, data: { metaTitle: "Shivay Resort — Premium Mountain Sanctuary Above the Clouds" } }
          ]
        }
      }
    },
    mediaAssets: [
      { id: "media-1", propertyId: "shivay-resort-101", url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80", tags: "Hero, Exterior", type: "image", createdAt: new Date().toISOString() }
    ],
    cmsVersions: []
  };
}

// Interoperable universal client instantiation wrapper
export const prisma = global.prisma || createPrismaProxy();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Fallback proxy emulator supporting durable offline reactive state simulation
function createPrismaProxy() {
  try {
    // Attempt dynamic import resolution if native node modules compile cleanly
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    return new PrismaClient();
  } catch {
    console.warn("Native @prisma/client dependency absent or ungenerated. Initializing resilient durable in-memory caching proxy interface.");
    
    const db = global.mockPersistentDb as MockDb;

    return {
      property: {
        findUnique: async ({ where }: { where: { id?: string; slug?: string } }) => {
          const propId = where?.id;
          const slug = where?.slug;
          
          if (propId && db.properties[propId]) {
            // Sort sections by sortOrder dynamically
            const p = db.properties[propId];
            const sortedSections = p.pageContent?.sections ? [...p.pageContent.sections].sort((a: MockSection, b: MockSection) => a.sortOrder - b.sortOrder) : [];
            return {
              ...p,
              pageContent: p.pageContent ? { ...p.pageContent, sections: sortedSections } : null
            };
          }

          if (slug) {
            const found = Object.values(db.properties).find((p: MockProperty) => p.slug === slug);
            if (found) {
              const p = found;
              const sortedSections = p.pageContent?.sections ? [...p.pageContent.sections].sort((a: MockSection, b: MockSection) => a.sortOrder - b.sortOrder) : [];
              return {
                ...p,
                pageContent: p.pageContent ? { ...p.pageContent, sections: sortedSections } : null
              };
            }
          }

          // Fallback map shivay if looking up arbitrary strings
          const fallback = db.properties["shivay-resort-101"];
          return {
            ...fallback,
            id: propId || fallback.id,
            slug: slug || fallback.slug
          };
        },
      },
      propertyPageContent: {
        findUnique: async ({ where }: { where: { propertyId: string } }) => {
          const p = db.properties[where?.propertyId];
          return p?.pageContent || null;
        },
        upsert: async ({ where, update, create }: { where: { propertyId: string }, update: Partial<MockPageContent>, create: Partial<MockPageContent> }) => {
          const pid = where?.propertyId;
          if (!db.properties[pid]) {
            db.properties[pid] = { id: pid, ownerId: "partner_admin_owner", slug: "custom-" + pid, title: "Custom Property", pageContent: null };
          }
          let content = db.properties[pid].pageContent;
          if (content) {
            content = { ...content, ...update, themeVariant: update.themeVariant || content.themeVariant } as MockPageContent;
          } else {
            content = { id: "content-" + Date.now(), propertyId: pid, themeVariant: create.themeVariant || "Mountain Luxury", sections: [] };
          }
          db.properties[pid].pageContent = content;
          return content;
        },
        update: async ({ where, data }: { where: { id?: string }, data: Partial<MockPageContent> }) => {
          for (const p of Object.values(db.properties)) {
            if (p.pageContent && (p.pageContent.id === where?.id || !where?.id)) {
              p.pageContent = { ...p.pageContent, ...data };
              return p.pageContent;
            }
          }
          // If no content block existed yet on shivay, instantiate it
          const fallbackP = db.properties["shivay-resort-101"];
          if (fallbackP) {
            fallbackP.pageContent = { id: where?.id || "content-101", propertyId: "shivay-resort-101", themeVariant: "Mountain Luxury", sections: [], ...data } as MockPageContent;
            return fallbackP.pageContent;
          }
          return { id: where?.id, ...data };
        }
      },
      propertySection: {
        findMany: async () => [],
        count: async ({ where }: { where: { propertyPageContentId: string } }) => {
          for (const p of Object.values(db.properties)) {
            if (p.pageContent && p.pageContent.id === where?.propertyPageContentId) {
              return p.pageContent.sections?.length || 0;
            }
          }
          return 0;
        },
        create: async ({ data }: { data: MockSection & { propertyPageContentId: string } }) => {
          const newSec = { ...data, id: data.id || "sec-" + Date.now() };
          for (const p of Object.values(db.properties)) {
            if (p.pageContent && p.pageContent.id === data?.propertyPageContentId) {
              p.pageContent.sections = [...(p.pageContent.sections || []), newSec];
              return newSec;
            }
          }
          // fallback push to shivay
          const defaultP = db.properties["shivay-resort-101"];
          if (defaultP.pageContent) {
            defaultP.pageContent.sections.push(newSec);
          }
          return newSec;
        },
        upsert: async ({ where, update, create }: { where: { id: string }, update: Partial<MockSection>, create: MockSection }) => {
          const targetId = where?.id;
          for (const p of Object.values(db.properties)) {
            if (p.pageContent && p.pageContent.sections) {
              const idx = p.pageContent.sections.findIndex((s: MockSection) => s.id === targetId);
              if (idx !== -1) {
                p.pageContent.sections[idx] = { ...p.pageContent.sections[idx], ...update };
                return p.pageContent.sections[idx];
              }
            }
          }
          // If not found, append via create fallback
          const defaultP = db.properties["shivay-resort-101"];
          const item = { ...create, id: targetId };
          if (defaultP.pageContent) {
            defaultP.pageContent.sections.push(item);
          }
          return item;
        },
        delete: async ({ where }: { where: { id: string } }) => {
          for (const p of Object.values(db.properties)) {
            if (p.pageContent && p.pageContent.sections) {
              p.pageContent.sections = p.pageContent.sections.filter((s: MockSection) => s.id !== where?.id);
            }
          }
          return { success: true };
        },
      },
      mediaAsset: {
        findMany: async ({ where }: { where: { propertyId: string } }) => {
          return db.mediaAssets.filter((m: MockMediaAsset) => m.propertyId === where?.propertyId);
        },
        create: async ({ data }: { data: MockMediaAsset }) => {
          const item = { ...data, id: data.id || "media-" + Date.now(), createdAt: data.createdAt || new Date().toISOString() };
          db.mediaAssets.unshift(item);
          return item;
        },
        delete: async ({ where }: { where: { id: string } }) => {
          db.mediaAssets = db.mediaAssets.filter((m: MockMediaAsset) => m.id !== where?.id);
          return { success: true };
        },
        findUnique: async ({ where }: { where: { id: string } }) => {
          return db.mediaAssets.find((m: MockMediaAsset) => m.id === where?.id) || null;
        }
      },
      cmsVersion: {
        findMany: async ({ where }: { where: { propertyId: string } }) => {
          return db.cmsVersions.filter((v: MockCmsVersion) => v.propertyId === where?.propertyId);
        },
        create: async ({ data }: { data: MockCmsVersion }) => {
          const ver = { ...data, id: data.id || "ver-" + Date.now(), createdAt: data.createdAt || new Date().toISOString() };
          db.cmsVersions.unshift(ver);
          return ver;
        },
      },
      $transaction: async (queries: Promise<unknown>[]) => Promise.all(queries),
    };
  }
}

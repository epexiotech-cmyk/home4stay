import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/database/prisma";

/**
 * getCurrentProperty
 * Retrieves the property associated with the current user session.
 */

export const PROPERTY_INCLUDES = {
  pageContent: { include: { sections: true } },
  mediaAssets: true,
  rooms: true,
  amenities: true,
  experiences: true,
  policies: true,
  pricing: true,
  owner: { include: { hostProfile: true } },
  mealPlans: true,
  offers: true,
  reviews: { where: { isPublished: true } }
};

export async function getCurrentProperty() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access-token")?.value || cookieStore.get("token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.propertyId) return null;

  try {
    return await prisma.property.findUnique({
      where: { id: payload.propertyId as string },
    });
  } catch (error) {
    console.error("Failed to retrieve current property:", error);
    return null;
  }
}

/**
 * getPropertyBySlug
 * Retrieves a property safely by slug.
 */
export async function getPropertyBySlug(slug: string) {
  try {
    const exact = await prisma.property.findUnique({
      where: { slug }, include: PROPERTY_INCLUDES
    });
    return exact;
  } catch (error) {
    console.error(`Failed to retrieve property by slug ${slug}:`, error);
    return null;
  }
}

/**
 * getPropertyBySubdomain
 * Retrieves a property safely by subdomain.
 */
export async function getPropertyBySubdomain(subdomain: string) {
  try {
    const exact = await prisma.property.findUnique({
      where: { subdomain }, include: PROPERTY_INCLUDES
    });
    return exact;
  } catch (error) {
    console.error(`Failed to retrieve property by subdomain ${subdomain}:`, error);
    return null;
  }
}

/**
 * getPropertyByOwner
 * Retrieves the property mapped exclusively to an owner.
 */
export async function getPropertyByOwner(ownerId: string) {
  try {
    return await prisma.property.findFirst({
      where: { ownerId },
    });
  } catch (error) {
    console.error(`Failed to retrieve property for owner ${ownerId}:`, error);
    return null;
  }
}

/**
 * validatePropertyAccess
 * Verifies if a user is allowed to access a given property ID.
 * Admins have global access, owners only access their mapped property.
 */
export async function validatePropertyAccess(userId: string, role: string, targetPropertyId: string) {
  // Super Admins and Admins bypass tenant checks
  if (["super_admin", "admin"].includes(role)) {
    return true;
  }

  // Find the target property
  const property = await prisma.property.findUnique({
    where: { id: targetPropertyId },
  });

  if (!property) {
    return false;
  }

  // Allow access if user is the assigned owner
  return property.ownerId === userId;
}

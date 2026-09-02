import { resolvePropertyContext } from "@/lib/tenant/contextResolver";

async function test() {
  const slugs = ["shivay", "royal-villa", "taj-villa", "ocean-view"];
  for (const slug of slugs) {
    const property = await resolvePropertyContext(slug);
    console.log(`Slug: ${slug} -> Property: ${property?.name}`);
  }
}

test();

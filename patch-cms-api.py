import os

path = '/home/apurv_patel/home4stay/apps/main-site/src/app/api/property/cms/route.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_get = """export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");

  if (!propertyId) {
    throw new AppError("Missing propertyId", 400, "BAD_REQUEST");
  }

  const property = await propertyCmsService.getCmsData(propertyId);

  if (!property) {
    throw new AppError("Property not found", 404, "NOT_FOUND");
  }

  return successResponse(property);
});"""

new_get = """import { requirePropertyAccess } from "@/lib/auth/rbac";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");

  if (!propertyId) {
    throw new AppError("Missing propertyId", 400, "BAD_REQUEST");
  }

  // Tenant Isolation Security Fix: Validate active session owns this property
  const auth = await requirePropertyAccess(request, propertyId);
  if (!auth.authorized) {
    return auth.response!;
  }

  const property = await propertyCmsService.getCmsData(propertyId);

  if (!property) {
    throw new AppError("Property not found", 404, "NOT_FOUND");
  }

  return successResponse(property);
});"""

# Because requirePropertyAccess needs to be imported, and we added it to new_get
if "import { requirePropertyAccess }" in content:
    new_get = new_get.replace('import { requirePropertyAccess } from "@/lib/auth/rbac";\n\n', '')
else:
    # We can just put the import inside the file if we don't want to parse imports, wait no it's better to add it at top
    new_get = new_get.replace('import { requirePropertyAccess } from "@/lib/auth/rbac";\n\n', '')
    content = content.replace('import { requireRole } from "@/lib/auth/rbac";', 'import { requireRole, requirePropertyAccess } from "@/lib/auth/rbac";')

content = content.replace(old_get, new_get)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("GET /api/property/cms patched for tenant isolation.")

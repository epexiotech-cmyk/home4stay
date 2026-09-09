import os

path = '/home/apurv_patel/home4stay/apps/main-site/src/app/(portal)/partner/property-page-cms/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_prop = '  const propertyId = user?.propertyId || "shivay";'
new_prop = '  const propertyId = user?.propertyId;'

content = content.replace(old_prop, new_prop)

# We need to handle if propertyId is undefined before the useEffect fetches.
# We can just check it in the return block or at the top
old_is_loading = """  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCcw className="animate-spin text-[#0E5A75]" size={32} />
      </div>
    );
  }"""

new_is_loading = """  if (!propertyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="text-red-500" size={48} />
        <h2 className="text-xl font-bold">Property Not Found</h2>
        <p className="text-sm text-gray-500">No active property is linked to this account.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCcw className="animate-spin text-[#0E5A75]" size={32} />
      </div>
    );
  }"""

content = content.replace(old_is_loading, new_is_loading)

# Also update the useEffect to not fetch if propertyId is missing
old_effect = """  useEffect(() => {
    async function fetchCmsData() {
      try {
        const res = await fetch(`/api/property/cms?propertyId=${propertyId}`);"""

new_effect = """  useEffect(() => {
    async function fetchCmsData() {
      if (!propertyId) return;
      try {
        const res = await fetch(`/api/property/cms?propertyId=${propertyId}`);"""

content = content.replace(old_effect, new_effect)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("property-page-cms patched.")

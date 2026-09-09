from pathlib import Path

p = Path('/home/apurv_patel/home4stay/apps/main-site/src/app/(portal)/partner/experiences/page.tsx')
s = p.read_text()

target = '''  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(/api/property/experiences?propertyId= + '');
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || json.message || "Failed to fetch experiences");
      if (!Array.isArray(json.data)) throw new Error("Invalid response format");
      setExperiences(json.data);
    } catch (error: any) {
      setExperiences([]);
      console.error(error);
      toast.error("Failed to load experiences");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);'''

# Let's dynamically replace the whole block carefully.
import re

pattern = re.compile(r'  const fetchExperiences = useCallback\(async \(\) => \{.*?\}, \[propertyId\]\);', re.DOTALL)

replacement = '''  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(/api/property/experiences?propertyId=);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || "Failed to fetch experiences");
      }
      if (!Array.isArray(json.data)) {
        throw new Error("Invalid response format");
      }
      setExperiences(json.data);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load experiences";
      toast.error(errorMessage);
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);'''

new_s = pattern.sub(replacement, s)

p.write_text(new_s)
print('Patched page.tsx successfully')

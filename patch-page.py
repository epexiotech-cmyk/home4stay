import os

path = '/home/apurv_patel/home4stay/apps/main-site/src/app/(portal)/partner/experiences/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert helper function
import_toast = 'import { toast } from "sonner";\n'
helper_code = """
function extractErrorMessage(errJson: unknown): string {
  if (!errJson) return "Unknown error";
  if (typeof errJson === "string") return errJson;
  if (typeof errJson === "object" && errJson !== null) {
    const obj = errJson as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message.trim().length > 0) return obj.message;
    if (obj.error) {
      if (typeof obj.error === "string" && obj.error.trim().length > 0) return obj.error;
      if (typeof obj.error === "object" && obj.error !== null) {
        const errObj = obj.error as Record<string, unknown>;
        if (typeof errObj.message === "string" && errObj.message.trim().length > 0) return errObj.message;
        try {
          return JSON.stringify(errObj);
        } catch {
          return "Unknown error object";
        }
      }
    }
  }
  return "An unexpected error occurred";
}
"""
content = content.replace(import_toast, import_toast + helper_code)

# 2. Update handleAddFromLibrary throw block
old_library_throw = """        }).then(async res => {
          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            if (res.status !== 409) {
              throw new Error(errJson.error || errJson.message || "Failed to add");
            }
          }
          return res;
        })"""
new_library_throw = """        }).then(async res => {
          if (!res.ok) {
            if (res.status === 409) {
              throw new Error("This experience is already added to your property.");
            }
            const errJson = await res.json().catch(() => ({}));
            throw new Error(extractErrorMessage(errJson));
          }
          return res;
        })"""
content = content.replace(old_library_throw, new_library_throw)

# 3. Update catch error in handleAddFromLibrary
old_library_catch = """    } catch (error) {
      console.error(error);
      toast.error("Failed to add some experiences from library");
    } finally {"""
new_library_catch = """    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add some experiences from library";
      toast.error(errorMessage);
    } finally {"""
content = content.replace(old_library_catch, new_library_catch)

# 4. Update handleCreateCustom
old_custom_err = """      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || "Failed to create experience");
      }"""
new_custom_err = """      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(extractErrorMessage(json));
      }"""
content = content.replace(old_custom_err, new_custom_err)

# 5. Update handleToggleActive
old_toggle_err = """      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || "Failed to update status");
      }"""
new_toggle_err = """      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(extractErrorMessage(json));
      }"""
content = content.replace(old_toggle_err, new_toggle_err)

# 6. Update handleDelete
old_delete_err = """        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || json.message || "Failed to delete experience");
        }"""
new_delete_err = """        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          throw new Error(extractErrorMessage(json));
        }"""
content = content.replace(old_delete_err, new_delete_err)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched successfully")

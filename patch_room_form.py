# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/components/RoomForm.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Image and Trash2 to imports if not there
if 'Trash2' not in content:
    content = content.replace('X, UploadCloud', 'X, UploadCloud, Trash2')

# Replace props
content = content.replace(
    'interface RoomFormProps {\n  slug: string;\n}',
    'interface RoomFormProps {\n  slug: string;\n  initialData?: any;\n  onSuccess?: () => void;\n  onCancel?: () => void;\n}'
)

# Replace component signature and state
old_sig = 'export default function RoomForm({ slug }: RoomFormProps) {'
new_sig = 'export default function RoomForm({ slug, initialData, onSuccess, onCancel }: RoomFormProps) {'
content = content.replace(old_sig, new_sig)

old_state = 'const [formData, setFormData] = useState({ name: "", price: "", roomCount: "1", capacity: "2 Guests", view: "Mountain View" });'
new_state = 'const isEditing = !!initialData;\n  const [formData, setFormData] = useState({\n    name: initialData?.name || "",\n    price: initialData?.price?.toString() || "",\n    roomCount: initialData?.roomCount?.toString() || "1",\n    capacity: initialData?.capacity || "2 Guests",\n    view: initialData?.view || "Mountain View"\n  });\n  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);\n  const [deletingImage, setDeletingImage] = useState<string | null>(null);\n\n  const remainingSlots = 12 - existingImages.length;\n'
content = content.replace(old_state, new_state)

# Replace image limit validation
content = content.replace(
    'if (selectedFiles.length + files.length > 12) {',
    'if (selectedFiles.length + files.length > remainingSlots) {'
)
content = content.replace(
    'alert("Maximum of 12 images allowed per room.");',
    'alert(`Maximum of ${remainingSlots} more images allowed.`);'
)
content = content.replace(
    '.slice(0, 12)',
    '.slice(0, remainingSlots)'
)

# Add handleDeleteImage
handle_delete = """
  const handleDeleteImage = async (imageUrl: string) => {
    if (!initialData?.id || !confirm("Are you sure you want to delete this photo?")) return;
    
    setDeletingImage(imageUrl);
    try {
      const getRes = await fetch(`/api/property/room/${initialData.id}/images`);
      if (!getRes.ok) throw new Error("Failed to fetch image details");
      const { data: assets } = await getRes.json();
      
      const asset = assets?.find((a: any) => a.url === imageUrl);
      if (!asset) throw new Error("Image not found in database");
      
      const res = await fetch(`/api/property/room/${initialData.id}/images/${asset.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete image");
      
      setExistingImages(prev => prev.filter(img => img !== imageUrl));
    } catch (err: any) {
      alert(err.message || "Failed to delete image");
    } finally {
      setDeletingImage(null);
    }
  };
"""
content = content.replace('const removeFile = (index: number) => {', handle_delete + '\n  const removeFile = (index: number) => {')

# Replace handleSubmit
submit_replace = """
      // 1. Create Room
      const res = await fetch("/api/property/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name: formData.name, price: Number(formData.price), roomCount: Number(formData.roomCount), capacity: formData.capacity, view: formData.view }),
      });
"""
new_submit = """
      // 1. Create or Update Room
      const url = "/api/property/room";
      const method = isEditing ? "PATCH" : "POST";
      const payload: any = { slug, name: formData.name, price: Number(formData.price), roomCount: Number(formData.roomCount), capacity: formData.capacity, view: formData.view };
      if (isEditing) payload.id = initialData.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
"""
content = content.replace(submit_replace, new_submit)

# Fix room error message
content = content.replace(
    'alert(result.message || "Failed to add room.");',
    'alert(result.message || (isEditing ? "Failed to update room." : "Failed to add room."));'
)

# Use createdRoom or existing Room for images
content = content.replace(
    'const createdRoom = result.data;',
    'const createdRoom = isEditing ? initialData : result.data;'
)
content = content.replace(
    'alert("Room created, but image upload failed: " + (imageResult.message || "Unknown error"));',
    'alert((isEditing ? "Room updated, but image upload failed: " : "Room created, but image upload failed: ") + (imageResult.message || "Unknown error"));'
)

# Call onSuccess
content = content.replace(
    'setSelectedFiles([]);\n      router.refresh();',
    'setSelectedFiles([]);\n      if (onSuccess) onSuccess(); else router.refresh();'
)

# Replace Title
content = content.replace(
    '<h2 className="text-xl font-black text-[#0E5A75] dark:text-white tracking-tight">Add New Suite Node</h2>',
    '<h2 className="text-xl font-black text-[#0E5A75] dark:text-white tracking-tight">{isEditing ? "Edit Suite Node" : "Add New Suite Node"}</h2>'
)
content = content.replace(
    '<p className="text-[10px] text-[#0E5A75]/60 dark:text-white/50 uppercase tracking-widest font-bold">Configure physical spatial inventory</p>',
    '<p className="text-[10px] text-[#0E5A75]/60 dark:text-white/50 uppercase tracking-widest font-bold">{isEditing ? "Update physical spatial inventory" : "Configure physical spatial inventory"}</p>'
)

# Replace image section text
content = content.replace(
    'Upload room photos \u2022 {selectedFiles.length} / 12 photos',
    'Upload room photos \u2022 {existingImages.length + selectedFiles.length} / 12 photos'
)
content = content.replace(
    'disabled={selectedFiles.length >= 12}',
    'disabled={existingImages.length + selectedFiles.length >= 12}'
)

# Add existing images to the preview section
preview_replace = """
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
"""
new_preview = """
            {(existingImages.length > 0 || selectedFiles.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                {existingImages.map((img, idx) => (
                  <div key={`exist-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/20">
                    <img src={img} alt="Existing" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <button type="button" onClick={() => handleDeleteImage(img)} disabled={deletingImage === img} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg">
                        {deletingImage === img ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>
                ))}
"""
content = content.replace(preview_replace, new_preview)

# Add Cancel button and edit labels
content = content.replace(
    '{loading ? "Committing to Postgres & Uploading..." : "Push to Persistent Inventory"}',
    '{loading ? "Saving..." : (isEditing ? "Save Changes" : "Push to Persistent Inventory")}'
)

content = content.replace(
    '<button\n            type="submit"',
    '{isEditing && (\n            <button\n              type="button"\n              onClick={onCancel}\n              disabled={loading}\n              className="w-full mb-3 bg-white/10 hover:bg-white/20 text-[#0E5A75] dark:text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"\n            >\n              Cancel\n            </button>\n          )}\n          <button\n            type="submit"'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched RoomForm")

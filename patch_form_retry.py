# -*- coding: utf-8 -*-
import os
import re

filepath = 'apps/main-site/src/components/RoomForm.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add createdRoomId state
if 'const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);' not in content:
    content = content.replace(
        'const [deletingImage, setDeletingImage] = useState<string | null>(null);',
        'const [deletingImage, setDeletingImage] = useState<string | null>(null);\n  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);\n  const effectiveRoomId = initialData?.id || createdRoomId;'
    )

    # Change isEditing definition
    content = content.replace(
        'const isEditing = !!initialData;',
        'const isEditing = !!initialData || !!createdRoomId;'
    )

    # Change handleDeleteImage to use effectiveRoomId
    content = content.replace(
        'if (!initialData?.id || !confirm("Are you sure you want to delete this photo?")) return;',
        'if (!effectiveRoomId || !confirm("Are you sure you want to delete this photo?")) return;'
    )
    content = content.replace('initialData.id', 'effectiveRoomId')

    # Update handleSubmit
    old_submit = """      const method = isEditing ? "PATCH" : "POST";
      const payload: Record<string, unknown> = { slug, name: formData.name, price: Number(formData.price), roomCount: Number(formData.roomCount), capacity: formData.capacity, view: formData.view };
      if (isEditing) payload.id = initialData.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || (isEditing ? "Failed to update room." : "Failed to add room."));
        setLoading(false);
        return;
      }

      const createdRoom = isEditing ? initialData : result.data;

      // 2. Upload Images if any
      if (selectedFiles.length > 0 && createdRoom?.id) {"""

    new_submit = """      const method = isEditing ? "PATCH" : "POST";
      const payload: Record<string, unknown> = { slug, name: formData.name, price: Number(formData.price), roomCount: Number(formData.roomCount), capacity: formData.capacity, view: formData.view };
      if (effectiveRoomId) payload.id = effectiveRoomId;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || (isEditing ? "Failed to update room." : "Failed to add room."));
        setLoading(false);
        return;
      }

      const activeRoomId = effectiveRoomId || result.data?.id;
      if (!activeRoomId) {
        alert("Room was created, but no room ID was returned by the server.");
        setLoading(false);
        return;
      }

      if (!createdRoomId && !initialData?.id) {
        setCreatedRoomId(activeRoomId);
      }

      // 2. Upload Images if any
      if (selectedFiles.length > 0 && activeRoomId) {"""

    content = content.replace(old_submit, new_submit)

    # Change createdRoom.id to activeRoomId
    content = content.replace('createdRoom.id', 'activeRoomId')

    # Keep selected files if upload fails
    # Wait, the current code clears selected files at the end:
    # setSelectedFiles([]);
    # We should only clear it if upload succeeds!
    old_success = """      }

      setFormData({ name: "", price: "", roomCount: "1", capacity: "2 Guests", view: "Mountain View" });
      setSelectedFiles([]);
      if (onSuccess) onSuccess(); else router.refresh();"""

    new_success = """        const imageResult = await imageRes.json();
        if (!imageRes.ok) {
          alert((isEditing ? "Room updated, but image upload failed: " : "Room created, but image upload failed: ") + (imageResult.error?.message || imageResult.message || "Unknown error"));
          setLoading(false);
          return; // DO NOT reset form if upload fails
        }
      }

      setFormData({ name: "", price: "", roomCount: "1", capacity: "2 Guests", view: "Mountain View" });
      setSelectedFiles([]);
      setCreatedRoomId(null);
      if (onSuccess) onSuccess(); else router.refresh();"""

    # We need to replace the exact block.
    # Let's use regex.
    content = re.sub(
        r'        const imageResult = await imageRes\.json\(\);\n\s*if \(\!imageRes\.ok\) \{\n\s*alert\(\(isEditing \? "Room updated, but image upload failed: " : "Room created, but image upload failed: "\) \+ \(imageResult\.error\?\.message \|\| imageResult\.message \|\| "Unknown error"\)\);\n\s*\}\n\s*\}\n\n\s*setFormData\(\{ name: "", price: "", roomCount: "1", capacity: "2 Guests", view: "Mountain View" \}\);\n\s*setSelectedFiles\(\[\]\);\n\s*if \(onSuccess\) onSuccess\(\); else router\.refresh\(\);',
        new_success,
        content
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched RoomForm retry logic")

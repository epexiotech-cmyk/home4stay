# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/components/RoomForm.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_content = """  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData || !!createdRoomId;
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price?.toString() || "",
    roomCount: initialData?.roomCount?.toString() || "1",
    capacity: initialData?.capacity || "2 Guests",
    view: initialData?.view || "Mountain View"
  });
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const effectiveRoomId = initialData?.id || createdRoomId;"""

new_content = """  const [loading, setLoading] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const isEditing = !!initialData || !!createdRoomId;
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price?.toString() || "",
    roomCount: initialData?.roomCount?.toString() || "1",
    capacity: initialData?.capacity || "2 Guests",
    view: initialData?.view || "Mountain View"
  });
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const effectiveRoomId = initialData?.id || createdRoomId;"""

content = content.replace(old_content, new_content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched RoomForm block scope")

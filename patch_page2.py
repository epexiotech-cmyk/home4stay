# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/app/(portal)/partner/rooms/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import RoomImageManager' not in content:
    content = content.replace('import RoomForm from "@/components/RoomForm";', 'import RoomForm from "@/components/RoomForm";\nimport RoomImageManager from "@/components/RoomImageManager";')

# We need to insert the managingPhotosFor UI into the card right before the buttons.
# Currently, the card ends like this:
'''                  <div className="flex items-center gap-2 pt-4 border-t border-black/5 dark:border-white/5">
                    <button 
                      disabled={actionLoadingId === room.id}'''

image_ui = """
                  {managingPhotosFor === room.id && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <RoomImageManager roomId={room.id} />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-black/5 dark:border-white/5">
                    <button 
                      disabled={actionLoadingId === room.id}"""

content = content.replace('''                  <div className="flex items-center gap-2 pt-4 border-t border-black/5 dark:border-white/5">
                    <button 
                      disabled={actionLoadingId === room.id}''', image_ui)

# Make sure there is a "Manage Photos" button.
# Earlier I added "Edit Suite" instead of "Manage Photos" in the previous step.
# Wait, let's just add the "Manage Photos" button back next to the Edit button.

if 'Manage Photos' not in content:
    edit_btn = """                    <button 
                      onClick={() => setEditingRoomId(editingRoomId === room.id ? null : room.id)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all bg-[#0983B0]/10 text-[#0983B0] hover:bg-[#0983B0] hover:text-white"
                    >
                      <Edit3 size={12} /> {editingRoomId === room.id ? 'Cancel Edit' : 'Edit Suite'}
                    </button>"""
    
    manage_btn = """                    <button 
                      onClick={() => setEditingRoomId(editingRoomId === room.id ? null : room.id)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all bg-[#0983B0]/10 text-[#0983B0] hover:bg-[#0983B0] hover:text-white"
                    >
                      <Edit3 size={12} /> {editingRoomId === room.id ? 'Cancel Edit' : 'Edit Suite'}
                    </button>
                    
                    <button 
                      onClick={() => setManagingPhotosFor(managingPhotosFor === room.id ? null : room.id)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all bg-[#159665]/10 text-[#159665] hover:bg-[#159665] hover:text-white"
                    >
                      <ImageIcon size={12} /> {managingPhotosFor === room.id ? 'Hide Photos' : 'Manage Photos'}
                    </button>"""
    
    content = content.replace(edit_btn, manage_btn)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched page.tsx")

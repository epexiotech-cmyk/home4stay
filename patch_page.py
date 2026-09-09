import os

filepath = 'apps/main-site/src/app/(portal)/partner/rooms/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add editingRoomId state
content = content.replace(
    'const [managingPhotosFor, setManagingPhotosFor] = useState<string | null>(null);',
    'const [managingPhotosFor, setManagingPhotosFor] = useState<string | null>(null);\n  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);'
)

# Render RoomForm in Edit mode under the card
old_card_end = """
                    <button 
                      onClick={() => setManagingPhotosFor(managingPhotosFor === room.id ? null : room.id)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all bg-[#0983B0]/10 text-[#0983B0] hover:bg-[#0983B0] hover:text-white"
                    >
                      <ImageIcon size={12} /> {managingPhotosFor === room.id ? 'Hide Photos' : 'Manage Photos'}
                    </button>
                  </div>
                </div>
              ))}
"""
new_card_end = """
                    <button 
                      onClick={() => setEditingRoomId(editingRoomId === room.id ? null : room.id)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all bg-[#0983B0]/10 text-[#0983B0] hover:bg-[#0983B0] hover:text-white"
                    >
                      <Edit3 size={12} /> {editingRoomId === room.id ? 'Cancel Edit' : 'Edit Suite'}
                    </button>
                  </div>
                  {editingRoomId === room.id && (
                    <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                      <RoomForm 
                        slug={propertySlug} 
                        initialData={room} 
                        onSuccess={() => { setEditingRoomId(null); fetchRooms(); }} 
                        onCancel={() => setEditingRoomId(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
"""

# Apply the replacement but first we need to remove the old managingPhotosFor logic inside the card
# which includes the whole {managingPhotosFor === room.id && ...} block

import re
content = re.sub(r'\{managingPhotosFor === room\.id && \(\s*<div className="mb-6 p-4 rounded-2xl bg-white/5.*?\n\s*\)\}\s*<div className="flex items-center gap-2 pt-4 border-t border-black/5 dark:border-white/5">', '<div className="flex items-center gap-2 pt-4 border-t border-black/5 dark:border-white/5">', content, flags=re.DOTALL)

content = content.replace(
    '''<button 
                      onClick={() => setManagingPhotosFor(managingPhotosFor === room.id ? null : room.id)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all bg-[#0983B0]/10 text-[#0983B0] hover:bg-[#0983B0] hover:text-white"
                    >
                      <ImageIcon size={12} /> {managingPhotosFor === room.id ? 'Hide Photos' : 'Manage Photos'}
                    </button>
                  </div>
                </div>
              ))}''', new_card_end.replace('<div className="flex items-center gap-2 pt-4 border-t border-black/5 dark:border-white/5">', '').strip())

# Clean up handleDeleteImage from page.tsx
content = re.sub(r'const handleDeleteImage = async \(roomId: string, imageUrl: string\) => \{.*?\};\n\n\s*const \{ user \} = useAuth\(\);', 'const { user } = useAuth();', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched PartnerRoomsPage for Edit Mode")

const fs = require('fs');
const file = 'apps/main-site/src/app/(portal)/partner/rooms/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('isActive: boolean;', 'isActive: boolean;\n  images: string[];');
content = content.replace('isActive: typeof r.isActive === \'boolean\' ? r.isActive : true', 'isActive: typeof r.isActive === \'boolean\' ? r.isActive : true,\n          images: Array.isArray(r.images) ? (r.images as string[]) : []');

content = content.replace('const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);', \const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [managingPhotosFor, setManagingPhotosFor] = useState<string | null>(null);

  const handleDeleteImage = async (roomId: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    
    setActionLoadingId(\\\delete-image-\\\\);
    try {
      const getRes = await fetch(\\\/api/property/room/\/images\\\);
      if (!getRes.ok) throw new Error("Failed to fetch image details");
      const { data: assets } = await getRes.json();
      
      const asset = assets?.find((a: any) => a.url === imageUrl);
      if (!asset) throw new Error("Image not found in database");
      
      const res = await fetch(\\\/api/property/room/\/images/\\\\, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete image");
      
      await fetchRooms();
    } catch (err: any) {
      alert(err.message || "Failed to delete image");
    } finally {
      setActionLoadingId(null);
    }
  };\);

const imageUI = \
                  {managingPhotosFor === room.id && (
                    <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 animate-in fade-in">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60 mb-3 flex items-center gap-1.5"><ImageIcon size={12}/> MANAGE PHOTOS</h4>
                      {room.images.length === 0 ? (
                        <div className="text-center p-4 bg-black/5 dark:bg-white/5 rounded-xl text-[10px] text-[#0E5A75]/60 dark:text-white/60">
                          No photos
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {room.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                              <img src={img} alt="Room" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  onClick={() => handleDeleteImage(room.id, img)}
                                  disabled={actionLoadingId === \\\delete-image-\\\\}
                                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                  {actionLoadingId === \\\delete-image-\\\\ ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-black/5 dark:border-white/5">\;

content = content.replace('<div className="flex items-center gap-2 pt-4 border-t border-black/5 dark:border-white/5">', imageUI);

const manageBtn = \
                    <button 
                      onClick={() => setManagingPhotosFor(managingPhotosFor === room.id ? null : room.id)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all bg-[#0983B0]/10 text-[#0983B0] hover:bg-[#0983B0] hover:text-white"
                    >
                      <ImageIcon size={12} /> {managingPhotosFor === room.id ? 'Hide Photos' : 'Manage Photos'}
                    </button>\;

content = content.replace('</button>\\n                  </div>', '</button>\\n' + manageBtn + '\\n                  </div>');

content = content.replace('Edit3 } from "lucide-react";', 'Edit3, Image as ImageIcon } from "lucide-react";');

fs.writeFileSync(file, content);
console.log('Patched');

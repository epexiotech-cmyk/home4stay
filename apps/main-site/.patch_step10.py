import re

# 1. contextResolver.ts
resolver_path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/contextResolver.ts'
with open(resolver_path, 'r') as f:
    content = f.read()
target_resolve = """export async function resolvePropertyContext(identifier: string): Promise<(ExtendedProperty & { name: string }) | null> {
  if (!identifier) return null;

  const baselineProperty = getProperty(identifier);

  let persistentDbRecord: Record<string, unknown> | null = null;
  try {
    persistentDbRecord = await getPropertyBySlug(identifier) as Record<string, unknown> | null;

    if (!persistentDbRecord) {
      persistentDbRecord = await prisma.property.findUnique({
        where: { id: identifier }, include: PROPERTY_INCLUDES,
      });
    }
  } catch (err) {
    console.warn("Live DB lookup adapter query mapping fault (falling back to mock):", err instanceof Error ? err.message : "Unknown error");
  }

  const adaptedDbRecord = persistentDbRecord ? mapPrismaPropertyToExtended(persistentDbRecord) : {};
  
  const merged = {
    ...(baselineProperty || {}),
    ...adaptedDbRecord,
    name: adaptedDbRecord.name || (baselineProperty as ExtendedProperty | null)?.name || "",
  } as ExtendedProperty;

  if (!merged.name) {
    return null;
  }

  return merged as ExtendedProperty & { name: string };
}"""
replace_resolve = """export async function resolvePropertyContext(identifier: string): Promise<(ExtendedProperty & { name: string }) | null> {
  if (!identifier) return null;

  let persistentDbRecord: Record<string, unknown> | null = null;
  try {
    persistentDbRecord = await getPropertyBySlug(identifier) as Record<string, unknown> | null;

    if (!persistentDbRecord) {
      persistentDbRecord = await prisma.property.findUnique({
        where: { id: identifier }, include: PROPERTY_INCLUDES,
      });
    }
  } catch (err) {
    console.warn("Live DB lookup adapter query mapping fault:", err instanceof Error ? err.message : "Unknown error");
  }

  if (!persistentDbRecord || !persistentDbRecord.title) {
    return null;
  }

  const adaptedDbRecord = mapPrismaPropertyToExtended(persistentDbRecord);
  
  return adaptedDbRecord as ExtendedProperty & { name: string };
}"""
content = content.replace(target_resolve, replace_resolve)
# Remove unused getProperty import
content = content.replace('import { getProperty } from "@/properties-data";\n', '')
with open(resolver_path, 'w') as f:
    f.write(content)

# 2. BookingContext.tsx
booking_path = '/home/apurv_patel/home4stay/apps/main-site/src/context/BookingContext.tsx'
with open(booking_path, 'r') as f:
    content = f.read()
# Add selectedRoomName to BookingState
content = content.replace('selectedRoomId: string | null;', 'selectedRoomId: string | null;\n  selectedRoomName: string | null;')
# Add setRoom signature
content = content.replace('setRoom: (id: string, price: number) => void;', 'setRoom: (id: string, name: string, price: number) => void;')
# Add to initial state
content = content.replace('selectedRoomId: null,', 'selectedRoomId: null,\n    selectedRoomName: null,')
# Update setRoom implementation
target_setroom = """  const setRoom = useCallback((id: string, price: number) => {
    setState(prev => {
      const newPricing = { ...prev.pricing, base: price };
      const pricing = calculateTotal({ ...prev, pricing: newPricing });
      return { ...prev, selectedRoomId: id, pricing };
    });
  }, [calculateTotal]);"""
replace_setroom = """  const setRoom = useCallback((id: string, name: string, price: number) => {
    setState(prev => {
      const newPricing = { ...prev.pricing, base: price };
      const pricing = calculateTotal({ ...prev, pricing: newPricing });
      return { ...prev, selectedRoomId: id, selectedRoomName: name, pricing };
    });
  }, [calculateTotal]);"""
content = content.replace(target_setroom, replace_setroom)
with open(booking_path, 'w') as f:
    f.write(content)

# 3. RoomSelection.tsx
room_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/RoomSelection.tsx'
with open(room_path, 'r') as f:
    content = f.read()
content = content.replace('onClick={() => setRoom(room.id, room.price)}', 'onClick={() => setRoom(room.id, room.name, room.price)}')
with open(room_path, 'w') as f:
    f.write(content)

# 4. FloatingBookingBar.tsx
bar_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/booking/FloatingBookingBar.tsx'
with open(bar_path, 'r') as f:
    content = f.read()
content = content.replace('const { selectedRoomId, selectedExperiences, pricing, guestCount } = state;', 'const { selectedRoomId, selectedRoomName, selectedExperiences, pricing, guestCount } = state;')
target_h4 = """                      <h4 className="text-sm font-black text-[#053344] dark:text-white truncate max-w-[200px]">
                        {selectedRoomId === "RT-001" ? "Royal Heritage Suite" : "Premium Garden Room"}
                      </h4>"""
replace_h4 = """                      <h4 className="text-sm font-black text-[#053344] dark:text-white truncate max-w-[200px]">
                        {selectedRoomName || "Selected Room"}
                      </h4>"""
content = content.replace(target_h4, replace_h4)
with open(bar_path, 'w') as f:
    f.write(content)

print("Step 10 Patch applied successfully.")

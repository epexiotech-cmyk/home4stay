import { RoomGroup, Reservation } from "./types";
import { addDays, subDays, startOfDay, setHours } from "date-fns";

export const ROOM_GROUPS: RoomGroup[] = [
  {
    name: "Deluxe Rooms",
    rooms: [
      { id: "101", name: "Room 101", type: "Deluxe", status: "clean" },
      { id: "102", name: "Room 102", type: "Deluxe", status: "housekeeping" },
      { id: "103", name: "Room 103", type: "Deluxe", status: "clean" },
    ]
  },
  {
    name: "Royal Suites",
    rooms: [
      { id: "201", name: "Suite 201", type: "Suite", status: "dirty" },
      { id: "202", name: "Suite 202", type: "Suite", status: "clean" },
    ]
  },
  {
    name: "Luxury Villas",
    rooms: [
      { id: "V1", name: "Villa 1", type: "Villa", status: "maintenance" },
      { id: "V2", name: "Villa 2", type: "Villa", status: "clean" },
    ]
  }
];

const today = startOfDay(new Date());

export const RESERVATIONS: Reservation[] = [
  {
    id: "B-1001",
    guestName: "Ananya Sharma",
    roomId: "101",
    startDate: setHours(today, 10),
    endDate: addDays(setHours(today, 14), 3),
    status: "checked_in",
    kycStatus: "VERIFIED",
    source: "Home4Stay",
    mealPlan: "MAP",
    paymentStatus: "paid",
    occupancy: { adults: 2, children: 1 },
    amount: 45200
  },
  {
    id: "B-1002",
    guestName: "Rohan Malhotra",
    roomId: "201",
    startDate: addDays(setHours(today, 12), 2),
    endDate: addDays(setHours(today, 10), 6),
    status: "confirmed",
    kycStatus: "PENDING",
    source: "Direct",
    mealPlan: "CP",
    paymentStatus: "pending",
    occupancy: { adults: 2, children: 0 },
    amount: 68000
  },
  {
    id: "B-1003",
    guestName: "Priya Das",
    roomId: "V1",
    startDate: subDays(setHours(today, 8), 1),
    endDate: addDays(setHours(today, 18), 7),
    status: "maintenance",
    kycStatus: "VERIFIED",
    source: "System",
    mealPlan: "EP",
    paymentStatus: "paid",
    occupancy: { adults: 0, children: 0 },
    amount: 0
  },
  {
    id: "B-1004",
    guestName: "Sahil Khan",
    roomId: "102",
    startDate: addDays(setHours(today, 15), 4),
    endDate: addDays(setHours(today, 11), 6),
    status: "pending_kyc",
    kycStatus: "FAILED",
    source: "WhatsApp",
    mealPlan: "AP",
    paymentStatus: "partial",
    occupancy: { adults: 3, children: 0 },
    amount: 28500
  }
];

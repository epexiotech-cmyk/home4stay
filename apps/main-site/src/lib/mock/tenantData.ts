import { addDays, subDays, startOfDay, setHours } from "date-fns";
import { RoomGroup, Reservation, PaymentStatus } from "@/components/calendar/types";

export interface Transaction {
  id: string;
  bookingId: string;
  guestName: string;
  amount: number;
  gst: number;
  method: string;
  status: PaymentStatus | "failed";
  date: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  guestName: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: string;
}

export interface DashboardStats {
  revenueMtd: number;
  revenueTrend: number;
  avgDaily: number;
  targetPercent: number;
  occupancy: number;
  todayOps: Array<{ time: string; task: string; status: "completed" | "pending" | "upcoming" }>;
  approvals: number;
  totalRevenue: number;
  pendingPayments: number;
  gstCollected: number;
  avgBookingValue: number;
}

export interface PropertyExperience {
  id: string;
  propertyId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  isComplimentary: boolean;
  isFeatured: boolean;
  coverImage: string;
  icon?: string;
  duration?: string;
  maxGuests?: number;
  requiresScheduling: boolean;
  availabilityType: "always" | "scheduled" | "on_request";
  isActive: boolean;
  sortOrder: number;
}

export interface PropertyReview {
  id: string;
  propertyId: string;
  guestName: string;
  guestAvatar?: string;
  rating: number;
  title: string;
  message: string;
  stayType: "Romantic" | "Family" | "Solo" | "Business" | "Friends";
  roomType: string;
  createdAt: string;
  isVerified: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  responseMessage?: string;
  responseAt?: string;
}

export interface PropertyOffer {
  id: string;
  propertyId: string;
  title: string;
  slug: string;
  description: string;
  bannerImage?: string;
  offerType: "discount" | "package" | "seasonal" | "early_bird";
  discountType: "percentage" | "flat";
  discountValue: number;
  couponCode: string;
  minimumBookingAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isFeatured: boolean;
  applicableRooms: string[]; // empty for all
  applicableExperiences: string[]; // empty for none
  createdAt: string;
  updatedAt: string;
}

const today = startOfDay(new Date());

export const TENANT_MOCK_DATA: Record<string, {
  rooms: RoomGroup[];
  reservations: Reservation[];
  transactions: Transaction[];
  invoices: Invoice[];
  stats: DashboardStats;
  experiences: PropertyExperience[];
  reviews: PropertyReview[];
  offers: PropertyOffer[];
}> = {
  "shivay-resort-101": {
    rooms: [
      {
        name: "Mountain View Rooms",
        rooms: [
          { id: "M101", name: "Peak View 101", type: "Mountain", status: "clean" },
          { id: "M102", name: "Peak View 102", type: "Mountain", status: "housekeeping" },
          { id: "M103", name: "Peak View 103", type: "Mountain", status: "clean" },
        ]
      },
      {
        name: "Valley Suites",
        rooms: [
          { id: "V201", name: "Valley Suite 201", type: "Suite", status: "dirty" },
          { id: "V202", name: "Valley Suite 202", type: "Suite", status: "clean" },
        ]
      }
    ],
    reservations: [
      {
        id: "SHV-1001",
        guestName: "Arjun Trekker",
        roomId: "M101",
        startDate: setHours(today, 10),
        endDate: addDays(setHours(today, 14), 3),
        status: "checked_in",
        kycStatus: "VERIFIED",
        source: "Home4Stay",
        mealPlan: "MAP",
        paymentStatus: "paid",
        occupancy: { adults: 2, children: 1 },
        amount: 25200
      },
      {
        id: "SHV-1002",
        guestName: "Priya Hills",
        roomId: "V201",
        startDate: addDays(setHours(today, 12), 2),
        endDate: addDays(setHours(today, 10), 5),
        status: "confirmed",
        kycStatus: "PENDING",
        source: "Direct",
        mealPlan: "CP",
        paymentStatus: "pending",
        occupancy: { adults: 2, children: 0 },
        amount: 38000
      }
    ],
    transactions: [
      { id: "TXN-S1", bookingId: "SHV-1001", guestName: "Arjun Trekker", amount: 25200, gst: 3024, method: "UPI", status: "paid", date: "Today, 10:24 AM" },
    ],
    invoices: [
      { id: "INV-SHV-001", bookingId: "SHV-1001", guestName: "Arjun Trekker", amount: 25200, status: "paid", dueDate: "May 08, 2026" },
      { id: "INV-SHV-002", bookingId: "SHV-1002", guestName: "Priya Hills", amount: 38000, status: "sent", dueDate: "May 12, 2026" },
    ],
    stats: {
      revenueMtd: 145200,
      revenueTrend: 8.4,
      avgDaily: 4170,
      targetPercent: 78,
      occupancy: 82,
      todayOps: [
        { time: "09:00 AM", task: "Checkout - M102", status: "completed" },
        { time: "11:30 AM", task: "New Arrival - M101", status: "pending" },
      ],
      approvals: 2,
      totalRevenue: 642500,
      pendingPayments: 38000,
      gstCollected: 78540,
      avgBookingValue: 12450
    },
    experiences: [
      {
        id: "exp-shv-1",
        propertyId: "shivay-resort-101",
        title: "Pahaadi Trails Trek",
        slug: "pahaadi-trails",
        description: "A guided morning trek through the pine forests of Manali with a local mountaineer.",
        category: "Adventure",
        price: 1500,
        isComplimentary: false,
        isFeatured: true,
        coverImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800",
        icon: "Mountain",
        duration: "4 Hours",
        maxGuests: 8,
        requiresScheduling: true,
        availabilityType: "scheduled",
        isActive: true,
        sortOrder: 1
      },
      {
        id: "exp-shv-2",
        propertyId: "shivay-resort-101",
        title: "Sunrise Tea Experience",
        slug: "sunrise-tea",
        description: "Premium Himalayan tea tasting session on the peak view deck at 6:00 AM.",
        category: "Wellness",
        price: 0,
        isComplimentary: true,
        isFeatured: true,
        coverImage: "https://images.unsplash.com/photo-1544787210-2211d247156a?q=80&w=800",
        icon: "Coffee",
        duration: "1 Hour",
        requiresScheduling: false,
        availabilityType: "always",
        isActive: true,
        sortOrder: 2
      }
    ],
    reviews: [
      {
        id: "rev-shv-1",
        propertyId: "shivay-resort-101",
        guestName: "Arjun Trekker",
        rating: 5,
        title: "Absolute Mountain Bliss",
        message: "The Pahaadi Trails trek was life-changing. Waking up to the sunrise tea on the deck is something I will never forget. Impeccable hospitality by Rahul.",
        stayType: "Solo",
        roomType: "Mountain View Room",
        createdAt: "2026-05-10T10:00:00Z",
        isVerified: true,
        isPublished: true,
        isFeatured: true,
        responseMessage: "Thank you Arjun! It was a pleasure hosting you. Glad you enjoyed the trek!",
        responseAt: "2026-05-11T09:00:00Z"
      },
      {
        id: "rev-shv-2",
        propertyId: "shivay-resort-101",
        guestName: "Priya Hills",
        rating: 4,
        title: "Peaceful Escape",
        message: "Quiet, serene and beautiful. The valley view from the suite is breathtaking. Food was authentic and delicious.",
        stayType: "Family",
        roomType: "Valley Suite",
        createdAt: "2026-05-08T15:30:00Z",
        isVerified: true,
        isPublished: true,
        isFeatured: false
      }
    ],
    offers: [
      {
        id: "off-shv-1",
        propertyId: "shivay-resort-101",
        title: "Mountain Wellness Package",
        slug: "mountain-wellness",
        description: "Get 15% OFF on 3+ nights stay and a complimentary sunrise tea experience.",
        offerType: "package",
        discountType: "percentage",
        discountValue: 15,
        couponCode: "SHV15",
        minimumBookingAmount: 15000,
        startDate: "2026-05-01T00:00:00Z",
        endDate: "2026-06-30T23:59:59Z",
        isActive: true,
        isFeatured: true,
        applicableRooms: [],
        applicableExperiences: ["exp-shv-2"],
        createdAt: "2026-05-01T10:00:00Z",
        updatedAt: "2026-05-01T10:00:00Z"
      }
    ]
  },
  "royal-villa-102": {
    rooms: [
      {
        name: "Luxury Suites",
        rooms: [
          { id: "L101", name: "Diamond Suite 1", type: "Suite", status: "clean" },
          { id: "L102", name: "Diamond Suite 2", type: "Suite", status: "clean" },
        ]
      },
      {
        name: "Pool Villas",
        rooms: [
          { id: "PV1", name: "Private Pool Villa 1", type: "Villa", status: "maintenance" },
          { id: "PV2", name: "Private Pool Villa 2", type: "Villa", status: "clean" },
        ]
      }
    ],
    reservations: [
      {
        id: "RYL-1001",
        guestName: "Karan Johar",
        roomId: "PV1",
        startDate: setHours(today, 10),
        endDate: addDays(setHours(today, 14), 4),
        status: "maintenance",
        kycStatus: "VERIFIED",
        source: "Direct",
        mealPlan: "AP",
        paymentStatus: "paid",
        occupancy: { adults: 2, children: 0 },
        amount: 85000
      },
      {
        id: "RYL-1002",
        guestName: "Neha Sharma",
        roomId: "L101",
        startDate: addDays(setHours(today, 15), 1),
        endDate: addDays(setHours(today, 11), 3),
        status: "confirmed",
        kycStatus: "VERIFIED",
        source: "WhatsApp",
        mealPlan: "CP",
        paymentStatus: "partial",
        occupancy: { adults: 2, children: 0 },
        amount: 45000
      }
    ],
    transactions: [
      { id: "TXN-R1", bookingId: "RYL-1001", guestName: "Karan Johar", amount: 85000, gst: 15300, method: "Credit Card", status: "paid", date: "Yesterday, 11:20 AM" },
      { id: "TXN-R2", bookingId: "RYL-1002", guestName: "Neha Sharma", amount: 22500, gst: 4050, method: "Net Banking", status: "partial", date: "Today, 09:10 AM" },
    ],
    invoices: [
      { id: "INV-RYL-001", bookingId: "RYL-1001", guestName: "Karan Johar", amount: 85000, status: "paid", dueDate: "May 08, 2026" },
      { id: "INV-RYL-002", bookingId: "RYL-1002", guestName: "Neha Sharma", amount: 45000, status: "sent", dueDate: "May 10, 2026" },
    ],
    stats: {
      revenueMtd: 345200,
      revenueTrend: 15.2,
      avgDaily: 11170,
      targetPercent: 92,
      occupancy: 94,
      todayOps: [
        { time: "02:00 PM", task: "Maintenance Check - PV1", status: "upcoming" },
      ],
      approvals: 5,
      totalRevenue: 1242500,
      pendingPayments: 22500,
      gstCollected: 148540,
      avgBookingValue: 28450
    },
    experiences: [
      {
        id: "exp-ryl-1",
        propertyId: "royal-villa-102",
        title: "Royal Arrival Ritual",
        slug: "royal-arrival",
        description: "Traditional welcome ceremony with flower garlands, tikka, and a cooling kokum sorbet.",
        category: "Heritage",
        price: 0,
        isComplimentary: true,
        isFeatured: true,
        coverImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
        icon: "Sparkles",
        duration: "30 Mins",
        requiresScheduling: false,
        availabilityType: "always",
        isActive: true,
        sortOrder: 1
      },
      {
        id: "exp-ryl-2",
        propertyId: "royal-villa-102",
        title: "Mehfil Under The Stars",
        slug: "mehfil-stars",
        description: "A private evening of Gazals and Sufi music in the garden with a 7-course royal dinner.",
        category: "Dining",
        price: 12500,
        isComplimentary: false,
        isFeatured: true,
        coverImage: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=800",
        icon: "Music",
        duration: "3 Hours",
        maxGuests: 4,
        requiresScheduling: true,
        availabilityType: "on_request",
        isActive: true,
        sortOrder: 2
      }
    ],
    reviews: [
      {
        id: "rev-ryl-1",
        propertyId: "royal-villa-102",
        guestName: "Karan Johar",
        rating: 5,
        title: "Luxury Beyond Words",
        message: "The private pool villa experience was unmatched. The Mehfil night was the highlight of our stay. Royal treatment from start to finish.",
        stayType: "Friends",
        roomType: "Private Pool Villa",
        createdAt: "2026-05-12T11:00:00Z",
        isVerified: true,
        isPublished: true,
        isFeatured: true,
        responseMessage: "We are honored to have hosted you, Karan. Looking forward to your next visit!",
        responseAt: "2026-05-13T10:00:00Z"
      },
      {
        id: "rev-ryl-2",
        propertyId: "royal-villa-102",
        guestName: "Neha Sharma",
        rating: 5,
        title: "Perfect Anniversary Stay",
        message: "Every detail was curated to perfection. The kokum sorbet welcome was so refreshing!",
        stayType: "Romantic",
        roomType: "Diamond Suite",
        createdAt: "2026-05-11T14:20:00Z",
        isVerified: true,
        isPublished: true,
        isFeatured: true
      }
    ],
    offers: [
      {
        id: "off-ryl-1",
        propertyId: "royal-villa-102",
        title: "Anniversary Luxury Special",
        slug: "anniversary-special",
        description: "Flat ₹5000 OFF on Pool Villas for couples celebrating their milestone.",
        offerType: "discount",
        discountType: "flat",
        discountValue: 5000,
        couponCode: "ROYAL5K",
        minimumBookingAmount: 40000,
        startDate: "2026-05-10T00:00:00Z",
        endDate: "2026-12-31T23:59:59Z",
        isActive: true,
        isFeatured: true,
        applicableRooms: ["PV1", "PV2"],
        applicableExperiences: [],
        createdAt: "2026-05-10T11:00:00Z",
        updatedAt: "2026-05-10T11:00:00Z"
      }
    ]
  },
  "taj-villa-103": {
    rooms: [
      {
        name: "Heritage Rooms",
        rooms: [
          { id: "H1", name: "Mughal Heritage 1", type: "Heritage", status: "clean" },
          { id: "H2", name: "Mughal Heritage 2", type: "Heritage", status: "clean" },
        ]
      },
      {
        name: "Monument View",
        rooms: [
          { id: "MV1", name: "Taj View Suite", type: "Suite", status: "dirty" },
        ]
      }
    ],
    reservations: [
      {
        id: "TAJ-1001",
        guestName: "Sam Smith",
        roomId: "MV1",
        startDate: subDays(setHours(today, 10), 1),
        endDate: addDays(setHours(today, 14), 2),
        status: "checked_in",
        kycStatus: "VERIFIED",
        source: "Home4Stay",
        mealPlan: "CP",
        paymentStatus: "paid",
        occupancy: { adults: 2, children: 0 },
        amount: 35000
      }
    ],
    transactions: [
      { id: "TXN-T1", bookingId: "TAJ-1001", guestName: "Sam Smith", amount: 35000, gst: 6300, method: "Credit Card", status: "paid", date: "2 Days Ago" },
    ],
    invoices: [
      { id: "INV-TAJ-001", bookingId: "TAJ-1001", guestName: "Sam Smith", amount: 35000, status: "paid", dueDate: "May 06, 2026" },
    ],
    stats: {
      revenueMtd: 115200,
      revenueTrend: 2.1,
      avgDaily: 3500,
      targetPercent: 65,
      occupancy: 68,
      todayOps: [
        { time: "11:30 AM", task: "Guided Tour - MV1", status: "upcoming" },
      ],
      approvals: 0,
      totalRevenue: 442500,
      pendingPayments: 0,
      gstCollected: 58540,
      avgBookingValue: 15450
    },
    experiences: [
      {
        id: "exp-taj-1",
        propertyId: "taj-villa-103",
        title: "Heritage Food Walk",
        slug: "heritage-walk",
        description: "Explore the hidden culinary gems of old Agra with our resident historian.",
        category: "Culinary",
        price: 3500,
        isComplimentary: false,
        isFeatured: true,
        coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
        icon: "Utensils",
        duration: "2 Hours",
        maxGuests: 6,
        requiresScheduling: true,
        availabilityType: "scheduled",
        isActive: true,
        sortOrder: 1
      }
    ],
    reviews: [
      {
        id: "rev-taj-1",
        propertyId: "taj-villa-103",
        guestName: "Sam Smith",
        rating: 5,
        title: "Waking up to the Taj",
        message: "Nothing compares to the view of the Taj Mahal from our bed. The heritage walk gave us such a deep insight into Agra's history.",
        stayType: "Romantic",
        roomType: "Taj View Suite",
        createdAt: "2026-05-09T09:00:00Z",
        isVerified: true,
        isPublished: true,
        isFeatured: true,
        responseMessage: "Thank you Sam! We are glad you enjoyed the view and the walk.",
        responseAt: "2026-05-10T08:00:00Z"
      }
    ],
    offers: [
      {
        id: "off-taj-1",
        propertyId: "taj-villa-103",
        title: "Heritage Explorer Offer",
        slug: "heritage-explorer",
        description: "10% OFF on Heritage Rooms plus a complimentary Food Walk.",
        offerType: "package",
        discountType: "percentage",
        discountValue: 10,
        couponCode: "TAJ10",
        minimumBookingAmount: 20000,
        startDate: "2026-05-05T00:00:00Z",
        endDate: "2026-07-31T23:59:59Z",
        isActive: true,
        isFeatured: true,
        applicableRooms: ["H1", "H2"],
        applicableExperiences: ["exp-taj-1"],
        createdAt: "2026-05-05T09:00:00Z",
        updatedAt: "2026-05-05T09:00:00Z"
      }
    ]
  },
  "ocean-view-104": {
    rooms: [
      {
        name: "Sea Facing Rooms",
        rooms: [
          { id: "O101", name: "Ocean View 101", type: "Ocean", status: "clean" },
          { id: "O102", name: "Ocean View 102", type: "Ocean", status: "housekeeping" },
        ]
      },
      {
        name: "Beach Shacks",
        rooms: [
          { id: "B1", name: "Private Shack 1", type: "Shack", status: "clean" },
          { id: "B2", name: "Private Shack 2", type: "Shack", status: "clean" },
        ]
      }
    ],
    reservations: [
      {
        id: "OCN-1001",
        guestName: "Liam Johnson",
        roomId: "B1",
        startDate: setHours(today, 12),
        endDate: addDays(setHours(today, 10), 7),
        status: "checked_in",
        kycStatus: "VERIFIED",
        source: "Walk-in",
        mealPlan: "EP",
        paymentStatus: "paid",
        occupancy: { adults: 2, children: 0 },
        amount: 55000
      }
    ],
    transactions: [
      { id: "TXN-O1", bookingId: "OCN-1001", guestName: "Liam Johnson", amount: 55000, gst: 9900, method: "Cash", status: "paid", date: "Today" },
    ],
    invoices: [
      { id: "INV-OCN-001", bookingId: "OCN-1001", guestName: "Liam Johnson", amount: 55000, status: "paid", dueDate: "May 15, 2026" },
    ],
    stats: {
      revenueMtd: 245200,
      revenueTrend: 18.5,
      avgDaily: 8170,
      targetPercent: 88,
      occupancy: 85,
      todayOps: [
        { time: "05:00 PM", task: "Beach Dinner Prep - B1", status: "upcoming" },
      ],
      approvals: 3,
      totalRevenue: 842500,
      pendingPayments: 15000,
      gstCollected: 98540,
      avgBookingValue: 18450
    },
    experiences: [
      {
        id: "exp-ocn-1",
        propertyId: "ocean-view-104",
        title: "Beachside Candlelight Dinner",
        slug: "beach-dinner",
        description: "A romantic private dinner on the Varkala cliff-side with fresh seafood and sea breeze.",
        category: "Dining",
        price: 8500,
        isComplimentary: false,
        isFeatured: true,
        coverImage: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800",
        icon: "Utensils",
        duration: "2 Hours",
        maxGuests: 2,
        requiresScheduling: true,
        availabilityType: "on_request",
        isActive: true,
        sortOrder: 1
      }
    ],
    reviews: [
      {
        id: "rev-ocn-1",
        propertyId: "ocean-view-104",
        guestName: "Liam Johnson",
        rating: 5,
        title: "Sunset Paradise",
        message: "The cliff-side dinner was magical. Varkala is beautiful and this resort is the best way to experience it. High-speed wifi was great for my workation too.",
        stayType: "Business",
        roomType: "Private Shack",
        createdAt: "2026-05-14T18:00:00Z",
        isVerified: true,
        isPublished: true,
        isFeatured: true,
        responseMessage: "Great to hear Liam! Hope you got some good work done with that view.",
        responseAt: "2026-05-15T11:00:00Z"
      }
    ],
    offers: [
      {
        id: "off-ocn-1",
        propertyId: "ocean-view-104",
        title: "Summer Sunset Escape",
        slug: "sunset-escape",
        description: "Exclusive 20% OFF for stays longer than 3 nights.",
        offerType: "seasonal",
        discountType: "percentage",
        discountValue: 20,
        couponCode: "SUNSET20",
        minimumBookingAmount: 10000,
        startDate: "2026-05-15T00:00:00Z",
        endDate: "2026-08-31T23:59:59Z",
        isActive: true,
        isFeatured: true,
        applicableRooms: [],
        applicableExperiences: [],
        createdAt: "2026-05-15T12:00:00Z",
        updatedAt: "2026-05-15T12:00:00Z"
      }
    ]
  }
};

export function getTenantData(propertyId: string) {
  return TENANT_MOCK_DATA[propertyId] || TENANT_MOCK_DATA["shivay-resort-101"];
}

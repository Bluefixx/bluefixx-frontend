export interface Category {
  id: string;
  name: string;
  count: number;
  icon: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  startingPrice: number;
}

export interface Artisan {
  id: string;
  name: string;
  trade: string;
  rating: number;
  reviewCount: number;
  distance: string;
  experienceYears: number;
  avatarUrl: string;
  isVerified: boolean;
  startingPrice: number;
  availability: "Available today" | "Available now" | "Busy";
}

export const CATEGORIES: Category[] = [
  { id: "all", name: "All categories", count: 29, icon: "grid" },
  { id: "home-construction", name: "Home & Construction", count: 8, icon: "hammer" },
  { id: "repairs-technical", name: "Repairs & Technical", count: 6, icon: "wrench" },
  { id: "automotive", name: "Automotive", count: 5, icon: "car" },
  { id: "fashion-beauty", name: "Fashion & Beauty", count: 5, icon: "scissors" },
  { id: "facility-property", name: "Facility & Property", count: 5, icon: "building" },
];

export const SERVICES: ServiceItem[] = [
  // Home & Construction
  {
    id: "plumbing",
    name: "Plumbing",
    categoryId: "home-construction",
    categoryName: "Home & Construction",
    description: "Pipe repair · Leak repair · Bathroom plumbing",
    startingPrice: 14000,
  },
  {
    id: "electrical",
    name: "Electrical",
    categoryId: "home-construction",
    categoryName: "Home & Construction",
    description: "Wiring & rewiring · Socket / switch repair · Lighting installation",
    startingPrice: 12000,
  },
  {
    id: "carpentry",
    name: "Carpentry",
    categoryId: "home-construction",
    categoryName: "Home & Construction",
    description: "Furniture repair · Wardrobe build · Door & frame",
    startingPrice: 20000,
  },
  {
    id: "painting",
    name: "Painting",
    categoryId: "home-construction",
    categoryName: "Home & Construction",
    description: "Interior painting · Exterior painting · Screeding",
    startingPrice: 25000,
  },
  {
    id: "tiling",
    name: "Tiling",
    categoryId: "home-construction",
    categoryName: "Home & Construction",
    description: "Floor tiling · Wall tiling · Tile repair",
    startingPrice: 30000,
  },
  {
    id: "bricklaying",
    name: "Bricklaying",
    categoryId: "home-construction",
    categoryName: "Home & Construction",
    description: "Block work · Plastering · Fence work",
    startingPrice: 35000,
  },
  {
    id: "welding",
    name: "Welding",
    categoryId: "home-construction",
    categoryName: "Home & Construction",
    description: "Gate fabrication · Burglary proof · Railing",
    startingPrice: 22000,
  },
  {
    id: "pop-ceiling",
    name: "POP / Ceiling",
    categoryId: "home-construction",
    categoryName: "Home & Construction",
    description: "POP installation · Ceiling repair · Cornice work",
    startingPrice: 40000,
  },

  // Repairs & Technical
  {
    id: "ac-hvac",
    name: "AC & HVAC",
    categoryId: "repairs-technical",
    categoryName: "Repairs & Technical",
    description: "AC servicing · AC installation · Gas refill",
    startingPrice: 18000,
  },
  {
    id: "solar-inverter",
    name: "Solar & Inverter",
    categoryId: "repairs-technical",
    categoryName: "Repairs & Technical",
    description: "Inverter installation · Battery replacement · Solar panel install",
    startingPrice: 45000,
  },
  {
    id: "generator-repair",
    name: "Generator Repair",
    categoryId: "repairs-technical",
    categoryName: "Repairs & Technical",
    description: "Will not start · Servicing · Alternator fault",
    startingPrice: 20000,
  },
  {
    id: "refrigerator-repair",
    name: "Refrigerator Repair",
    categoryId: "repairs-technical",
    categoryName: "Repairs & Technical",
    description: "Not cooling · Gas refill · Compressor fault",
    startingPrice: 15000,
  },
  {
    id: "appliance-repair",
    name: "Appliance Repair",
    categoryId: "repairs-technical",
    categoryName: "Repairs & Technical",
    description: "Washing machine · Microwave · Water dispenser",
    startingPrice: 12000,
  },
  {
    id: "phone-laptop-repair",
    name: "Phone / Laptop Repair",
    categoryId: "repairs-technical",
    categoryName: "Repairs & Technical",
    description: "Screen replacement · Battery replacement · Software issue",
    startingPrice: 10000,
  },

  // Automotive
  {
    id: "auto-mechanic",
    name: "Auto Mechanic",
    categoryId: "automotive",
    categoryName: "Automotive",
    description: "Engine diagnosis · Brake pads · Oil change",
    startingPrice: 15000,
  },
  {
    id: "auto-electrician",
    name: "Auto Electrician",
    categoryId: "automotive",
    categoryName: "Automotive",
    description: "Battery charging · Rewiring · Alternator fix",
    startingPrice: 12000,
  },
  {
    id: "panel-beater",
    name: "Panel Beater",
    categoryId: "automotive",
    categoryName: "Automotive",
    description: "Dent removal · Body work · Alignment",
    startingPrice: 25000,
  },
  {
    id: "vulcanizer",
    name: "Vulcanizer",
    categoryId: "automotive",
    categoryName: "Automotive",
    description: "Tyre gauge · Puncture repair · Wheel balancing",
    startingPrice: 5000,
  },
  {
    id: "car-wash",
    name: "Car Wash",
    categoryId: "automotive",
    categoryName: "Automotive",
    description: "Engine wash · Full interior detailing · Exterior shine",
    startingPrice: 8000,
  },

  // Fashion & Beauty
  {
    id: "tailor",
    name: "Tailor",
    categoryId: "fashion-beauty",
    categoryName: "Fashion & Beauty",
    description: "Native wear · Senator suit · Dress alterations",
    startingPrice: 12000,
  },
  {
    id: "barber",
    name: "Barber",
    categoryId: "fashion-beauty",
    categoryName: "Fashion & Beauty",
    description: "Haircut · Beard trim · Home service cut",
    startingPrice: 6000,
  },
  {
    id: "hair-stylist",
    name: "Hair Stylist",
    categoryId: "fashion-beauty",
    categoryName: "Fashion & Beauty",
    description: "Braids · Wig making · Hair treatment",
    startingPrice: 15000,
  },
  {
    id: "nail-technician",
    name: "Nail Technician",
    categoryId: "fashion-beauty",
    categoryName: "Fashion & Beauty",
    description: "Manicure · Pedicure · Acrylic nails",
    startingPrice: 8000,
  },
  {
    id: "shoemaker",
    name: "Shoemaker",
    categoryId: "fashion-beauty",
    categoryName: "Fashion & Beauty",
    description: "Sole replacement · Leather repair · Custom footwear",
    startingPrice: 10000,
  },

  // Facility & Property
  {
    id: "cleaning",
    name: "Cleaning",
    categoryId: "facility-property",
    categoryName: "Facility & Property",
    description: "Post-construction cleaning · Deep home clean · Office sanitization",
    startingPrice: 20000,
  },
  {
    id: "gardening",
    name: "Gardening",
    categoryId: "facility-property",
    categoryName: "Facility & Property",
    description: "Lawn mowing · Tree pruning · Landscape maintenance",
    startingPrice: 15000,
  },
  {
    id: "fumigation",
    name: "Fumigation",
    categoryId: "facility-property",
    categoryName: "Facility & Property",
    description: "Pest control · Termite treatment · Bedbug eradication",
    startingPrice: 25000,
  },
  {
    id: "housekeeping",
    name: "Housekeeping",
    categoryId: "facility-property",
    categoryName: "Facility & Property",
    description: "Laundry · General maintenance · Ironing services",
    startingPrice: 12000,
  },
  {
    id: "security",
    name: "Security",
    categoryId: "facility-property",
    categoryName: "Facility & Property",
    description: "CCTV installation · Guard services · Gate access control",
    startingPrice: 35000,
  },
];

export const TRUSTED_ARTISANS: Artisan[] = [
  {
    id: "art-john-okafor",
    name: "John Okafor",
    trade: "Electrician",
    rating: 4.8,
    reviewCount: 126,
    distance: "2.4 km away",
    experienceYears: 7,
    avatarUrl: "/images/workers.png",
    isVerified: true,
    startingPrice: 15000,
    availability: "Available today",
  },
  {
    id: "art-david-eze",
    name: "David Eze",
    trade: "Plumber",
    rating: 4.7,
    reviewCount: 89,
    distance: "3.9 km away",
    experienceYears: 5,
    avatarUrl: "/images/talents.png",
    isVerified: true,
    startingPrice: 12000,
    availability: "Available now",
  },
  {
    id: "art-chidi-nnamdi",
    name: "Chidi Nnamdi",
    trade: "AC & HVAC Specialist",
    rating: 4.9,
    reviewCount: 142,
    distance: "1.8 km away",
    experienceYears: 9,
    avatarUrl: "/images/workers.png",
    isVerified: true,
    startingPrice: 18000,
    availability: "Available today",
  },
];

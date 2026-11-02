export interface HotelImageData {
  id: number;
  name: string;
  location: string;
  price: number;
  propertyPhoto: string;
  guestPhotos: string[];
}

export const fallbackHotelPhoto =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80";

export const hotelImages: HotelImageData[] = [
  // --- HOTELS DATASET ---
  {
    id: 1,
    name: "Taj Hotel",
    location: "Mumbai",
    price: 8500,
    propertyPhoto: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 2,
    name: "The Taj Mahal Palace",
    location: "Mumbai",
    price: 18500,
    propertyPhoto: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 3,
    name: "Trident Nariman Point",
    location: "Mumbai",
    price: 11200,
    propertyPhoto: "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 4,
    name: "JW Marriott Mumbai Juhu",
    location: "Mumbai",
    price: 14000,
    propertyPhoto: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 5,
    name: "Ginger Mumbai Andheri",
    location: "Mumbai",
    price: 3499,
    propertyPhoto: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 6,
    name: "Novotel Mumbai Juhu Beach",
    location: "Mumbai",
    price: 9200,
    propertyPhoto: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 7,
    name: "The Leela Palace New Delhi",
    location: "Delhi",
    price: 19000,
    propertyPhoto: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 8,
    name: "ITC Maurya, A Luxury Collection Hotel",
    location: "Delhi",
    price: 15500,
    propertyPhoto: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 9,
    name: "JW Marriott Hotel New Delhi Aerocity",
    location: "Delhi",
    price: 12800,
    propertyPhoto: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 10,
    name: "Radisson Blu Plaza Delhi Airport",
    location: "Delhi",
    price: 7500,
    propertyPhoto: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 11,
    name: "Bloomrooms @ Janpath",
    location: "Delhi",
    price: 3800,
    propertyPhoto: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1678723045286-66ac4da034dd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1661517577165-12a586db6650?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 12,
    name: "Taj Exotica Resort & Spa",
    location: "Goa",
    price: 22000,
    propertyPhoto: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 13,
    name: "The Oberoi Udaivilas",
    location: "Udaipur",
    price: 38000,
    propertyPhoto: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 14,
    name: "Radisson Blu Udaipur Palace Resort",
    location: "Udaipur",
    price: 8900,
    propertyPhoto: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 15,
    name: "Taj Falaknuma Palace",
    location: "Hyderabad",
    price: 28000,
    propertyPhoto: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 16,
    name: "ITC Kohenur, A Luxury Collection Hotel",
    location: "Hyderabad",
    price: 12500,
    propertyPhoto: "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 17,
    name: "Park Hyatt Hyderabad",
    location: "Hyderabad",
    price: 10200,
    propertyPhoto: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 18,
    name: "The Oberoi Grand",
    location: "Kolkata",
    price: 11500,
    propertyPhoto: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 19,
    name: "ITC Sonar, A Luxury Collection Hotel",
    location: "Kolkata",
    price: 8500,
    propertyPhoto: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 20,
    name: "ITC Grand Chola",
    location: "Chennai",
    price: 12000,
    propertyPhoto: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 21,
    name: "Taj Club House",
    location: "Chennai",
    price: 7200,
    propertyPhoto: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 22,
    name: "The Lalit Grand Palace Srinagar",
    location: "Srinagar",
    price: 16000,
    propertyPhoto: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 23,
    name: "The Khyber Himalayan Resort & Spa",
    location: "Gulmarg",
    price: 24000,
    propertyPhoto: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 24,
    name: "Wildflower Hall, An Oberoi Resort",
    location: "Shimla",
    price: 26000,
    propertyPhoto: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1618140052121-39fc6db33972?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 25,
    name: "The Oberoi Amarvilas",
    location: "Agra",
    price: 32000,
    propertyPhoto: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 26,
    name: "ITC Mughal, A Luxury Collection Hotel",
    location: "Agra",
    price: 8200,
    propertyPhoto: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 27,
    name: "Grand Hyatt Kochi Bolgatty",
    location: "Kochi",
    price: 11000,
    propertyPhoto: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 28,
    name: "Brunton Boatyard - CGH Earth",
    location: "Kochi",
    price: 14500,
    propertyPhoto: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 29,
    name: "Taj Madikeri Resort & Spa",
    location: "Coorg",
    price: 21000,
    propertyPhoto: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 30,
    name: "Atlantis, The Palm",
    location: "Dubai",
    price: 36000,
    propertyPhoto: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80",
    guestPhotos: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

export const getHotelImageData = (hotel: { id?: number | string; name?: string; hotelName?: string }): HotelImageData => {
  if (!hotel) return hotelImages[0];

  const hotelName = (hotel.hotelName || hotel.name || "").trim().toLowerCase();

  // 1. Exact Name Match FIRST (prevents DB ID mismatch & "Taj Hotel" matching "The Taj Mahal Palace")
  if (hotelName) {
    const exactMatch = hotelImages.find((h) => h.name.toLowerCase() === hotelName);
    if (exactMatch) return exactMatch;

    // 2. Partial match (sorted longest-name-first so "The Taj Mahal Palace" matches before "Taj Hotel")
    const partialMatch = [...hotelImages]
      .sort((a, b) => b.name.length - a.name.length)
      .find((h) => hotelName.includes(h.name.toLowerCase()) || h.name.toLowerCase().includes(hotelName));
    if (partialMatch) return partialMatch;
  }

  // 3. Fallback to ID only if name didn't match
  const hotelId = Number(hotel.id);
  if (!isNaN(hotelId)) {
    const foundById = hotelImages.find((h) => h.id === hotelId);
    if (foundById) return foundById;
  }

  return hotelImages[0];
};

export type RoomType = {
    id: number;
    name: string;
    base_price: number;
    description: string;
    image: string;
    is_active: boolean;
    capacity: number;
};

export type HotelFloor = {
    id: number;
    hotel_location_id: number;
    name: string;
    floor_number: number;
    purpose: string;
    note: string | null;
    is_active: boolean;
    hotel_location: HotelLocation;
};

export type HotelLocation = {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    phone_number: string;
    email: string;
    description: string | null;
    is_active: boolean;
    rooms: Room[];
};

type Room = {
    id: number;
    room_number: string;
    name: string | null;
    base_price: number;
    status: 'available' | 'occupied' | 'maintenance';
    is_active: boolean;
    images: string[];
    hotel_location_id: number;
    hotel_location: HotelLocation;
    hotel_floor: HotelFloor;
    room_type: RoomType;
};

type HotelGuest = {
    id: number;
    first_name: string;
    last_name?: string;
    phone: string;
    email?: string;
    date_of_birth?: string;
    passport_no?: string;
    nid_no?: string;
    type: 'walk_in' | 'corporate' | 'vip' | 'regular' | 'online';
    address?: string;
    note?: string;
    total_visits: number;
    total_spent: string;
    created_at: string;
    updated_at: string;
    guest_document?: GuestDocument[];
};

type GuestDocument = {
    id: number;
    type: string;
    document_number?: string;
    front_image?: string;
    back_image?: string;
    status: 'pending' | 'verified' | 'rejected';
    is_ai_verified: boolean;
    expiry_date?: string;
};

type Reservation = {
    id: number;
    guest_id: number;
    status: string;
    booking_type: string;
    start_at: string;
    end_at: string;
    total_amount: string;
    requires_medical: boolean;
    note?: string;

    guest: HotelGuest;
    rooms: Room[];
};

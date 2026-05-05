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
};

type Room = {
    id: number;
    room_number: string;
    name: string | null;
    base_price: number;
    status: 'available' | 'occupied' | 'maintenance';
    is_active: boolean;
    images: string[];
    hotel_location: HotelLocation;
    hotel_floor: HotelFloor;
    room_type: RoomType;
};

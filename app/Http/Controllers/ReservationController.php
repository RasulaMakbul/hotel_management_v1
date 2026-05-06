<?php

namespace App\Http\Controllers;

use App\Models\GuestDocument;
use App\Models\Hotelguest;
use App\Models\HotelLocation;
use App\Models\Reservation;
use App\Models\ReservationDocument;
use App\Models\ReservationRoom;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservation::with([
            'guest',
            'rooms.room.hotelLocation',
        ])->latest();

        // 🔍 SEARCH
        if ($request->search) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->whereHas('guest', function ($g) use ($search) {
                    $g->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                })
                    ->orWhereHas('rooms.room', function ($r) use ($search) {
                        $r->where('room_number', 'like', "%{$search}%");
                    })
                    ->orWhere('status', 'like', "%{$search}%");
            });
        }
        $hotelLocations = HotelLocation::with('rooms')->orderBy('name', 'asc')->get();
        $rooms = $hotelLocations->pluck('rooms')->flatten();

        // 📅 DATE FILTER
        if ($request->from && $request->to) {
            $query->whereBetween('start_at', [$request->from, $request->to]);
        }

        // 📌 STATUS FILTER
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $reservations = $query->paginate(10)->withQueryString();

        return Inertia::render('admin/reservation/reservation_index', [
            'reservations' => $reservations,
            'filters' => $request->only(['search', 'from', 'to', 'status']),
            'hotel_locations' => $hotelLocations,
            'success' => session('success'),
            'error' => session('error'),
            'warning' => session('warning'),
            'rooms' => $rooms
        ]);
    }

    public function store(Request $request)
    {
        if ($request->guest_id) {
            $guest = Hotelguest::findOrFail($request->guest_id);
        } else {
            $guest = Hotelguest::firstOrCreate(
                ['phone' => $request->phone],
                [
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'nid_no' => $request->nid_no,
                    'passport_no' => $request->passport_no,
                ]
            );

            // DOCUMENT
            if ($request->hasFile('front_image')) {
                GuestDocument::create([
                    'guest_id' => $guest->id,
                    'type' => $request->doc_type,
                    'document_number' => $request->nid_no ?? $request->passport_no,
                    'front_image' => $request->file('front_image')->store('docs'),
                    'back_image' => $request->file('back_image')?->store('docs'),
                ]);
            }
        }
        $validated = $request->validate([
            'hotel_location_id' => 'required|exists:hotel_locations,id',
            'room_ids' => 'required|array|min:1',
            'room_ids.*' => 'exists:rooms,id',
            'booking_type' => 'required|in:hourly,daily,weekly',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
            'adults' => 'required|array',
            'adults.*' => 'integer|min:1',
            'children' => 'required|array',
            'children.*' => 'integer|min:0',
            'requires_medical' => 'boolean',
            'note' => 'nullable|string',
        ]);

        // Calculate total amount and duration
        $totalAmount = 0;
        $totalDuration = 0;
        $reservationRooms = [];

        foreach ($validated['room_ids'] as $roomId) {
            $room = Room::find($roomId, 'id');

            // Calculate duration based on booking type
            $start = \Carbon\Carbon::parse($validated['start_at']);
            $end = \Carbon\Carbon::parse($validated['end_at']);

            switch ($validated['booking_type']) {
                case 'hourly':
                    $duration = $start->diffInHours($end);
                    break;
                case 'weekly':
                    $duration = $start->diffInWeeks($end);
                    break;
                default: // daily
                    $duration = $start->diffInDays($end);
            }

            $adults = $validated['adults'][$roomId] ?? 1;
            $children = $validated['children'][$roomId] ?? 0;

            $subtotal = $room->base_price * $duration * ($adults + $children * 0.5);
            $totalAmount += $subtotal;
            $totalDuration += $duration;

            $reservationRooms[] = [
                'room_id' => $roomId,
                'price_per_unit' => $room->base_price,
                'units' => $duration,
                'adults' => $adults,
                'children' => $children,
                'subtotal' => $subtotal,
            ];
        }

        // Create reservation
        $reservation = Reservation::create([
            'guest_id' => $guest->id, // or however you get guest ID
            'booking_type' => $validated['booking_type'],
            'start_at' => $validated['start_at'],
            'end_at' => $validated['end_at'],
            'total_duration' => $totalDuration,
            'total_amount' => $totalAmount,
            'requires_medical' => $validated['requires_medical'] ?? false,
            'status' => 'confirmed',
            'note' => $validated['note'],
        ]);

        // Create reservation rooms (no transaction needed here)
        foreach ($reservationRooms as $roomData) {
            ReservationRoom::create([
                'reservation_id' => $reservation->id,
                ...$roomData,
            ]);
        }

        return redirect()->back()
            ->with('success', 'Reservation created successfully');
    }


    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'hotel_location_id' => 'required|exists:hotel_locations,id',
            'room_ids' => 'required|array|min:1',
            'room_ids.*' => 'exists:rooms,id',
            'booking_type' => 'required|in:hourly,daily,weekly',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
            'adults' => 'required|array',
            'adults.*' => 'integer|min:1',
            'children' => 'required|array',
            'children.*' => 'integer|min:0',
            'requires_medical' => 'boolean',
            'note' => 'nullable|string',
        ]);

        // Calculate total amount and duration
        $totalAmount = 0;
        $totalDuration = 0;
        $reservationRooms = [];

        foreach ($validated['room_ids'] as $roomId) {
            $room = Room::find($roomId, 'id');

            // Calculate duration based on booking type
            $start = Carbon::parse($validated['start_at'])->timezone('Asia/Dhaka');
            $end = Carbon::parse($validated['end_at'])->timezone('Asia/Dhaka');

            switch ($validated['booking_type']) {
                case 'hourly':
                    $duration = $start->diffInHours($end);
                    break;
                case 'weekly':
                    $duration = $start->diffInWeeks($end);
                    break;
                default: // daily
                    $duration = $start->diffInDays($end);
            }

            $adults = $validated['adults'][$roomId] ?? 1;
            $children = $validated['children'][$roomId] ?? 0;

            $subtotal = $room->base_price * $duration * ($adults + $children * 0.5);
            $totalAmount += $subtotal;
            $totalDuration += $duration;

            $reservationRooms[] = [
                'room_id' => $roomId,
                'price_per_unit' => $room->base_price,
                'units' => $duration,
                'adults' => $adults,
                'children' => $children,
                'subtotal' => $subtotal,
            ];
        }

        // Update reservation
        $reservation->update([
            'booking_type' => $validated['booking_type'],
            'start_at' => $validated['start_at'],
            'end_at' => $validated['end_at'],
            'total_duration' => $totalDuration,
            'total_amount' => $totalAmount,
            'requires_medical' => $validated['requires_medical'] ?? false,
            'note' => $validated['note'],
        ]);

        // Delete existing reservation rooms
        ReservationRoom::where('reservation_id', $reservation->id)->delete();

        // Create new reservation rooms
        foreach ($reservationRooms as $roomData) {
            ReservationRoom::create([
                'reservation_id' => $reservation->id,
                ...$roomData,
            ]);
        }

        return redirect()->back()
            ->with('success', 'Reservation updated successfully');
    }


    public function destroy($id)
    {
        $reservation = Reservation::findOrFail($id);

        ReservationDocument::where('reservation_id', $reservation->id)->delete();

        // Delete reservation rooms
        ReservationRoom::where('reservation_id', $reservation->id)->delete();

        // Delete reservation
        $reservation->delete();

        return redirect()->back()
            ->with('success', 'Reservation deleted successfully');
    }

    private function getRoomAvailability($startDate, $endDate): array
    {
        if (!$startDate || !$endDate) {
            return [];
        }

        // Get all rooms
        $rooms = Room::all();

        // Get reservations that overlap with the given date range
        $reservations = Reservation::where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_at', [$startDate, $endDate])
                ->orWhereBetween('end_at', [$startDate, $endDate])
                ->orWhere(function ($q) use ($startDate, $endDate) {
                    $q->where('start_at', '<=', $startDate)
                        ->where('end_at', '>=', $endDate);
                });
        })->where('status', '!=', 'cancelled')->get();

        $availability = [];

        foreach ($rooms as $room) {
            $blockedDates = [];

            // Add dates from overlapping reservations
            foreach ($reservations as $reservation) {
                if ($reservation->reservationRoom()->where('room_id', $room->id)->exists()) {
                    $start = Carbon::parse($reservation->start_at);
                    $end = Carbon::parse($reservation->end_at);

                    for ($date = $start; $date <= $end; $date->addDay()) {
                        $blockedDates[] = $date->toDateString();
                    }
                }
            }

            $availability[] = [
                'room_id' => $room->id,
                'available' => count($blockedDates) === 0,
                'blocked_dates' => array_unique($blockedDates),
            ];
        }

        return $availability;
    }

    public function findGuest($phone)
    {
        $guest = Hotelguest::findOrFail('phone', $phone)->first();

        return $guest;
    }
}
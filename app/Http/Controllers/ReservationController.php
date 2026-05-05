<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
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
        ]);
    }
}
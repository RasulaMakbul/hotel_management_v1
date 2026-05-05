<?php

namespace App\Http\Controllers;

use App\Models\HotelFloor;
use App\Models\HotelLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HotelFloorController extends Controller
{
    public function index(Request $request)
    {
        $query = HotelFloor::query()->with('hotelLocation');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('floor_number', 'like', "%{$request->search}%");
        }

        $floors = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();
        $hotelLocations = HotelLocation::all();

        return Inertia::render('admin/rooms/hotel_floor_index', [
            'hotel_floor' => $floors,
            'filters' => [
                'search' => $request->search,
            ],
            'hotel_locations' => $hotelLocations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'hotel_location_id' => 'required|exists:hotel_locations,id',
            'name' => 'required|string',
            'floor_number' => 'required|integer',
            'purpose' => 'required|string',
            'note' => 'nullable|string',
        ]);

        HotelFloor::create($validated);

        return back()->with('success', 'Floor created successfully');
    }

    public function update(HotelFloor $hotel_floor, Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'floor_number' => 'required|integer',
            'purpose' => 'required|string',
            'note' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $hotel_floor->update($validated);

        return back()->with('success', 'Floor updated successfully');
    }

    public function destroy($id)
    {
        $hotel_floor = HotelFloor::findOrFail($id);
        $hotel_floor->delete();

        return back()->with('success', 'Floor deleted successfully');
    }

    public function toggleStatus(HotelFloor $hotel_floor)
    {
        $hotel_floor->update([
            'is_active' => !$hotel_floor->is_active,
        ]);

        return back();
    }
}

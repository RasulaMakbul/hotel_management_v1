<?php

namespace App\Http\Controllers;

use App\Models\HotelFloor;
use App\Models\HotelLocation;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;


class RoomController extends Controller
{
    public function index(Request $request)
    {
        $query = Room::with(['hotelLocation', 'hotelFloor', 'roomType'])
            ->orderBy('created_at', 'desc');
        $hotelLocations = HotelLocation::orderBy('id', 'DESC')->get();
        $hotelFloors = HotelFloor::orderBy('id', 'DESC')->get();
        $roomTypes = RoomType::orderBy('id', 'DESC')->get();


        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('room_number', 'like', "%{$request->search}%")
                    ->orWhere('name', 'like', "%{$request->search}%")
                    ->orWhereHas('hotelLocation', function ($loc) use ($request) {
                        $loc->where('name', 'like', "%{$request->search}%");
                    });
            });
        }

        $rooms = $query->paginate(10)->withQueryString();

        return Inertia::render('admin/rooms/room_index', [
            'rooms' => $rooms,
            'filters' => ['search' => $request->search],
            'hotelLocations' => $hotelLocations,
            'hotelFloors' => $hotelFloors,
            'roomTypes' => $roomTypes,
        ]);
    }

    public function store(Request $request)
    {
        // 🔥 FIX: normalize boolean from FormData
        $request->merge([
            'is_active' => filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN),
        ]);

        // 🔥 FIX: ensure images is always array
        $images = $request->file('images', []);

        $validated = $request->validate([
            'hotel_location_id' => 'required|exists:hotel_locations,id',
            'hotel_floor_id' => 'required|exists:hotel_floors,id',
            'room_type_id' => 'required|exists:room_types,id',
            'room_number' => 'required|string|max:50',
            'name' => 'nullable|string|max:255',
            'base_price' => 'required|numeric|min:0',
            'status' => 'required|in:available,occupied,maintenance',
            'is_active' => 'required|boolean',
            'note' => 'nullable|string',

            // FIXED
            'images' => 'nullable|array',
            'images.*' => 'image',
        ]);

        $location = HotelLocation::select('name')->find($validated['hotel_location_id']);
        $floor = HotelFloor::select('floor_number')->find($validated['hotel_floor_id']);
        $type = RoomType::select('name')->find($validated['room_type_id']);

        $imagePaths = [];

        if (!empty($images)) {
            foreach ($images as $file) {

                $name = implode('-', [
                    $location?->name ?? 'loc',
                    $type?->name ?? 'type',
                    $floor?->floor_number ?? 'floor',
                    $validated['room_number'],
                    rand(1000, 9999),
                ]);

                $imagePaths[] = $this->imageProcessing($file, $name);
            }
        }

        $validated['images'] = $imagePaths;

        Room::create($validated);

        return back()->with('success', 'Room created successfully.');
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'hotel_location_id' => 'required|exists:hotel_locations,id',
            'hotel_floor_id' => 'required|exists:hotel_floors,id',
            'room_type_id' => 'required|exists:room_types,id',
            'room_number' => 'required|string|max:50',
            'name' => 'nullable|string|max:255',
            'base_price' => 'required|numeric|min:0',
            'status' => 'required|in:available,occupied,maintenance',
            'is_active' => 'required|boolean',
            'note' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'image',
            'existing_images' => 'nullable|string',
        ]);

        $directory = 'images/rooms';

        // ✅ Decode existing images from frontend
        $existingImages = [];
        if ($request->filled('existing_images')) {
            $existingImages = json_decode($request->existing_images, true) ?? [];
        }

        // ✅ Step 1: Delete removed images ONLY
        $oldImages = $room->images ?? [];

        foreach ($oldImages as $old) {
            if (!in_array($old, $existingImages)) {
                Storage::disk('public')->delete($old);
            }
        }

        // ✅ Step 2: Start with existing images (KEEP THEM)
        $finalImages = $existingImages;

        // ✅ Step 3: Add new uploaded images
        if ($request->hasFile('images')) {
            $location = HotelLocation::find($validated['hotel_location_id'], 'id');
            $floor = HotelFloor::find($validated['hotel_floor_id'], 'id');
            $type = RoomType::find($validated['room_type_id'], 'id');

            foreach ($request->file('images') as $file) {
                $name = implode('-', [
                    $location?->name ?? 'loc',
                    $type?->name ?? 'type',
                    $floor?->floor_number ?? 'floor',
                    $validated['room_number'],
                    rand(1000, 9999),
                ]);

                $finalImages[] = $this->imageProcessing($file, $name);
            }
        }

        // ❌ IMPORTANT: remove nulls just in case
        $finalImages = array_values(array_filter($finalImages));

        $validated['images'] = $finalImages;

        $room->update($validated);

        return back()->with('success', 'Room updated successfully.');
    }



    public function destroy(int $id)
    {
        $room = Room::findOrFail($id);

        if (!empty($room->images)) {
            foreach ($room->images as $image) {
                if ($image && Storage::disk('public')->exists($image)) {
                    Storage::disk('public')->delete($image);
                }
            }
        }

        $room->delete();

        return redirect()->back()->with('success', 'Room deleted successfully.');
    }


    protected function imageProcessing($file, $name)
    {
        $directory = 'images/rooms';

        if (!Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->makeDirectory($directory);
        }

        $filename = Str::slug($name) . '-' . rand(1000, 9999) . '_' . time() . '.webp';
        $path = $directory . '/' . $filename;

        // ✅ Intervention v4 correct usage
        $image = Image::decodeBinary(file_get_contents($file))
            ->scale(width: 1200); // you can adjust (800/1000/1200)

        Storage::disk('public')->put(
            $path,
            $image->encodeUsingFileExtension('webp', quality: 80)
        );

        return $path;
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\HotelLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Intervention\Image\Laravel\Facades\Image;

class HotelLocationController extends Controller
{
    public function index(Request $request)
    {
        $query = HotelLocation::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('city', 'like', "%{$request->search}%")
                    ->orWhere('area', 'like', "%{$request->search}%")
                    ->orWhere('contact_number', 'like', "%{$request->search}%");
            });
        }

        $hotelLocations = $query
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/rooms/hotel_location_index', [
            'hotel_location' => $hotelLocations, // ✅ MUST match frontend
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'area' => 'required|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'hotel_type' => 'nullable|string',
            'contact_number' => 'nullable|string',
            'email' => 'nullable|string',
            'contact_person' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg',
            'status' => 'nullable|string',
        ]);
        $hotel_location = HotelLocation::create([
            'name' => $validatedData['name'],
            'area' => $validatedData['area'],
            'address' => $validatedData['address'] ?? null,
            'city' => $validatedData['city'] ?? null,
            'hotel_type' => $validatedData['hotel_type'] ?? null,
            'contact_number' => $validatedData['contact_number'] ?? null,
            'email' => $validatedData['email'] ?? null,
            'contact_person' => $validatedData['contact_person'] ?? null,
            'status' => $validatedData['status'] ?? null,
        ]);
        if ($request->hasFile('image')) {
            $imagePath = $this->imageProcessing(
                $request->file('image'),
                $validatedData['name']
            );

            $hotel_location->update(['image' => $imagePath]);
        }
        return redirect()->back()->with('success', 'Hotel created successfully.');
    }

    public function update(HotelLocation $hotel_location, Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'area' => 'required|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'hotel_type' => 'nullable|string',
            'contact_number' => 'nullable|string',
            'email' => 'nullable|string',
            'contact_person' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg',
            'status' => 'nullable|string',
        ]);

        // Update basic fields first
        $hotel_location->update([
            'name' => $validatedData['name'],
            'area' => $validatedData['area'],
            'address' => $validatedData['address'] ?? null,
            'address' => $validatedData['address'] ?? null,
            'hotel_type' => $validatedData['hotel_type'] ?? null,
            'contact_number' => $validatedData['contact_number'] ?? null,
            'email' => $validatedData['email'] ?? null,
            'contact_person' => $validatedData['contact_person'] ?? null,
            'status' => $validatedData['status'] ?? null,
        ]);

        // Handle image replacement
        if ($request->hasFile('image')) {

            // ✅ DELETE OLD IMAGE FIRST
            if ($hotel_location->image && Storage::disk('public')->exists($hotel_location->image)) {
                Storage::disk('public')->delete($hotel_location->image);
            }

            // Save new image
            $imagePath = $this->imageProcessing(
                $request->file('image'),
                $validatedData['name']
            );

            $hotel_location->update(['image' => $imagePath]);
        }

        return redirect()->back()->with('success', 'Room type updated successfully.');
    }

    public function destroy($id)
    {
        $hotel_location = HotelLocation::findOrFail($id);
        if ($hotel_location->image) {
            Storage::disk('public')->delete($hotel_location->image);
        }

        $hotel_location->delete();
        return redirect()->back()->with('success', 'Hotel deleted successfully.');
    }
    protected function imageProcessing($file, $name)
    {
        $directory = 'images/hotel_locations';

        if (!Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->makeDirectory($directory);
        }

        $filename = Str::slug($name) . '_' . time() . '.webp';
        $path = $directory . '/' . $filename;

        // ✅ Correct v4 approach
        $image = Image::decodeBinary(file_get_contents($file))
            ->scale(width: 800);

        Storage::disk('public')->put(
            $path,
            $image->encodeUsingFileExtension('webp', quality: 80)
        );

        return $path;
    }
    public function toggleStatus(HotelLocation $hotel_location)
    {
        $hotel_location->update([
            'status' => !$hotel_location->status
        ]);

        return redirect()->back()->with('success', 'Status updated successfully.');
    }
}

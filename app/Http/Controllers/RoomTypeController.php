<?php

namespace App\Http\Controllers;

use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Intervention\Image\Laravel\Facades\Image;

class RoomTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = RoomType::query()->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('capacity', 'like', "%{$search}%")
                    ->orWhere('base_price', 'like', "%{$search}%");
            });
        }

        $room_types = $query->paginate(10)->withQueryString();

        return Inertia::render('admin/rooms/room_type_index', [
            'room_types' => $room_types,
            'filters' => $request->only(['search']) // ✅ IMPORTANT ADD THIS
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'base_price' => 'required|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg',
            'is_active' => 'required|boolean',
            'capacity' => 'required|integer|min:1'
        ]);
        $roomType = RoomType::create([
            'name' => $validatedData['name'],
            'base_price' => $validatedData['base_price'],
            'description' => $validatedData['description'] ?? null,
            'is_active' => $validatedData['is_active'],
            'capacity' => $validatedData['capacity']
        ]);
        if ($request->hasFile('image')) {
            $imagePath = $this->imageProcessing(
                $request->file('image'),
                $validatedData['name']
            );

            $roomType->update(['image' => $imagePath]);
        }
        return redirect()->back()->with('success', 'Room type created successfully.');
    }

    public function update(RoomType $roomType, Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'base_price' => 'required|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg',
            'is_active' => 'required|boolean',
            'capacity' => 'required|integer|min:1'
        ]);

        // Update basic fields first
        $roomType->update([
            'name' => $validatedData['name'],
            'base_price' => $validatedData['base_price'],
            'description' => $validatedData['description'] ?? null,
            'is_active' => $validatedData['is_active'],
            'capacity' => $validatedData['capacity']
        ]);

        // Handle image replacement
        if ($request->hasFile('image')) {

            // ✅ DELETE OLD IMAGE FIRST
            if ($roomType->image && Storage::disk('public')->exists($roomType->image)) {
                Storage::disk('public')->delete($roomType->image);
            }

            // Save new image
            $imagePath = $this->imageProcessing(
                $request->file('image'),
                $validatedData['name']
            );

            $roomType->update(['image' => $imagePath]);
        }

        return redirect()->back()->with('success', 'Room type updated successfully.');
    }

    public function destroy(RoomType $roomType)
    {
        if ($roomType->image) {
            Storage::disk('public')->delete($roomType->image);
        }

        $roomType->delete();
        return redirect()->back()->with('success', 'Room type deleted successfully.');
    }
    protected function imageProcessing($file, $name)
    {
        $directory = 'images/room_types';

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
    public function toggleStatus(RoomType $roomType)
    {
        $roomType->update([
            'is_active' => !$roomType->is_active
        ]);

        return redirect()->back()->with('success', 'Status updated successfully.');
    }
}
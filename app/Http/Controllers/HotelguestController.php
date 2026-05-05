<?php

namespace App\Http\Controllers;

use App\Models\Hotelguest;
use App\Models\GuestDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class HotelguestController extends Controller
{
    public function index(Request $request)
    {
        $query = Hotelguest::query()->with('guestDocument')->latest();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('phone', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('first_name', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('admin/reservation/guest_index', [
            'guests' => $query->paginate(10)->withQueryString(),
            'filters' => ['search' => $request->search],
            'success' => session('success'),
            'error' => session('error'),
            'warning' => session('warning'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'nullable|string',
            'phone' => 'required|unique:hotelguests,phone',
            'email' => 'nullable|email',
            'date_of_birth' => 'nullable|date',
            'passport_no' => 'nullable|string',
            'nid_no' => 'nullable|string',
            'type' => 'required|in:walk_in,corporate,vip,regular,online',
            'address' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $guest = Hotelguest::create($validated);

        return back()->with('success', 'Guest created successfully');
    }

    public function update(Request $request, Hotelguest $guest)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'nullable|string',
            'phone' => "required|unique:hotelguests,phone,{$guest->id}",
            'email' => 'nullable|email',
            'date_of_birth' => 'nullable|date',
            'passport_no' => 'nullable|string',
            'nid_no' => 'nullable|string',
            'type' => 'required|in:walk_in,corporate,vip,regular,online',
            'address' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $guest->update($validated);

        return back()->with('success', 'Guest updated successfully');
    }

    public function destroy($id)
    {
        $guest = Hotelguest::findOrFail($id);
        $guest->delete();
        return back()->with('success', 'Guest deleted successfully');
    }



    public function storeDocument(Request $request)
    {
        $validated = $request->validate([
            'guest_id' => 'required|exists:hotelguests,id',
            'type' => 'required|in:nid,passport,driving_license',
            'document_number' => 'nullable|string',
            'front_image' => 'required|image|max:10240',
            'back_image' => 'nullable|image|max:10240',
            'expiry_date' => 'nullable|date',
        ]);

        if ($request->hasFile('front_image')) {
            $validated['front_image'] = $request->file('front_image')->store('guest_documents', 'public');
        }

        if ($request->hasFile('back_image')) {
            $validated['back_image'] = $request->file('back_image')->store('guest_documents', 'public');
        }

        $validated['status'] = 'pending';
        $validated['is_ai_verified'] = false;

        GuestDocument::create($validated);

        return back()->with('success', 'Document uploaded successfully');
    }

    public function updateDocument(Request $request, GuestDocument $document)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,verified,rejected',
        ]);

        if (in_array($validated['status'], ['verified', 'rejected'])) {
            $validated['verified_by'] = Auth::id();
            $validated['verified_at'] = now();
        }

        $document->update($validated);

        return back()->with('success', 'Document status updated successfully');
    }

    public function destroyDocument($id)
    {
        $document = GuestDocument::findOrFail($id);
        // Delete images from storage
        if ($document->front_image) {
            Storage::disk('public')->delete($document->front_image);
        }
        if ($document->back_image) {
            Storage::disk('public')->delete($document->back_image);
        }

        $document->delete();

        return back()->with('success', 'Document deleted successfully');
    }
}
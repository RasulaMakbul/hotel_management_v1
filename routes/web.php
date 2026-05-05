<?php

use App\Http\Controllers\HotelFloorController;
use App\Http\Controllers\HotelguestController;
use App\Http\Controllers\HotelLocationController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomTypeController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware(['auth', 'permission:super admin access'])->group(function () {
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
        Route::get('/users', [RoleController::class, 'users'])->name('users.index');
        Route::put('/user_role/{user}', [RoleController::class, 'updateUserRole'])->name('users.roleUpdate');



        Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
        Route::post('/permissions', [PermissionController::class, 'store'])->name('permissions.store');
        Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
        Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');
    });
    Route::middleware(['auth', 'permission:employee access'])->group(function () {
        Route::get('rooms_types', [RoomTypeController::class, 'index'])->name('rooms_types.index')->permission('view room type');
        Route::post('rooms_types', [RoomTypeController::class, 'store'])->name('rooms_types.store')->permission('create room type');
        Route::put('rooms_types/{roomType}', [RoomTypeController::class, 'update'])->name('rooms_types.update')->permission('edit room type');
        Route::delete('rooms_types/{roomType}', [RoomTypeController::class, 'destroy'])->name('rooms_types.destroy')->permission('delete room type');
        Route::patch('/room-types/{roomType}/toggle-status', [RoomTypeController::class, 'toggleStatus'])->name('rooms_types.toggleStatus')->permission('edit room type');

        Route::get('/hotel_locations', [HotelLocationController::class, 'index'])->name('hotel_locations.index')->permission('view hotel location');
        Route::post('/hotel_locations', [HotelLocationController::class, 'store'])->name('hotel_locations.store')->permission('create hotel location');
        Route::put('/hotel_locations/{hotelLocation}', [HotelLocationController::class, 'update'])->name('hotel_locations.update')->permission('edit hotel location');
        Route::delete('/hotel_locations/{hotelLocation}', [HotelLocationController::class, 'destroy'])->name('hotel_locations.destroy')->permission('delete hotel location');
        Route::patch('/hotel_locations/{hotelLocation}/toggle-status', [HotelLocationController::class, 'toggleStatus'])->name('hotel_locations.toggleStatus')->permission('edit hotel location');

        Route::get('/hotel_floors', [HotelFloorController::class, 'index'])->name('hotel_floors.index')->permission('view hotel floor');
        Route::post('/hotel_floors', [HotelFloorController::class, 'store'])->name('hotel_floors.store')->permission('create hotel floor');
        Route::put('/hotel_floors/{hotelFloor}', [HotelFloorController::class, 'update'])->name('hotel_floors.update')->permission('edit hotel floor');
        Route::delete('/hotel_floors/{hotelFloor}', [HotelFloorController::class, 'destroy'])->name('hotel_floors.destroy')->permission('delete hotel floor');
        Route::patch('/hotel_floors/{hotelFloor}/toggle-status', [RoomTypeController::class, 'toggleStatus'])->name('hotel_floors.toggleStatus')->permission('edit hotel floor');


        Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index')->permission('view room');
        Route::post('/rooms', [RoomController::class, 'store'])->name('rooms.store')->permission('create room');
        Route::put('/rooms/{room}', [RoomController::class, 'update'])->name('rooms.update')->permission('edit room');
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy'])->name('rooms.destroy')->permission('delete room');
        Route::patch('/rooms/{room}/toggle-status', [RoomController::class, 'toggleStatus'])->name('rooms.toggleStatus')->permission('edit room');

        Route::get('/guests', [HotelguestController::class, 'index'])->name('guests.index')->permission('view guest');
        Route::post('/guests', [HotelguestController::class, 'store'])->name('guests.store')->permission('create guest');
        Route::put('/guests/{guest}', [HotelguestController::class, 'update'])->name('guests.update')->permission('edit guest');
        Route::delete('/guests/{guest}', [HotelguestController::class, 'destroy'])->name('guests.destroy')->permission('delete guest');
        Route::post('/guest-documents', [HotelguestController::class, 'storeDocument'])->name('guest-documents.store')->permission('verify guest');
        Route::put('/guest-documents/{guest}', [HotelguestController::class, 'updateDocument'])->name('guest-documents.update')->permission('verify guest');
        Route::delete('/guest-documents/{guest}', [HotelguestController::class, 'destroyDocument'])->name('guest-documents.destroy')->permission('verify guest');

        Route::get('reservations', [ReservationController::class, 'index'])->name('reservations.index')->permission('view reservation');
        Route::post('reservations', [ReservationController::class, 'store'])->name('reservations.store')->permission('create reservation');
        Route::put('reservations/{reservation}', [ReservationController::class, 'update'])->name('reservations.update')->permission('edit reservation');
        Route::delete('reservations/{reservation}', [ReservationController::class, 'destroy'])->name('reservations.destroy')->permission('delete reservation');
    });
});

require __DIR__ . '/settings.php';
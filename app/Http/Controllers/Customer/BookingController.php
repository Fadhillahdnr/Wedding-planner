<?php

namespace App\Http\Controllers\Customer;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Package;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('customer/bookings', [
            'bookings' => $request->user()->bookings()->with(['package:id,name', 'vendor:id,name', 'histories'])->latest()->paginate(10),
            'packages' => Package::published()->orderBy('sort_order')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request, BookingService $service)
    {
        $data = $request->validate([
            'package_id' => ['nullable', 'integer', Rule::exists('packages', 'id')->where('is_published', true), 'required_without:vendor_id'],
            'vendor_id' => ['nullable', 'integer', Rule::exists('vendors', 'id')->where('status', 'published')],
            'preferred_date' => ['required', 'date', 'after:today'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $service->create($request->user(), $data);

        return to_route('bookings.index')->with('success', 'Permintaan booking terkirim. Kami akan segera mengonfirmasi.');
    }

    public function cancel(Request $request, Booking $booking, BookingService $service)
    {
        abort_unless($booking->user_id === $request->user()->id, 403);

        $service->transition($booking, BookingStatus::Cancelled, $request->user(), 'Dibatalkan oleh pelanggan.');

        return back()->with('success', 'Booking dibatalkan.');
    }
}

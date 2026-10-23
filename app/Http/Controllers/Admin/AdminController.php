<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BookingStatus;
use App\Enums\LeadStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ConsultationLead;
use App\Models\Package;
use App\Models\Vendor;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/index', [
            'stats' => [
                'leads' => ConsultationLead::count(),
                'newLeads' => ConsultationLead::where('status', 'new')->count(),
                'bookings' => Booking::count(),
                'pendingBookings' => Booking::where('status', 'pending')->count(),
                'packages' => Package::count(),
                'vendors' => Vendor::count(),
            ],
        ]);
    }

    public function leads(Request $request)
    {
        $status = $request->query('status');

        return Inertia::render('admin/leads', [
            'leads' => ConsultationLead::query()
                ->when($request->query('q'), fn ($q, $v) => $q->where(fn ($w) => $w->where('name', 'like', "%$v%")->orWhere('email', 'like', "%$v%")))
                ->when($status, fn ($q, $v) => $q->where('status', $v))
                ->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only('q', 'status'),
            'statuses' => array_column(LeadStatus::cases(), 'value'),
        ]);
    }

    public function updateLead(Request $request, ConsultationLead $lead)
    {
        $data = $request->validate(['status' => ['required', Rule::enum(LeadStatus::class)]]);
        $lead->update($data);

        return back()->with('success', 'Status lead diperbarui.');
    }

    public function destroyLead(ConsultationLead $lead)
    {
        $lead->delete();

        return back()->with('success', 'Lead dihapus.');
    }

    public function bookings(Request $request)
    {
        return Inertia::render('admin/bookings', [
            'bookings' => Booking::with(['user:id,name,email', 'package:id,name', 'vendor:id,name'])
                ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
                ->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only('status'),
            'statuses' => collect(BookingStatus::cases())->map(fn ($s) => ['value' => $s->value, 'label' => $s->label()]),
        ]);
    }

    public function updateBooking(Request $request, Booking $booking, BookingService $service)
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(BookingStatus::class)],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $service->transition($booking, BookingStatus::from($data['status']), $request->user(), $data['note'] ?? null);

        return back()->with('success', 'Status booking diperbarui.');
    }

    public function packages()
    {
        return Inertia::render('admin/packages', ['packages' => Package::withCount('features')->orderBy('sort_order')->paginate(15)]);
    }

    public function storePackage(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'tagline' => ['nullable', 'string', 'max:190'],
            'description' => ['nullable', 'string', 'max:5000'],
            'price_from' => ['nullable', 'numeric', 'min:0'],
            'is_featured' => ['boolean'],
            'is_published' => ['boolean'],
        ]);

        Package::create($data + ['slug' => $this->uniqueSlug(Package::class, $data['name'])]);

        return back()->with('success', 'Paket dibuat.');
    }

    public function updatePackage(Request $request, Package $package)
    {
        $package->update($request->validate([
            'name' => ['required', 'string', 'max:150'],
            'tagline' => ['nullable', 'string', 'max:190'],
            'description' => ['nullable', 'string', 'max:5000'],
            'price_from' => ['nullable', 'numeric', 'min:0'],
            'is_featured' => ['boolean'],
            'is_published' => ['boolean'],
        ]));

        return back()->with('success', 'Paket diperbarui.');
    }

    public function destroyPackage(Package $package)
    {
        $package->delete();

        return back()->with('success', 'Paket dihapus.');
    }

    private function uniqueSlug(string $model, string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;
        while ($model::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}

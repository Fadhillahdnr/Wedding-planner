<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VendorAdminController extends Controller
{
    private function rules(): array
    {
        return [
            'vendor_category_id' => ['required', 'integer', 'exists:vendor_categories,id'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'city' => ['nullable', 'string', 'max:100'],
            'price_min' => ['nullable', 'numeric', 'min:0'],
            'price_max' => ['nullable', 'numeric', 'min:0', 'gte:price_min'],
            'contact_email' => ['nullable', 'email', 'max:190'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'status' => ['required', Rule::in(Vendor::STATUSES)],
            'is_featured' => ['boolean'],
        ];
    }

    public function index(Request $request)
    {
        return Inertia::render('admin/vendors', [
            'vendors' => Vendor::with(['category:id,name,slug', 'media' => fn ($q) => $q->where('resource_type', 'image')->latest()])
                ->when($request->query('q'), fn ($q, $v) => $q->where('name', 'like', "%$v%"))
                ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
                ->latest()->paginate(15)->withQueryString(),
            'categories' => VendorCategory::orderBy('sort_order')->get(['id', 'name']),
            'statuses' => Vendor::STATUSES,
            'filters' => $request->only('q', 'status'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        Vendor::create($data + ['slug' => $this->uniqueSlug($data['name'])]);

        return back()->with('success', 'Vendor dibuat.');
    }

    public function update(Request $request, Vendor $vendor)
    {
        $vendor->update($request->validate($this->rules()));

        return back()->with('success', 'Vendor diperbarui.');
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();

        return back()->with('success', 'Vendor dihapus.');
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'vendor';
        $slug = $base;
        $i = 2;
        while (Vendor::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}

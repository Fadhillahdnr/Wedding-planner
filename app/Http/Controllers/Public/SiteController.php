<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Package;
use App\Models\PortfolioProject;
use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteController extends Controller
{
    public function home()
    {
        return Inertia::render('welcome', [
            'packages' => Package::published()->where('is_featured', true)->with('features')->orderBy('sort_order')->limit(3)->get(),
            'projects' => PortfolioProject::published()->latest('event_date')->limit(6)->get(['id', 'title', 'slug', 'category', 'location']),
            'faqs' => Faq::where('is_published', true)->orderBy('sort_order')->get(['id', 'question', 'answer']),
            'vendorCount' => Vendor::published()->count(),
        ]);
    }

    public function packages()
    {
        return Inertia::render('public/packages', [
            'packages' => Package::published()->with('features')->orderBy('sort_order')->get(),
        ]);
    }

    public function package(Package $package)
    {
        abort_unless($package->is_published, 404);

        return Inertia::render('public/package-show', ['package' => $package->load('features')]);
    }

    public function vendors(Request $request)
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:name,price_asc'],
        ]);

        $vendors = Vendor::published()
            ->with('category:id,name,slug')
            ->when($filters['q'] ?? null, fn ($q, $v) => $q->where('name', 'like', "%$v%"))
            ->when($filters['category'] ?? null, fn ($q, $v) => $q->whereHas('category', fn ($c) => $c->where('slug', $v)))
            ->when($filters['city'] ?? null, fn ($q, $v) => $q->where('city', $v))
            ->when(($filters['sort'] ?? null) === 'price_asc', fn ($q) => $q->orderBy('price_min'), fn ($q) => $q->orderBy('name'))
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('public/vendors', [
            'vendors' => $vendors,
            'categories' => VendorCategory::orderBy('sort_order')->get(['id', 'name', 'slug']),
            'cities' => Vendor::published()->whereNotNull('city')->distinct()->orderBy('city')->pluck('city'),
            'filters' => $filters,
        ]);
    }

    public function vendor(Vendor $vendor)
    {
        abort_unless($vendor->status === 'published', 404);

        return Inertia::render('public/vendor-show', ['vendor' => $vendor->load('category:id,name,slug')]);
    }

    public function portfolio()
    {
        return Inertia::render('public/portfolio', [
            'projects' => PortfolioProject::published()->latest('event_date')->paginate(12),
        ]);
    }
}

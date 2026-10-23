<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Vendor;

class SeoController extends Controller
{
    public function sitemap()
    {
        $urls = collect([route('home'), route('packages.index'), route('vendors.index'), route('portfolio.index'), route('consultation.create')])
            ->merge(Package::published()->pluck('slug')->map(fn ($s) => route('packages.show', $s)))
            ->merge(Vendor::published()->pluck('slug')->map(fn ($s) => route('vendors.show', $s)));

        $xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
            .$urls->map(fn ($u) => '<url><loc>'.e($u).'</loc></url>')->implode('')
            .'</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    public function robots()
    {
        return response("User-agent: *\nDisallow: /dashboard\nDisallow: /admin\nSitemap: ".route('sitemap')."\n", 200, ['Content-Type' => 'text/plain']);
    }
}

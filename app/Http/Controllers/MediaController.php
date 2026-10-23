<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\MediaAsset;
use App\Models\Vendor;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use RuntimeException;

class MediaController extends Controller
{
    private function rules(): array
    {
        return [
            'collection' => ['required', 'in:portfolio,vendors,audio,event'],
            'resource_type' => ['required', 'in:image,video,audio'],
            'event_id' => ['nullable', 'integer'],
            'vendor_id' => ['nullable', 'integer', 'exists:vendors,id'],
            'visibility' => ['nullable', 'in:public,private'],
        ];
    }

    public function signature(Request $request, CloudinaryService $cloudinary)
    {
        $data = $request->validate($this->rules());
        $event = isset($data['event_id']) ? Event::find($data['event_id']) : null;
        $folder = $cloudinary->resolveFolder($request->user(), $data['collection'], $event);
        // Media event pelanggan selalu privat.
        $private = $data['collection'] === 'event' || ($data['visibility'] ?? 'public') === 'private';

        try {
            return response()->json($cloudinary->signUpload($folder, $data['resource_type'], $private));
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }

    public function store(Request $request, CloudinaryService $cloudinary)
    {
        $data = $request->validate($this->rules() + [
            'public_id' => ['required', 'string', 'max:255'],
            'format' => ['required', 'string', 'max:10'],
            'bytes' => ['required', 'integer', 'min:1'],
            'secure_url' => ['required', 'url'],
            'width' => ['nullable', 'integer'],
            'height' => ['nullable', 'integer'],
            'duration' => ['nullable', 'numeric'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ]);

        $event = isset($data['event_id']) ? Event::find($data['event_id']) : null;
        $folder = $cloudinary->resolveFolder($request->user(), $data['collection'], $event);
        // Hanya koleksi vendor (khusus staf, sudah dijaga resolveFolder) yang boleh menempel ke Vendor.
        $vendor = $data['collection'] === 'vendors' && isset($data['vendor_id']) ? Vendor::find($data['vendor_id']) : null;

        $asset = $cloudinary->recordUpload($request->user(), $folder, $data['resource_type'], $data, [
            'mediable_type' => $event ? Event::class : ($vendor ? Vendor::class : null),
            'mediable_id' => $event?->id ?? $vendor?->id,
            'alt_text' => $data['alt_text'] ?? null,
            'visibility' => $data['collection'] === 'event' ? 'private' : ($data['visibility'] ?? 'public'),
            'collection' => $data['collection'],
        ]);

        return response()->json(['id' => $asset->id], 201);
    }

    public function destroy(MediaAsset $asset, CloudinaryService $cloudinary)
    {
        Gate::authorize('delete', $asset);

        try {
            $cloudinary->delete($asset);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }

        return response()->json(['ok' => true]);
    }

    public function show(MediaAsset $asset, CloudinaryService $cloudinary)
    {
        Gate::authorize('view', $asset);

        return redirect()->away($cloudinary->deliveryUrl($asset));
    }
}

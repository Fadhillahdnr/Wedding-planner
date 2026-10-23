<?php

namespace App\Http\Controllers;

use App\Models\MediaAsset;
use App\Services\ActivityLogger;
use App\Services\Media\MediaLibrary;
use App\Services\Media\MediaStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MediaController extends Controller
{
    public function __construct(private MediaStorage $storage, private MediaLibrary $library) {}

    /** Langkah 1: server menyiapkan baris `pending` + parameter unggah bertanda tangan. */
    public function signature(Request $request): JsonResponse
    {
        $data = $request->validate([
            'target' => ['required', Rule::in(array_keys(config('media.targets')))],
            'target_id' => ['required', 'integer'],
            'resource_type' => ['nullable', Rule::in(['image', 'video'])],
        ]);
        $resourceType = $data['resource_type'] ?? 'image';

        if (! $this->storage->isConfigured()) {
            return response()->json(['message' => 'Penyimpanan media belum dikonfigurasi.'], 503);
        }

        $config = config("media.targets.{$data['target']}");
        $formats = $resourceType === 'video' ? ($config['video_formats'] ?? null) : $config['formats'];
        if ($formats === null) {
            return response()->json(['message' => 'Target ini tidak menerima video.'], 422);
        }
        // Model memakai scope wedding_id: ID milik workspace lain → 404.
        $target = $config['model']::findOrFail($data['target_id']);

        $count = MediaAsset::where('mediable_type', $target->getMorphClass())->where('mediable_id', $target->getKey())->count();
        if ($count >= config('media.max_per_item')) {
            return response()->json(['message' => 'Batas jumlah berkas untuk item ini sudah tercapai.'], 422);
        }

        $publicId = $this->library->publicId($request->user()->weddingId(), $data['target'], $target->getKey());

        $asset = new MediaAsset([
            'uploaded_by' => $request->user()->id,
            'provider' => 'cloudinary',
            'public_id' => $publicId,
            'kind' => $resourceType === 'video' ? 'video' : 'photo',
            'resource_type' => $resourceType,
            'delivery_type' => 'authenticated',
            'status' => 'pending',
        ]);
        $asset->mediable()->associate($target);
        $asset->save();

        return response()->json([
            'asset_id' => $asset->id,
            'upload' => $this->storage->signUpload($publicId, $formats, $resourceType),
        ]);
    }

    /** Langkah 3: server memeriksa ulang aset yang diklaim klien sudah terunggah. */
    public function confirm(MediaAsset $asset): JsonResponse
    {
        abort_unless($asset->status === 'pending', 409, 'Berkas sudah dikonfirmasi.');

        $formats = $this->formatsFor($asset);

        if ($error = $this->library->confirm($asset, $formats)) {
            return response()->json(['message' => $error], 422);
        }

        return response()->json(['id' => $asset->id, 'kind' => $asset->kind, 'format' => $asset->format, 'bytes' => $asset->bytes]);
    }

    /** Menampilkan aset privat: hanya anggota workspace pemilik, lewat URL bertanda tangan. */
    public function show(MediaAsset $asset): RedirectResponse
    {
        abort_unless($asset->status === 'ready', 404);

        return redirect()->away($this->storage->url($asset))->header('Cache-Control', 'private, max-age=300');
    }

    /** Gambar sampul video (bingkai pertama), dengan otorisasi yang sama seperti `show`. */
    public function poster(MediaAsset $asset): RedirectResponse
    {
        abort_unless($asset->status === 'ready' && $asset->kind === 'video', 404);

        return redirect()->away($this->storage->posterUrl($asset))->header('Cache-Control', 'private, max-age=300');
    }

    public function destroy(MediaAsset $asset, ActivityLogger $log): JsonResponse|RedirectResponse
    {
        if (! $this->library->purge($asset)) {
            return response()->json(['message' => 'Gagal menghapus berkas di penyimpanan. Coba lagi.'], 502);
        }

        $log->record('media.deleted', ['kind' => $asset->kind]);

        return back()->with('success', 'Berkas dihapus.');
    }

    /** @return list<string> */
    private function formatsFor(MediaAsset $asset): array
    {
        foreach (config('media.targets') as $config) {
            if ((new $config['model'])->getMorphClass() === $asset->mediable_type) {
                return $asset->resource_type === 'video' ? ($config['video_formats'] ?? []) : $config['formats'];
            }
        }

        abort(422, 'Target tidak dikenal.');
    }
}

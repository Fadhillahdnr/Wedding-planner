<?php

namespace App\Http\Controllers;

use App\Models\Memory;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemoryController extends Controller
{
    public function index(Request $request)
    {
        $memories = Memory::query()
            ->with('media')
            ->orderByRaw('happened_on desc nulls last')
            ->latest('id')
            ->paginate(12)
            ->through(fn (Memory $m) => [
                'id' => $m->id,
                'title' => $m->title,
                'caption' => $m->caption,
                'happened_on' => $m->happened_on?->toDateString(),
                'media' => $m->media->map(fn ($a) => ['id' => $a->id, 'kind' => $a->kind, 'format' => $a->format, 'bytes' => (int) $a->bytes])->values(),
            ]);

        return Inertia::render('memories/index', ['memories' => $memories]);
    }

    public function store(Request $request, ActivityLogger $log)
    {
        $memory = new Memory($this->validated($request));
        $memory->created_by = $request->user()->id;
        $memory->save();

        $log->record('memory.created');

        return back()->with('success', 'Kenangan disimpan. Foto dan video bisa ditambahkan dari kartunya.');
    }

    public function update(Request $request, Memory $memory)
    {
        $memory->update($this->validated($request));

        return back()->with('success', 'Kenangan diperbarui.');
    }

    public function destroy(Memory $memory, ActivityLogger $log)
    {
        $memory->delete();
        $log->record('memory.deleted');

        return back()->with('success', 'Kenangan dihapus.');
    }

    /** @return array<string,mixed> */
    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'caption' => ['nullable', 'string', 'max:2000'],
            'happened_on' => ['nullable', 'date', 'before_or_equal:'.now($request->user()->wedding()->timezone)->toDateString()],
        ], [
            'happened_on.before_or_equal' => 'Tanggal kenangan tidak boleh di masa depan.',
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\LoveNote;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LoveNoteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $today = now($user->wedding()->timezone)->toDateString();

        $notes = LoveNote::query()
            ->with('author:id,name')
            ->readableBy($user, $today)
            ->latest('id')
            ->paginate(10)
            ->through(fn (LoveNote $n) => [
                'id' => $n->id,
                'title' => $n->title,
                'body' => $n->body,
                'visibility' => $n->visibility,
                'reveal_on' => $n->reveal_on?->toDateString(),
                'mine' => $n->author_id === $user->id,
                'author' => $n->author->name,
                // Hanya penulis yang tahu catatannya masih terjadwal.
                'scheduled' => $n->author_id === $user->id && $n->reveal_on !== null && $n->reveal_on->toDateString() > $today,
                'created_at' => $n->created_at->toDateString(),
            ]);

        return Inertia::render('notes/index', ['notes' => $notes, 'today' => $today]);
    }

    public function store(Request $request)
    {
        $note = new LoveNote($this->validated($request));
        $note->author_id = $request->user()->id;
        $note->save();

        return back()->with('success', 'Catatan disimpan.');
    }

    public function update(Request $request, LoveNote $note)
    {
        abort_unless($note->author_id === $request->user()->id, 403);
        $note->update($this->validated($request));

        return back()->with('success', 'Catatan diperbarui.');
    }

    public function destroy(Request $request, LoveNote $note)
    {
        abort_unless($note->author_id === $request->user()->id, 403);
        $note->delete();

        return back()->with('success', 'Catatan dihapus.');
    }

    /** @return array<string,mixed> */
    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'body' => ['required', 'string', 'max:5000'],
            'visibility' => ['required', Rule::in(['shared', 'private'])],
            'reveal_on' => ['nullable', 'date', 'after_or_equal:'.now($request->user()->wedding()->timezone)->toDateString()],
        ], [
            'reveal_on.after_or_equal' => 'Tanggal buka tidak boleh sebelum hari ini.',
        ]);
    }
}

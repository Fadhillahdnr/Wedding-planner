<?php

use App\Domain\Templates\TemplateApplier;
use App\Models\Task;
use App\Models\Wedding;

function planned(string $date): array
{
    [$user, $wedding] = workspace(['target_date' => $date]);
    app(TemplateApplier::class)->apply($wedding);

    return [$user, $wedding];
}

it('previews and applies a new wedding date, skipping done and locked tasks', function () {
    [$user] = planned(now()->addYears(2)->toDateString());
    $this->actingAs($user);

    $done = Task::where('title', 'Gladi resik')->first();
    $done->update(['status' => 'selesai']);
    $locked = Task::where('title', 'Kunjungi wedding fair')->first();
    $locked->update(['date_locked' => true]);
    $lockedDue = $locked->due_date->toDateString();
    $doneDue = $done->due_date->toDateString();

    $newDate = now()->addYears(3)->toDateString();
    $preview = $this->postJson('/pengaturan/hari-h/pratinjau', ['target_date' => $newDate])->assertOk()->json('changes');
    expect(collect($preview)->pluck('id'))->not->toContain($done->id)->not->toContain($locked->id)->and($preview)->not->toBeEmpty();

    $this->put('/pengaturan/hari-h', ['target_date' => $newDate])->assertRedirect();

    expect($done->fresh()->due_date->toDateString())->toBe($doneDue)
        ->and($locked->fresh()->due_date->toDateString())->toBe($lockedDue)
        ->and(Task::where('title', 'Susun daftar seserahan')->first()->due_date->toDateString())
        ->toBe(now()->addYears(3)->subMonthsNoOverflow(6)->toDateString());
});

it('flags tasks that fall into the past instead of moving them', function () {
    [$user] = planned(now()->addYears(2)->toDateString());
    $task = Task::where('title', 'Diskusikan visi pernikahan dan restu kedua keluarga')->first();
    $original = $task->due_date->toDateString();

    $this->actingAs($user)->put('/pengaturan/hari-h', ['target_date' => now()->addMonths(6)->toDateString()])->assertRedirect();

    expect($task->fresh()->due_date->toDateString())->toBe($original)->and($task->fresh()->needs_reschedule)->toBeTrue();
});

it('accepts an estimated month in place of a date and clears the exact date', function () {
    [$user, $wedding] = planned(now()->addYears(2)->toDateString());

    $this->actingAs($user)->put('/pengaturan/hari-h', ['target_month' => now()->addYears(3)->format('Y-m')])->assertRedirect();

    $wedding->refresh();
    expect($wedding->target_date)->toBeNull()->and($wedding->dateIsEstimated())->toBeTrue();
});

it('requires either a date or a month', function () {
    [$user] = planned(now()->addYears(2)->toDateString());

    $this->actingAs($user)->put('/pengaturan/hari-h', [])->assertSessionHasErrors(['target_date', 'target_month']);
});

it('locks the due date when a user edits it by hand', function () {
    [$user] = planned(now()->addYears(2)->toDateString());
    $task = Task::first();

    $this->actingAs($user)->put("/timeline/tugas/{$task->id}", ['title' => $task->title, 'due_date' => '2030-01-01'])->assertRedirect();

    expect($task->fresh()->date_locked)->toBeTrue();
});

it('records completion time and rejects an assignee outside the workspace', function () {
    [$user, $wedding] = planned(now()->addYears(2)->toDateString());
    [$stranger] = workspace();
    $task = Task::first();

    $this->actingAs($user)->put("/timeline/tugas/{$task->id}", ['title' => $task->title, 'status' => 'selesai'])->assertRedirect();
    expect($task->fresh()->completed_at)->not->toBeNull();

    $this->put("/timeline/tugas/{$task->id}", ['title' => $task->title, 'assignee_id' => $stranger->id])->assertSessionHasErrors('assignee_id');
    expect(Wedding::count())->toBe(2);
});

it('lets a user create a task of their own', function () {
    [$user] = workspace();

    $this->actingAs($user)->post('/timeline/tugas', ['title' => 'Cek gedung kedua', 'due_date' => '2027-05-01'])->assertRedirect();

    expect(Task::first())->title->toBe('Cek gedung kedua')->source->toBe('user')->offset_value->toBeNull();
});

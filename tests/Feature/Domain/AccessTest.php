<?php

use App\Enums\Role;
use App\Models\Event;
use App\Models\Task;
use App\Models\User;

it('blocks guests and customers from admin', function () {
    $this->get('/admin')->assertRedirect('/login');
    $this->actingAs(User::factory()->create())->get('/admin')->assertForbidden();
    $this->actingAs(User::factory()->role(Role::Admin)->create())->get('/admin')->assertOk();
});

it('does not allow role escalation via registration', function () {
    $this->post('/register', ['name' => 'X', 'email' => 'x@x.test', 'password' => 'password', 'password_confirmation' => 'password', 'role' => 'admin']);
    expect(User::where('email', 'x@x.test')->first()->role)->toBe(Role::Customer);
});

it('prevents access to another customer task', function () {
    $owner = User::factory()->create();
    $event = Event::create(['user_id' => $owner->id, 'title' => 'E', 'budget_total' => 0]);
    $task = Task::create(['event_id' => $event->id, 'title' => 'T']);

    $this->actingAs(User::factory()->create())->patch("/dashboard/tasks/{$task->id}")->assertForbidden();
    $this->actingAs(User::factory()->create())->delete("/dashboard/tasks/{$task->id}")->assertForbidden();
    $this->actingAs($owner)->patch("/dashboard/tasks/{$task->id}")->assertRedirect();
    expect($task->fresh()->is_done)->toBeTrue();
});

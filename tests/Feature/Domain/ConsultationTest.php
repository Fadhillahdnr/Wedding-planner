<?php

use App\Models\ConsultationLead;

it('stores a valid lead', function () {
    $this->post('/konsultasi', ['name' => 'Ani', 'email' => 'ani@x.test', 'phone' => '+62 812 3456 7890'])
        ->assertSessionHas('success')->assertSessionHasNoErrors();
    expect(ConsultationLead::count())->toBe(1);
});

it('validates input and rejects honeypot', function () {
    $this->post('/konsultasi', ['name' => '', 'email' => 'bad', 'phone' => 'abc'])->assertSessionHasErrors(['name', 'email', 'phone']);
    $this->post('/konsultasi', ['name' => 'Bot', 'email' => 'b@x.test', 'phone' => '0812345678', 'website' => 'spam.com'])->assertSessionHasErrors('website');
    expect(ConsultationLead::count())->toBe(0);
});

it('rate limits the public form', function () {
    foreach (range(1, 5) as $i) {
        $this->post('/konsultasi', ['name' => 'A', 'email' => "a$i@x.test", 'phone' => '0812345678']);
    }
    $this->post('/konsultasi', ['name' => 'A', 'email' => 'z@x.test', 'phone' => '0812345678'])->assertStatus(429);
});

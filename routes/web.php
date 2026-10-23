<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\WeddingSettingsController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');

Route::get('undangan/{token}', [InvitationController::class, 'show'])->name('invitation.show');
Route::post('undangan/{token}', [InvitationController::class, 'accept'])->middleware('throttle:6,1')->name('invitation.accept');

Route::middleware(['auth', 'workspace:any'])->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'show'])->name('onboarding');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

Route::middleware(['auth', 'workspace'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('anggaran', [BudgetController::class, 'index'])->name('budget.index');
    Route::post('anggaran/kategori', [BudgetController::class, 'storeCategory'])->name('budget.categories.store');
    Route::put('anggaran/kategori/{category}', [BudgetController::class, 'updateCategory'])->name('budget.categories.update');
    Route::delete('anggaran/kategori/{category}', [BudgetController::class, 'destroyCategory'])->name('budget.categories.destroy');
    Route::post('anggaran/item', [BudgetController::class, 'storeItem'])->name('budget.items.store');
    Route::put('anggaran/item/{item}', [BudgetController::class, 'updateItem'])->name('budget.items.update');
    Route::delete('anggaran/item/{item}', [BudgetController::class, 'destroyItem'])->name('budget.items.destroy');
    Route::post('anggaran/dana', [BudgetController::class, 'storeFunding'])->name('budget.funding.store');
    Route::put('anggaran/dana/{funding}', [BudgetController::class, 'updateFunding'])->name('budget.funding.update');
    Route::delete('anggaran/dana/{funding}', [BudgetController::class, 'destroyFunding'])->name('budget.funding.destroy');
    Route::post('anggaran/pembayaran', [BudgetController::class, 'storePayment'])->name('budget.payments.store');
    Route::put('anggaran/pembayaran/{payment}', [BudgetController::class, 'updatePayment'])->name('budget.payments.update');
    Route::delete('anggaran/pembayaran/{payment}', [BudgetController::class, 'destroyPayment'])->name('budget.payments.destroy');

    Route::get('timeline', [TaskController::class, 'index'])->name('timeline.index');
    Route::post('timeline/tugas', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('timeline/tugas/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('timeline/tugas/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    Route::get('vendor', [VendorController::class, 'index'])->name('vendors.index');
    Route::post('vendor/slot', [VendorController::class, 'storeSlot'])->name('vendors.slots.store');
    Route::get('vendor/slot/{slot}', [VendorController::class, 'show'])->name('vendors.show');
    Route::put('vendor/slot/{slot}', [VendorController::class, 'updateSlot'])->name('vendors.slots.update');
    Route::delete('vendor/slot/{slot}', [VendorController::class, 'destroySlot'])->name('vendors.slots.destroy');
    Route::post('vendor/slot/{slot}/kandidat', [VendorController::class, 'storeCandidate'])->name('vendors.candidates.store');
    Route::put('vendor/kandidat/{candidate}', [VendorController::class, 'updateCandidate'])->name('vendors.candidates.update');
    Route::delete('vendor/kandidat/{candidate}', [VendorController::class, 'destroyCandidate'])->name('vendors.candidates.destroy');
    Route::post('vendor/kandidat/{candidate}/pilih', [VendorController::class, 'choose'])->name('vendors.candidates.choose');
    Route::post('vendor/kandidat/{candidate}/pertemuan', [VendorController::class, 'storeMeeting'])->name('vendors.meetings.store');
    Route::delete('vendor/pertemuan/{meeting}', [VendorController::class, 'destroyMeeting'])->name('vendors.meetings.destroy');

    Route::get('pengaturan/pernikahan', [WeddingSettingsController::class, 'edit'])->name('wedding.edit');
    Route::put('pengaturan/pernikahan', [WeddingSettingsController::class, 'update'])->name('wedding.update');
    Route::post('pengaturan/hari-h/pratinjau', [WeddingSettingsController::class, 'previewDate'])->name('wedding.date.preview');
    Route::put('pengaturan/hari-h', [WeddingSettingsController::class, 'updateDate'])->name('wedding.date.update');
    Route::post('pengaturan/undangan', [WeddingSettingsController::class, 'invite'])->middleware('throttle:10,1')->name('wedding.invite');
    Route::delete('pengaturan/undangan/{invitation}', [WeddingSettingsController::class, 'revoke'])->name('wedding.invitation.revoke');
    Route::delete('pengaturan/anggota/{member}', [WeddingSettingsController::class, 'removeMember'])->name('wedding.member.remove');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

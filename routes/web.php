<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\VendorAdminController;
use App\Http\Controllers\Customer\BookingController;
use App\Http\Controllers\Customer\PlannerController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\Public\ConsultationController;
use App\Http\Controllers\Public\SeoController;
use App\Http\Controllers\Public\SiteController;
use App\Http\Middleware\EnsureStaff;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'home'])->name('home');
Route::get('paket', [SiteController::class, 'packages'])->name('packages.index');
Route::get('paket/{package}', [SiteController::class, 'package'])->name('packages.show');
Route::get('vendor', [SiteController::class, 'vendors'])->name('vendors.index');
Route::get('vendor/{vendor}', [SiteController::class, 'vendor'])->name('vendors.show');
Route::get('portofolio', [SiteController::class, 'portfolio'])->name('portfolio.index');
Route::get('konsultasi', [ConsultationController::class, 'create'])->name('consultation.create');
Route::post('konsultasi', [ConsultationController::class, 'store'])->middleware('throttle:consultation')->name('consultation.store');
Route::get('sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::get('robots.txt', [SeoController::class, 'robots']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [PlannerController::class, 'dashboard'])->name('dashboard');
    Route::put('dashboard/event', [PlannerController::class, 'saveEvent'])->name('event.save');
    Route::post('dashboard/tasks', [PlannerController::class, 'storeTask'])->name('tasks.store');
    Route::patch('dashboard/tasks/{task}', [PlannerController::class, 'toggleTask'])->name('tasks.toggle');
    Route::delete('dashboard/tasks/{task}', [PlannerController::class, 'destroyTask'])->name('tasks.destroy');
    Route::post('dashboard/budget', [PlannerController::class, 'storeBudgetItem'])->name('budget.store');
    Route::delete('dashboard/budget/{item}', [PlannerController::class, 'destroyBudgetItem'])->name('budget.destroy');

    Route::get('booking', [BookingController::class, 'index'])->name('bookings.index');
    Route::post('booking', [BookingController::class, 'store'])->name('bookings.store');
    Route::patch('booking/{booking}/batal', [BookingController::class, 'cancel'])->name('bookings.cancel');

    Route::post('media/signature', [MediaController::class, 'signature'])->name('media.signature');
    Route::post('media', [MediaController::class, 'store'])->name('media.store');
    Route::get('media/{asset}', [MediaController::class, 'show'])->name('media.show');
    Route::delete('media/{asset}', [MediaController::class, 'destroy'])->name('media.destroy');

    Route::prefix('admin')->middleware(EnsureStaff::class)->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('admin.index');
        Route::get('leads', [AdminController::class, 'leads'])->name('admin.leads');
        Route::patch('leads/{lead}', [AdminController::class, 'updateLead'])->name('admin.leads.update');
        Route::delete('leads/{lead}', [AdminController::class, 'destroyLead'])->name('admin.leads.destroy');
        Route::get('bookings', [AdminController::class, 'bookings'])->name('admin.bookings');
        Route::patch('bookings/{booking}', [AdminController::class, 'updateBooking'])->name('admin.bookings.update');
        Route::get('packages', [AdminController::class, 'packages'])->name('admin.packages');
        Route::post('packages', [AdminController::class, 'storePackage'])->name('admin.packages.store');
        Route::put('packages/{package}', [AdminController::class, 'updatePackage'])->name('admin.packages.update');
        Route::delete('packages/{package}', [AdminController::class, 'destroyPackage'])->name('admin.packages.destroy');
        Route::get('vendors', [VendorAdminController::class, 'index'])->name('admin.vendors');
        Route::post('vendors', [VendorAdminController::class, 'store'])->name('admin.vendors.store');
        Route::put('vendors/{vendor:id}', [VendorAdminController::class, 'update'])->name('admin.vendors.update');
        Route::delete('vendors/{vendor:id}', [VendorAdminController::class, 'destroy'])->name('admin.vendors.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

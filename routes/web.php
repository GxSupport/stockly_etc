<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\WarehouseTypeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::put('user/chat-id', [UserController::class, 'updateChatId'])->name('user.update-chat-id');
    Route::middleware('management')->group(function () {
        Route::prefix('employees')->group(function () {
            Route::get('/', [EmployeController::class, 'index'])->name('employees.index');
            Route::get('/create', [EmployeController::class, 'create'])->name('employees.create');
            Route::post('/create', [EmployeController::class, 'store'])->name('employees.store');
            Route::get('/search-warehouses', [EmployeController::class, 'searchWarehouses'])->name('employees.search-warehouses');
            Route::get('/{employee}', [EmployeController::class, 'show'])->name('employees.show');
            Route::get('/{employee}/edit', [EmployeController::class, 'edit'])->name('employees.edit');
            Route::put('/{employee}', [EmployeController::class, 'update'])->name('employees.update');
            Route::delete('/{employee}', [EmployeController::class, 'destroy'])->name('employees.destroy');
        });

        Route::prefix('departments')->group(function () {
            Route::get('/', [DepartmentController::class, 'index'])->name('departments.index');
            Route::get('/create', [DepartmentController::class, 'create'])->name('departments.create');
            Route::post('/create', [DepartmentController::class, 'store'])->name('departments.store');
        });

        Route::prefix('warehouses')->group(function () {
            Route::get('/', [WarehouseController::class, 'index'])->name('warehouses.index');
            Route::get('/create', [WarehouseController::class, 'create'])->name('warehouses.create');
            Route::post('/create', [WarehouseController::class, 'store'])->name('warehouses.store');
        });

        Route::prefix('warehouse-types')->group(function () {
            Route::get('/', [WarehouseTypeController::class, 'index'])->name('warehouse-types.index');
            Route::get('/create', [WarehouseTypeController::class, 'create'])->name('warehouse-types.create');
            Route::post('/create', [WarehouseTypeController::class, 'store'])->name('warehouse-types.store');
        });

        Route::prefix('document-types')->group(function () {
            Route::get('/', [DocumentTypeController::class, 'index'])->name('document-types.index');
            Route::get('/create', [DocumentTypeController::class, 'create'])->name('document-types.create');
            Route::post('/create', [DocumentTypeController::class, 'store'])->name('document-types.store');
            Route::get('/{id}/edit', [DocumentTypeController::class, 'edit'])->name('document-types.edit');
            Route::put('/{id}', [DocumentTypeController::class, 'update'])->name('document-types.update');
        });
    });

    Route::prefix('documents')->group(function () {
        Route::get('/{status?}', [DocumentController::class, 'index'])
            ->where('status', 'draft|sent|return|incoming')
            ->name('documents.index');
        Route::get('/create', [DocumentController::class, 'create'])->name('documents.create');
        Route::post('/create', [DocumentController::class, 'store'])->name('documents.store');
        Route::get('/{id}/edit', [DocumentController::class, 'edit'])->name('documents.edit');
        Route::put('/{id}', [DocumentController::class, 'update'])->name('documents.update');
        Route::get('/{id}', [DocumentController::class, 'show'])->name('documents.show');
        Route::post('/get-composition', [DocumentController::class, 'getComposition'])->name('documents.get-composition');
        Route::get('/{id}/check-sms', [DocumentController::class, 'checkSmsRequired'])->name('documents.check-sms');
        Route::post('/send-otp', [DocumentController::class, 'sendOtp'])->name('documents.send-otp');
        Route::post('/{id}/confirm-code', [DocumentController::class, 'confirmCode'])->name('documents.confirm-code');
        Route::post('/{id}/reject-code', [DocumentController::class, 'rejectCode'])->name('documents.reject-code');
        Route::post('/{id}/send-to-next', [DocumentController::class, 'sendToNext'])->name('documents.send-to-next');
    });

    Route::prefix('user-guides')->group(function () {
        Route::get('/', [GuideController::class, 'index'])->name('user-guides.index');
        Route::get('/{slug}', [GuideController::class, 'show'])->name('user-guides.show');
    });

    Route::prefix('api/product')->group(function () {
        Route::get('/list', [ProductController::class, 'list'])->name('api.product.list');
    });

    Route::prefix('reports')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/products', [ReportController::class, 'products'])->name('reports.products');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

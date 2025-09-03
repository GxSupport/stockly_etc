<?php

use App\Http\Controllers\EmployeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\WarehouseTypeController;
use App\Http\Controllers\DocumentTypeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::prefix('employees')->group(function () {
        Route::get('/', [EmployeController::class, 'index'])->name('employees.index');
        Route::get('/create', [EmployeController::class, 'create'])->name('employees.create');
        Route::post('/create', [EmployeController::class, 'store'])->name('employees.store');
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
    });
    
    // Temporary routes for documents - will be replaced with controller in backend phase
    Route::prefix('documents')->group(function () {
        Route::get('/', function () {
            return Inertia::render('documents');
        })->name('documents.index');
        Route::get('/create', function () {
            return Inertia::render('documents/create');
        })->name('documents.create');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

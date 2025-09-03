# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

## Project Overview

This is a Laravel project with a React frontend. The project appears to be a stock management system called "Stockly".

### Technology Stack

*   **Backend**: Laravel 12 with PHP 8.4, MYSQL database
*   **Frontend**: React 19 + TypeScript with Inertia.js v2
*   **Styling**: Tailwind CSS v4 with Radix UI components
*   **Testing**: Pest v4 with browser testing capabilities
*   **Build**: Vite with Laravel Wayfinder for type-safe routing

### Key Features

*   **Authentication**: Complete auth system with email verification
*   **Settings**: User profile and password management
*   **Theming**: Light/dark mode with appearance management
*   **Type Safety**: Wayfinder provides end-to-end type safety between Laravel routes and React
*   **Testing**: Comprehensive test suite with browser testing via Pest v4
*   **Management Modules**: Employee, Department, and Warehouse management with CRUD operations
*   **Pagination**: Smart pagination system for large datasets with ellipsis navigation
*   **Search**: Server-side search functionality across all management modules
*   **Searchable Components**: Custom searchable select components with filtering

## Building and Running

### Frontend Development

*   `npm run dev` - Start Vite development server
*   `npm run build` - Build production assets
*   `npm run build:ssr` - Build with SSR support
*   `npm run lint` - Run ESLint with auto-fix
*   `npm run format` - Format code with Prettier
*   `npm run format:check` - Check code formatting
*   `npm run types` - Run TypeScript type checking

### Backend Development

*   `composer run dev` - Start full development environment (server, queue, logs, vite)
*   `composer run dev:ssr` - Start development with SSR
*   `composer run test` - Run all tests (clears config first)
*   `php artisan test` - Run tests directly
*   `php artisan test --filter=testName` - Run specific test
*   `php artisan test tests/Feature/ExampleTest.php` - Run specific test file
*   `vendor/bin/pint --dirty` - Format PHP code (required before commits)

## Architecture Overview

### Directory Structure

*   **Frontend Components**: `resources/js/components/` - Reusable UI components
*   **Pages**: `resources/js/pages/` - Inertia page components
*   **Layouts**: `resources/js/layouts/` - Layout components (auth, app, settings)
*   **UI Components**: `resources/js/components/ui/` - Shadcn/ui style components
*   **Actions**: `resources/js/actions/` - Wayfinder-generated type-safe route actions
*   **Routes**: `resources/js/routes/` - Client-side route definitions
*   **Controllers**: `app/Http/Controllers/` - Laravel controllers for API endpoints
*   **Services**: `app/Services/` - Business logic layer with service classes
*   **Requests**: `app/Http/Requests/` - Form validation request classes
*   **Models**: `app/Models/` - Eloquent models with relationships and casts

### Component Architecture

*   Uses Radix UI primitives for accessibility
*   Tailwind v4 for styling (imports via `@import "tailwindcss"`)
*   Custom hooks for mobile navigation, appearance, and utilities
*   Modular layout system with sidebar and header layouts
*   SearchableSelect component for dropdown filtering
*   Smart pagination component with ellipsis for large datasets
*   Consistent Russian UI text across all management modules
*   Phone number formatting for Uzbekistan format (+998 90 123 45 67)

## Management Modules

### Employee Management

*   **Model**: `Employee` with relationships to `Role`
*   **Features**: Name/phone search, role-based coloring, phone formatting
*   **Validation**: Required name/phone, role selection with searchable dropdown
*   **Files**: `employees.tsx`, `employees/create.tsx`, `EmployeController.php`, `EmployeService.php`

### Department Management

*   **Model**: `DepList` with unique department codes
*   **Features**: Code/title search, unique dep_code validation
*   **Validation**: Required dep_code (unique), title, uppercase code formatting
*   **Files**: `departments.tsx`, `departments/create.tsx`, `DepartmentController.php`, `DepListService.php`

### Warehouse Management

*   **Model**: `Warehouse` with relationships to `WarehouseType`
*   **Features**: Code/title search, type classification, optional comments
*   **Validation**: Required code/title/type, type selection with searchable dropdown
*   **Files**: `warehouses.tsx`, `warehouses/create.tsx`, `WarehouseController.php`, `WarehouseService.php`

### Common Features

*   Server-side pagination with smart UI (max 5 visible pages + ellipsis)
*   Real-time search with debouncing
*   Activate/deactivate functionality with optimistic UI updates
*   Consistent Russian interface text
*   Breadcrumb navigation
*   Form validation with custom error messages

## Routing & Navigation

*   Laravel Wayfinder generates type-safe routes in `resources/js/actions/`
*   Inertia.js handles SPA-like navigation
*   Route definitions split across `routes/web.php`, `routes/auth.php`, `routes/settings.php`
*   Management module routes:
    *   `/employees` - Employee list with search and pagination
    *   `/employees/create` - Employee creation form
    *   `/departments` - Department list with search and pagination
    *   `/departments/create` - Department creation form
    *   `/warehouses` - Warehouse list with search and pagination
    *   `/warehouses/create` - Warehouse creation form

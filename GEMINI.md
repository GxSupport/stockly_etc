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

### Document Management

This is a core feature for managing acts of installation, dismantling, and write-offs.

*   **Models**:
    *   `Documents`: The main model for the document.
    *   `DocumentPriority`: This model is crucial as it defines the workflow/approval chain for each document. The "status" of a document is represented by a series of `DocumentPriority` records.

*   **Backend Logic**:
    *   The business logic is heavily abstracted into `DocumentService`.
    *   The `list` method in the service for the `sent` tab uses a complex query joining `Documents` with `DocumentPriority` to determine which documents are visible to which user role.
    *   The backend now correctly eager-loads the `priority` relationship so the frontend can display the workflow status.

*   **Frontend UI & Logic**:
    *   **List Page (`documents.tsx`)**:
        *   Features a tabbed view for `draft`, `sent`, and `return` statuses.
        *   Tab visibility is role-based (typically for `admin` and `frp` roles).
        *   The "Статус" (Status) column displays the approval chain by iterating over the `document.priority` array and showing a `<Badge>` for each step. The badge is green (`default`) if approved (`user_id` exists) and grey (`secondary`) otherwise.
        *   The entire table row is clickable. The navigation logic is complex:
            *   In the `draft` and `return` tabs, a click always navigates to the `edit` page.
            *   In the `sent` tab, a click navigates to the `edit` page if `document.status` is 0 or 3, and to the `show` page otherwise.
    *   **Create/Edit Forms (`DocumentForm.tsx`)**:
        *   The form logic is encapsulated in a reusable component located at `resources/js/components/documents/DocumentForm.tsx`.
        *   The `create.tsx` and `edit.tsx` pages are simple wrappers around this reusable form.
        *   The form handles different document types (installation, dismantling, write-off) with conditional UI fields.
        *   It uses the `useForm` hook from Inertia for state management.
        *   The document number is dynamically prefixed with the current year.
        *   It contains special logic for "dismantling" (type 2) that involves fetching a `composition` list from the server.
        *   It transforms data before submission (e.g., clearing the `measure` field for dismantling documents).

*   **Key Files**:
    *   `routes/web.php`: Defines the routes for `/documents`.
    *   `app/Http/Controllers/DocumentController.php`: Handles the HTTP requests.
    *   `app/Services/DocumentService.php`: Contains the core backend business logic.
    *   `app/Models/Documents.php`: Eloquent model.
    *   `app/Models/DocumentPriority.php`: Eloquent model for the workflow status.
    *   `resources/js/pages/documents.tsx`: The main list view.
    *   `resources/js/pages/documents/create.tsx`: Wrapper for creating documents.
    *   `resources/js/pages/documents/edit.tsx`: Wrapper for editing documents.
    *   `resources/js/components/documents/DocumentForm.tsx`: The reusable form component.

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
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WarehouseTypeController::index
* @see Http/Controllers/WarehouseTypeController.php:14
* @route '/warehouse-types'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/warehouse-types',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WarehouseTypeController::index
* @see Http/Controllers/WarehouseTypeController.php:14
* @route '/warehouse-types'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseTypeController::index
* @see Http/Controllers/WarehouseTypeController.php:14
* @route '/warehouse-types'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseTypeController::index
* @see Http/Controllers/WarehouseTypeController.php:14
* @route '/warehouse-types'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WarehouseTypeController::index
* @see Http/Controllers/WarehouseTypeController.php:14
* @route '/warehouse-types'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseTypeController::index
* @see Http/Controllers/WarehouseTypeController.php:14
* @route '/warehouse-types'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseTypeController::index
* @see Http/Controllers/WarehouseTypeController.php:14
* @route '/warehouse-types'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\WarehouseTypeController::create
* @see Http/Controllers/WarehouseTypeController.php:31
* @route '/warehouse-types/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/warehouse-types/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WarehouseTypeController::create
* @see Http/Controllers/WarehouseTypeController.php:31
* @route '/warehouse-types/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseTypeController::create
* @see Http/Controllers/WarehouseTypeController.php:31
* @route '/warehouse-types/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseTypeController::create
* @see Http/Controllers/WarehouseTypeController.php:31
* @route '/warehouse-types/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WarehouseTypeController::create
* @see Http/Controllers/WarehouseTypeController.php:31
* @route '/warehouse-types/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseTypeController::create
* @see Http/Controllers/WarehouseTypeController.php:31
* @route '/warehouse-types/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseTypeController::create
* @see Http/Controllers/WarehouseTypeController.php:31
* @route '/warehouse-types/create'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\WarehouseTypeController::store
* @see Http/Controllers/WarehouseTypeController.php:36
* @route '/warehouse-types/create'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/warehouse-types/create',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WarehouseTypeController::store
* @see Http/Controllers/WarehouseTypeController.php:36
* @route '/warehouse-types/create'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseTypeController::store
* @see Http/Controllers/WarehouseTypeController.php:36
* @route '/warehouse-types/create'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WarehouseTypeController::store
* @see Http/Controllers/WarehouseTypeController.php:36
* @route '/warehouse-types/create'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WarehouseTypeController::store
* @see Http/Controllers/WarehouseTypeController.php:36
* @route '/warehouse-types/create'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const WarehouseTypeController = { index, create, store }

export default WarehouseTypeController
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\WarehouseController::search
* @see app/Http/Controllers/WarehouseController.php:37
* @route '/api/warehouses/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/warehouses/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WarehouseController::search
* @see app/Http/Controllers/WarehouseController.php:37
* @route '/api/warehouses/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseController::search
* @see app/Http/Controllers/WarehouseController.php:37
* @route '/api/warehouses/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::search
* @see app/Http/Controllers/WarehouseController.php:37
* @route '/api/warehouses/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WarehouseController::search
* @see app/Http/Controllers/WarehouseController.php:37
* @route '/api/warehouses/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::search
* @see app/Http/Controllers/WarehouseController.php:37
* @route '/api/warehouses/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::search
* @see app/Http/Controllers/WarehouseController.php:37
* @route '/api/warehouses/search'
*/
searchForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

search.form = searchForm

const warehouses = {
    search: Object.assign(search, search),
}

export default warehouses
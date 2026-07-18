import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BasicResourceController::search
* @see app/Http/Controllers/BasicResourceController.php:14
* @route '/api/basic-resources/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/basic-resources/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BasicResourceController::search
* @see app/Http/Controllers/BasicResourceController.php:14
* @route '/api/basic-resources/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BasicResourceController::search
* @see app/Http/Controllers/BasicResourceController.php:14
* @route '/api/basic-resources/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BasicResourceController::search
* @see app/Http/Controllers/BasicResourceController.php:14
* @route '/api/basic-resources/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BasicResourceController::search
* @see app/Http/Controllers/BasicResourceController.php:14
* @route '/api/basic-resources/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BasicResourceController::search
* @see app/Http/Controllers/BasicResourceController.php:14
* @route '/api/basic-resources/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BasicResourceController::search
* @see app/Http/Controllers/BasicResourceController.php:14
* @route '/api/basic-resources/search'
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

/**
* @see \App\Http\Controllers\BasicResourceController::refresh
* @see app/Http/Controllers/BasicResourceController.php:39
* @route '/api/basic-resources/refresh'
*/
export const refresh = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refresh.url(options),
    method: 'post',
})

refresh.definition = {
    methods: ["post"],
    url: '/api/basic-resources/refresh',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BasicResourceController::refresh
* @see app/Http/Controllers/BasicResourceController.php:39
* @route '/api/basic-resources/refresh'
*/
refresh.url = (options?: RouteQueryOptions) => {
    return refresh.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BasicResourceController::refresh
* @see app/Http/Controllers/BasicResourceController.php:39
* @route '/api/basic-resources/refresh'
*/
refresh.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refresh.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BasicResourceController::refresh
* @see app/Http/Controllers/BasicResourceController.php:39
* @route '/api/basic-resources/refresh'
*/
const refreshForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refresh.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BasicResourceController::refresh
* @see app/Http/Controllers/BasicResourceController.php:39
* @route '/api/basic-resources/refresh'
*/
refreshForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: refresh.url(options),
    method: 'post',
})

refresh.form = refreshForm

const BasicResourceController = { search, refresh }

export default BasicResourceController
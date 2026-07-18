import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WarehouseController::index
* @see app/Http/Controllers/WarehouseController.php:20
* @route '/warehouses'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/warehouses',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WarehouseController::index
* @see app/Http/Controllers/WarehouseController.php:20
* @route '/warehouses'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseController::index
* @see app/Http/Controllers/WarehouseController.php:20
* @route '/warehouses'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::index
* @see app/Http/Controllers/WarehouseController.php:20
* @route '/warehouses'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WarehouseController::index
* @see app/Http/Controllers/WarehouseController.php:20
* @route '/warehouses'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::index
* @see app/Http/Controllers/WarehouseController.php:20
* @route '/warehouses'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::index
* @see app/Http/Controllers/WarehouseController.php:20
* @route '/warehouses'
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
* @see \App\Http\Controllers\WarehouseController::create
* @see app/Http/Controllers/WarehouseController.php:82
* @route '/warehouses/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/warehouses/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WarehouseController::create
* @see app/Http/Controllers/WarehouseController.php:82
* @route '/warehouses/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseController::create
* @see app/Http/Controllers/WarehouseController.php:82
* @route '/warehouses/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::create
* @see app/Http/Controllers/WarehouseController.php:82
* @route '/warehouses/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WarehouseController::create
* @see app/Http/Controllers/WarehouseController.php:82
* @route '/warehouses/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::create
* @see app/Http/Controllers/WarehouseController.php:82
* @route '/warehouses/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::create
* @see app/Http/Controllers/WarehouseController.php:82
* @route '/warehouses/create'
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
* @see \App\Http\Controllers\WarehouseController::store
* @see app/Http/Controllers/WarehouseController.php:91
* @route '/warehouses/create'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/warehouses/create',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WarehouseController::store
* @see app/Http/Controllers/WarehouseController.php:91
* @route '/warehouses/create'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseController::store
* @see app/Http/Controllers/WarehouseController.php:91
* @route '/warehouses/create'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WarehouseController::store
* @see app/Http/Controllers/WarehouseController.php:91
* @route '/warehouses/create'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WarehouseController::store
* @see app/Http/Controllers/WarehouseController.php:91
* @route '/warehouses/create'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\WarehouseController::show
* @see app/Http/Controllers/WarehouseController.php:52
* @route '/warehouses/{warehouse}'
*/
export const show = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/warehouses/{warehouse}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WarehouseController::show
* @see app/Http/Controllers/WarehouseController.php:52
* @route '/warehouses/{warehouse}'
*/
show.url = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { warehouse: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { warehouse: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            warehouse: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        warehouse: typeof args.warehouse === 'object'
        ? args.warehouse.id
        : args.warehouse,
    }

    return show.definition.url
            .replace('{warehouse}', parsedArgs.warehouse.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseController::show
* @see app/Http/Controllers/WarehouseController.php:52
* @route '/warehouses/{warehouse}'
*/
show.get = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::show
* @see app/Http/Controllers/WarehouseController.php:52
* @route '/warehouses/{warehouse}'
*/
show.head = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WarehouseController::show
* @see app/Http/Controllers/WarehouseController.php:52
* @route '/warehouses/{warehouse}'
*/
const showForm = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::show
* @see app/Http/Controllers/WarehouseController.php:52
* @route '/warehouses/{warehouse}'
*/
showForm.get = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::show
* @see app/Http/Controllers/WarehouseController.php:52
* @route '/warehouses/{warehouse}'
*/
showForm.head = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

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

/**
* @see \App\Http\Controllers\WarehouseController::products
* @see app/Http/Controllers/WarehouseController.php:61
* @route '/api/warehouses/{warehouse}/products'
*/
export const products = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: products.url(args, options),
    method: 'get',
})

products.definition = {
    methods: ["get","head"],
    url: '/api/warehouses/{warehouse}/products',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WarehouseController::products
* @see app/Http/Controllers/WarehouseController.php:61
* @route '/api/warehouses/{warehouse}/products'
*/
products.url = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { warehouse: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { warehouse: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            warehouse: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        warehouse: typeof args.warehouse === 'object'
        ? args.warehouse.id
        : args.warehouse,
    }

    return products.definition.url
            .replace('{warehouse}', parsedArgs.warehouse.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseController::products
* @see app/Http/Controllers/WarehouseController.php:61
* @route '/api/warehouses/{warehouse}/products'
*/
products.get = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: products.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::products
* @see app/Http/Controllers/WarehouseController.php:61
* @route '/api/warehouses/{warehouse}/products'
*/
products.head = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: products.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WarehouseController::products
* @see app/Http/Controllers/WarehouseController.php:61
* @route '/api/warehouses/{warehouse}/products'
*/
const productsForm = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: products.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::products
* @see app/Http/Controllers/WarehouseController.php:61
* @route '/api/warehouses/{warehouse}/products'
*/
productsForm.get = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: products.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseController::products
* @see app/Http/Controllers/WarehouseController.php:61
* @route '/api/warehouses/{warehouse}/products'
*/
productsForm.head = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: products.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

products.form = productsForm

const WarehouseController = { index, create, store, show, search, products }

export default WarehouseController
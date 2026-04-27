import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::create
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
export const create = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/verify-otp/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::create
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
create.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return create.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::create
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
create.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::create
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
create.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::create
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
const createForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::create
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
createForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::create
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
createForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::store
* @see Http/Controllers/Auth/VerifyOtpController.php:46
* @route '/verify-otp'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/verify-otp',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::store
* @see Http/Controllers/Auth/VerifyOtpController.php:46
* @route '/verify-otp'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::store
* @see Http/Controllers/Auth/VerifyOtpController.php:46
* @route '/verify-otp'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::store
* @see Http/Controllers/Auth/VerifyOtpController.php:46
* @route '/verify-otp'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::store
* @see Http/Controllers/Auth/VerifyOtpController.php:46
* @route '/verify-otp'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const VerifyOtpController = { create, store }

export default VerifyOtpController
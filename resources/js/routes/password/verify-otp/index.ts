import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
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

const verifyOtp = {
    store: Object.assign(store, store),
}

export default verifyOtp
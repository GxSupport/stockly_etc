import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import verifyOtpAd0e73 from './verify-otp'
import confirmD7e05f from './confirm'
/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/password',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Settings\PasswordController::update
* @see Http/Controllers/Settings/PasswordController.php:26
* @route '/settings/password'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/settings/password',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\PasswordController::update
* @see Http/Controllers/Settings/PasswordController.php:26
* @route '/settings/password'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PasswordController::update
* @see Http/Controllers/Settings/PasswordController.php:26
* @route '/settings/password'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::update
* @see Http/Controllers/Settings/PasswordController.php:26
* @route '/settings/password'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::update
* @see Http/Controllers/Settings/PasswordController.php:26
* @route '/settings/password'
*/
updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::request
* @see Http/Controllers/Auth/PasswordResetLinkController.php:26
* @route '/forgot-password'
*/
export const request = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: request.url(options),
    method: 'get',
})

request.definition = {
    methods: ["get","head"],
    url: '/forgot-password',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::request
* @see Http/Controllers/Auth/PasswordResetLinkController.php:26
* @route '/forgot-password'
*/
request.url = (options?: RouteQueryOptions) => {
    return request.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::request
* @see Http/Controllers/Auth/PasswordResetLinkController.php:26
* @route '/forgot-password'
*/
request.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: request.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::request
* @see Http/Controllers/Auth/PasswordResetLinkController.php:26
* @route '/forgot-password'
*/
request.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: request.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::request
* @see Http/Controllers/Auth/PasswordResetLinkController.php:26
* @route '/forgot-password'
*/
const requestForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: request.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::request
* @see Http/Controllers/Auth/PasswordResetLinkController.php:26
* @route '/forgot-password'
*/
requestForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: request.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::request
* @see Http/Controllers/Auth/PasswordResetLinkController.php:26
* @route '/forgot-password'
*/
requestForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: request.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

request.form = requestForm

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::phone
* @see Http/Controllers/Auth/PasswordResetLinkController.php:36
* @route '/forgot-password'
*/
export const phone = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: phone.url(options),
    method: 'post',
})

phone.definition = {
    methods: ["post"],
    url: '/forgot-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::phone
* @see Http/Controllers/Auth/PasswordResetLinkController.php:36
* @route '/forgot-password'
*/
phone.url = (options?: RouteQueryOptions) => {
    return phone.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::phone
* @see Http/Controllers/Auth/PasswordResetLinkController.php:36
* @route '/forgot-password'
*/
phone.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: phone.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::phone
* @see Http/Controllers/Auth/PasswordResetLinkController.php:36
* @route '/forgot-password'
*/
const phoneForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: phone.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::phone
* @see Http/Controllers/Auth/PasswordResetLinkController.php:36
* @route '/forgot-password'
*/
phoneForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: phone.url(options),
    method: 'post',
})

phone.form = phoneForm

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::verifyOtp
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
export const verifyOtp = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verifyOtp.url(args, options),
    method: 'get',
})

verifyOtp.definition = {
    methods: ["get","head"],
    url: '/verify-otp/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::verifyOtp
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
verifyOtp.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return verifyOtp.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::verifyOtp
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
verifyOtp.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verifyOtp.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::verifyOtp
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
verifyOtp.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verifyOtp.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::verifyOtp
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
const verifyOtpForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: verifyOtp.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::verifyOtp
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
verifyOtpForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: verifyOtp.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\VerifyOtpController::verifyOtp
* @see Http/Controllers/Auth/VerifyOtpController.php:19
* @route '/verify-otp/{token}'
*/
verifyOtpForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: verifyOtp.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

verifyOtp.form = verifyOtpForm

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::reset
* @see Http/Controllers/Auth/NewPasswordController.php:23
* @route '/reset-password/{token}'
*/
export const reset = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reset.url(args, options),
    method: 'get',
})

reset.definition = {
    methods: ["get","head"],
    url: '/reset-password/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::reset
* @see Http/Controllers/Auth/NewPasswordController.php:23
* @route '/reset-password/{token}'
*/
reset.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reset.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::reset
* @see Http/Controllers/Auth/NewPasswordController.php:23
* @route '/reset-password/{token}'
*/
reset.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reset.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::reset
* @see Http/Controllers/Auth/NewPasswordController.php:23
* @route '/reset-password/{token}'
*/
reset.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reset.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::reset
* @see Http/Controllers/Auth/NewPasswordController.php:23
* @route '/reset-password/{token}'
*/
const resetForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reset.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::reset
* @see Http/Controllers/Auth/NewPasswordController.php:23
* @route '/reset-password/{token}'
*/
resetForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reset.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::reset
* @see Http/Controllers/Auth/NewPasswordController.php:23
* @route '/reset-password/{token}'
*/
resetForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reset.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

reset.form = resetForm

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::store
* @see Http/Controllers/Auth/NewPasswordController.php:54
* @route '/reset-password'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/reset-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::store
* @see Http/Controllers/Auth/NewPasswordController.php:54
* @route '/reset-password'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::store
* @see Http/Controllers/Auth/NewPasswordController.php:54
* @route '/reset-password'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::store
* @see Http/Controllers/Auth/NewPasswordController.php:54
* @route '/reset-password'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::store
* @see Http/Controllers/Auth/NewPasswordController.php:54
* @route '/reset-password'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Auth\ConfirmablePasswordController::confirm
* @see Http/Controllers/Auth/ConfirmablePasswordController.php:18
* @route '/confirm-password'
*/
export const confirm = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: confirm.url(options),
    method: 'get',
})

confirm.definition = {
    methods: ["get","head"],
    url: '/confirm-password',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\ConfirmablePasswordController::confirm
* @see Http/Controllers/Auth/ConfirmablePasswordController.php:18
* @route '/confirm-password'
*/
confirm.url = (options?: RouteQueryOptions) => {
    return confirm.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\ConfirmablePasswordController::confirm
* @see Http/Controllers/Auth/ConfirmablePasswordController.php:18
* @route '/confirm-password'
*/
confirm.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: confirm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\ConfirmablePasswordController::confirm
* @see Http/Controllers/Auth/ConfirmablePasswordController.php:18
* @route '/confirm-password'
*/
confirm.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: confirm.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\ConfirmablePasswordController::confirm
* @see Http/Controllers/Auth/ConfirmablePasswordController.php:18
* @route '/confirm-password'
*/
const confirmForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: confirm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\ConfirmablePasswordController::confirm
* @see Http/Controllers/Auth/ConfirmablePasswordController.php:18
* @route '/confirm-password'
*/
confirmForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: confirm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\ConfirmablePasswordController::confirm
* @see Http/Controllers/Auth/ConfirmablePasswordController.php:18
* @route '/confirm-password'
*/
confirmForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: confirm.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

confirm.form = confirmForm

const password = {
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    request: Object.assign(request, request),
    phone: Object.assign(phone, phone),
    verifyOtp: Object.assign(verifyOtp, verifyOtpAd0e73),
    reset: Object.assign(reset, reset),
    store: Object.assign(store, store),
    confirm: Object.assign(confirm, confirmD7e05f),
}

export default password
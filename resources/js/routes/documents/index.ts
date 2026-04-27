import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
/**
* @see \App\Http\Controllers\DocumentController::index
* @see Http/Controllers/DocumentController.php:30
* @route '/documents/{status?}'
*/
export const index = (args?: { status?: string | number } | [status: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/documents/{status?}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentController::index
* @see Http/Controllers/DocumentController.php:30
* @route '/documents/{status?}'
*/
index.url = (args?: { status?: string | number } | [status: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { status: args }
    }

    if (Array.isArray(args)) {
        args = {
            status: args[0],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "status",
    ])

    const parsedArgs = {
        status: args?.status,
    }

    return index.definition.url
            .replace('{status?}', parsedArgs.status?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::index
* @see Http/Controllers/DocumentController.php:30
* @route '/documents/{status?}'
*/
index.get = (args?: { status?: string | number } | [status: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::index
* @see Http/Controllers/DocumentController.php:30
* @route '/documents/{status?}'
*/
index.head = (args?: { status?: string | number } | [status: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocumentController::index
* @see Http/Controllers/DocumentController.php:30
* @route '/documents/{status?}'
*/
const indexForm = (args?: { status?: string | number } | [status: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::index
* @see Http/Controllers/DocumentController.php:30
* @route '/documents/{status?}'
*/
indexForm.get = (args?: { status?: string | number } | [status: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::index
* @see Http/Controllers/DocumentController.php:30
* @route '/documents/{status?}'
*/
indexForm.head = (args?: { status?: string | number } | [status: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\DocumentController::create
* @see Http/Controllers/DocumentController.php:73
* @route '/documents/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/documents/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentController::create
* @see Http/Controllers/DocumentController.php:73
* @route '/documents/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::create
* @see Http/Controllers/DocumentController.php:73
* @route '/documents/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::create
* @see Http/Controllers/DocumentController.php:73
* @route '/documents/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocumentController::create
* @see Http/Controllers/DocumentController.php:73
* @route '/documents/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::create
* @see Http/Controllers/DocumentController.php:73
* @route '/documents/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::create
* @see Http/Controllers/DocumentController.php:73
* @route '/documents/create'
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
* @see \App\Http\Controllers\DocumentController::store
* @see Http/Controllers/DocumentController.php:159
* @route '/documents/create'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/documents/create',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DocumentController::store
* @see Http/Controllers/DocumentController.php:159
* @route '/documents/create'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::store
* @see Http/Controllers/DocumentController.php:159
* @route '/documents/create'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::store
* @see Http/Controllers/DocumentController.php:159
* @route '/documents/create'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::store
* @see Http/Controllers/DocumentController.php:159
* @route '/documents/create'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\DocumentController::edit
* @see Http/Controllers/DocumentController.php:223
* @route '/documents/{id}/edit'
*/
export const edit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/documents/{id}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentController::edit
* @see Http/Controllers/DocumentController.php:223
* @route '/documents/{id}/edit'
*/
edit.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return edit.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::edit
* @see Http/Controllers/DocumentController.php:223
* @route '/documents/{id}/edit'
*/
edit.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::edit
* @see Http/Controllers/DocumentController.php:223
* @route '/documents/{id}/edit'
*/
edit.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocumentController::edit
* @see Http/Controllers/DocumentController.php:223
* @route '/documents/{id}/edit'
*/
const editForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::edit
* @see Http/Controllers/DocumentController.php:223
* @route '/documents/{id}/edit'
*/
editForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::edit
* @see Http/Controllers/DocumentController.php:223
* @route '/documents/{id}/edit'
*/
editForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\DocumentController::update
* @see Http/Controllers/DocumentController.php:283
* @route '/documents/{id}'
*/
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/documents/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DocumentController::update
* @see Http/Controllers/DocumentController.php:283
* @route '/documents/{id}'
*/
update.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return update.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::update
* @see Http/Controllers/DocumentController.php:283
* @route '/documents/{id}'
*/
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\DocumentController::update
* @see Http/Controllers/DocumentController.php:283
* @route '/documents/{id}'
*/
const updateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::update
* @see Http/Controllers/DocumentController.php:283
* @route '/documents/{id}'
*/
updateForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\DocumentController::show
* @see Http/Controllers/DocumentController.php:182
* @route '/documents/{id}'
*/
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/documents/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentController::show
* @see Http/Controllers/DocumentController.php:182
* @route '/documents/{id}'
*/
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::show
* @see Http/Controllers/DocumentController.php:182
* @route '/documents/{id}'
*/
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::show
* @see Http/Controllers/DocumentController.php:182
* @route '/documents/{id}'
*/
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocumentController::show
* @see Http/Controllers/DocumentController.php:182
* @route '/documents/{id}'
*/
const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::show
* @see Http/Controllers/DocumentController.php:182
* @route '/documents/{id}'
*/
showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::show
* @see Http/Controllers/DocumentController.php:182
* @route '/documents/{id}'
*/
showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\DocumentController::getComposition
* @see Http/Controllers/DocumentController.php:136
* @route '/documents/get-composition'
*/
export const getComposition = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: getComposition.url(options),
    method: 'post',
})

getComposition.definition = {
    methods: ["post"],
    url: '/documents/get-composition',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DocumentController::getComposition
* @see Http/Controllers/DocumentController.php:136
* @route '/documents/get-composition'
*/
getComposition.url = (options?: RouteQueryOptions) => {
    return getComposition.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::getComposition
* @see Http/Controllers/DocumentController.php:136
* @route '/documents/get-composition'
*/
getComposition.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: getComposition.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::getComposition
* @see Http/Controllers/DocumentController.php:136
* @route '/documents/get-composition'
*/
const getCompositionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: getComposition.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::getComposition
* @see Http/Controllers/DocumentController.php:136
* @route '/documents/get-composition'
*/
getCompositionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: getComposition.url(options),
    method: 'post',
})

getComposition.form = getCompositionForm

/**
* @see \App\Http\Controllers\DocumentController::checkSms
* @see Http/Controllers/DocumentController.php:321
* @route '/documents/{id}/check-sms'
*/
export const checkSms = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkSms.url(args, options),
    method: 'get',
})

checkSms.definition = {
    methods: ["get","head"],
    url: '/documents/{id}/check-sms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentController::checkSms
* @see Http/Controllers/DocumentController.php:321
* @route '/documents/{id}/check-sms'
*/
checkSms.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return checkSms.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::checkSms
* @see Http/Controllers/DocumentController.php:321
* @route '/documents/{id}/check-sms'
*/
checkSms.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkSms.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::checkSms
* @see Http/Controllers/DocumentController.php:321
* @route '/documents/{id}/check-sms'
*/
checkSms.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkSms.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocumentController::checkSms
* @see Http/Controllers/DocumentController.php:321
* @route '/documents/{id}/check-sms'
*/
const checkSmsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkSms.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::checkSms
* @see Http/Controllers/DocumentController.php:321
* @route '/documents/{id}/check-sms'
*/
checkSmsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkSms.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentController::checkSms
* @see Http/Controllers/DocumentController.php:321
* @route '/documents/{id}/check-sms'
*/
checkSmsForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkSms.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

checkSms.form = checkSmsForm

/**
* @see \App\Http\Controllers\DocumentController::sendOtp
* @see Http/Controllers/DocumentController.php:342
* @route '/documents/send-otp'
*/
export const sendOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendOtp.url(options),
    method: 'post',
})

sendOtp.definition = {
    methods: ["post"],
    url: '/documents/send-otp',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DocumentController::sendOtp
* @see Http/Controllers/DocumentController.php:342
* @route '/documents/send-otp'
*/
sendOtp.url = (options?: RouteQueryOptions) => {
    return sendOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::sendOtp
* @see Http/Controllers/DocumentController.php:342
* @route '/documents/send-otp'
*/
sendOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::sendOtp
* @see Http/Controllers/DocumentController.php:342
* @route '/documents/send-otp'
*/
const sendOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::sendOtp
* @see Http/Controllers/DocumentController.php:342
* @route '/documents/send-otp'
*/
sendOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendOtp.url(options),
    method: 'post',
})

sendOtp.form = sendOtpForm

/**
* @see \App\Http\Controllers\DocumentController::confirmCode
* @see Http/Controllers/DocumentController.php:402
* @route '/documents/{id}/confirm-code'
*/
export const confirmCode = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmCode.url(args, options),
    method: 'post',
})

confirmCode.definition = {
    methods: ["post"],
    url: '/documents/{id}/confirm-code',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DocumentController::confirmCode
* @see Http/Controllers/DocumentController.php:402
* @route '/documents/{id}/confirm-code'
*/
confirmCode.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return confirmCode.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::confirmCode
* @see Http/Controllers/DocumentController.php:402
* @route '/documents/{id}/confirm-code'
*/
confirmCode.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmCode.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::confirmCode
* @see Http/Controllers/DocumentController.php:402
* @route '/documents/{id}/confirm-code'
*/
const confirmCodeForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirmCode.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::confirmCode
* @see Http/Controllers/DocumentController.php:402
* @route '/documents/{id}/confirm-code'
*/
confirmCodeForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirmCode.url(args, options),
    method: 'post',
})

confirmCode.form = confirmCodeForm

/**
* @see \App\Http\Controllers\DocumentController::rejectCode
* @see Http/Controllers/DocumentController.php:460
* @route '/documents/{id}/reject-code'
*/
export const rejectCode = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectCode.url(args, options),
    method: 'post',
})

rejectCode.definition = {
    methods: ["post"],
    url: '/documents/{id}/reject-code',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DocumentController::rejectCode
* @see Http/Controllers/DocumentController.php:460
* @route '/documents/{id}/reject-code'
*/
rejectCode.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return rejectCode.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::rejectCode
* @see Http/Controllers/DocumentController.php:460
* @route '/documents/{id}/reject-code'
*/
rejectCode.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectCode.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::rejectCode
* @see Http/Controllers/DocumentController.php:460
* @route '/documents/{id}/reject-code'
*/
const rejectCodeForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectCode.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::rejectCode
* @see Http/Controllers/DocumentController.php:460
* @route '/documents/{id}/reject-code'
*/
rejectCodeForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectCode.url(args, options),
    method: 'post',
})

rejectCode.form = rejectCodeForm

/**
* @see \App\Http\Controllers\DocumentController::sendToNext
* @see Http/Controllers/DocumentController.php:520
* @route '/documents/{id}/send-to-next'
*/
export const sendToNext = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendToNext.url(args, options),
    method: 'post',
})

sendToNext.definition = {
    methods: ["post"],
    url: '/documents/{id}/send-to-next',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DocumentController::sendToNext
* @see Http/Controllers/DocumentController.php:520
* @route '/documents/{id}/send-to-next'
*/
sendToNext.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return sendToNext.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentController::sendToNext
* @see Http/Controllers/DocumentController.php:520
* @route '/documents/{id}/send-to-next'
*/
sendToNext.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendToNext.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::sendToNext
* @see Http/Controllers/DocumentController.php:520
* @route '/documents/{id}/send-to-next'
*/
const sendToNextForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendToNext.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DocumentController::sendToNext
* @see Http/Controllers/DocumentController.php:520
* @route '/documents/{id}/send-to-next'
*/
sendToNextForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendToNext.url(args, options),
    method: 'post',
})

sendToNext.form = sendToNextForm

const documents = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    show: Object.assign(show, show),
    getComposition: Object.assign(getComposition, getComposition),
    checkSms: Object.assign(checkSms, checkSms),
    sendOtp: Object.assign(sendOtp, sendOtp),
    confirmCode: Object.assign(confirmCode, confirmCode),
    rejectCode: Object.assign(rejectCode, rejectCode),
    sendToNext: Object.assign(sendToNext, sendToNext),
}

export default documents
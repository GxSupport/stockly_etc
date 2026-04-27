import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\UserController::updateChatId
* @see Http/Controllers/UserController.php:10
* @route '/user/chat-id'
*/
export const updateChatId = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateChatId.url(options),
    method: 'put',
})

updateChatId.definition = {
    methods: ["put"],
    url: '/user/chat-id',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\UserController::updateChatId
* @see Http/Controllers/UserController.php:10
* @route '/user/chat-id'
*/
updateChatId.url = (options?: RouteQueryOptions) => {
    return updateChatId.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::updateChatId
* @see Http/Controllers/UserController.php:10
* @route '/user/chat-id'
*/
updateChatId.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateChatId.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\UserController::updateChatId
* @see Http/Controllers/UserController.php:10
* @route '/user/chat-id'
*/
const updateChatIdForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateChatId.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::updateChatId
* @see Http/Controllers/UserController.php:10
* @route '/user/chat-id'
*/
updateChatIdForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateChatId.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateChatId.form = updateChatIdForm

const user = {
    updateChatId: Object.assign(updateChatId, updateChatId),
}

export default user
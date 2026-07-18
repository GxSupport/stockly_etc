import product from './product'
import basicResources from './basic-resources'

const api = {
    product: Object.assign(product, product),
    basicResources: Object.assign(basicResources, basicResources),
}

export default api
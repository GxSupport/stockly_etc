import product from './product'
import basicResources from './basic-resources'
import warehouses from './warehouses'

const api = {
    product: Object.assign(product, product),
    basicResources: Object.assign(basicResources, basicResources),
    warehouses: Object.assign(warehouses, warehouses),
}

export default api
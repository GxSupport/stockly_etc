import DashboardController from './DashboardController'
import UserController from './UserController'
import EmployeController from './EmployeController'
import DepartmentController from './DepartmentController'
import WarehouseController from './WarehouseController'
import WarehouseTypeController from './WarehouseTypeController'
import DocumentTypeController from './DocumentTypeController'
import DocumentController from './DocumentController'
import GuideController from './GuideController'
import ProductController from './ProductController'
import ReportController from './ReportController'
import Settings from './Settings'
import Auth from './Auth'

const Controllers = {
    DashboardController: Object.assign(DashboardController, DashboardController),
    UserController: Object.assign(UserController, UserController),
    EmployeController: Object.assign(EmployeController, EmployeController),
    DepartmentController: Object.assign(DepartmentController, DepartmentController),
    WarehouseController: Object.assign(WarehouseController, WarehouseController),
    WarehouseTypeController: Object.assign(WarehouseTypeController, WarehouseTypeController),
    DocumentTypeController: Object.assign(DocumentTypeController, DocumentTypeController),
    DocumentController: Object.assign(DocumentController, DocumentController),
    GuideController: Object.assign(GuideController, GuideController),
    ProductController: Object.assign(ProductController, ProductController),
    ReportController: Object.assign(ReportController, ReportController),
    Settings: Object.assign(Settings, Settings),
    Auth: Object.assign(Auth, Auth),
}

export default Controllers
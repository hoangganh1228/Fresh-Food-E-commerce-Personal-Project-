const systemConfig = require("../../config/system")
const authMiddleware = require("../../middlewares/admin/auth.middleware");

const dashboardRoute = require("./dashboard.route");
const productsRoute = require("./products.route");
const productCategoryRoutes  = require("./product-category.route")
const roleRoutes = require("./role.route");
const accountRoutes = require("./account.route");
const authRoutes = require("./auth.route");

module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin;

    app.use(
        PATH_ADMIN + "/dashboard", 
        authMiddleware.requireAuth,
        dashboardRoute
    );

    app.use(PATH_ADMIN + "/products", authMiddleware.requireAuth, productsRoute)
    
    app.use(PATH_ADMIN + "/products-category", authMiddleware.requireAuth, productCategoryRoutes)

    app.use(PATH_ADMIN + "/roles", roleRoutes)

    app.use(PATH_ADMIN + "/accounts", accountRoutes)

    app.use(PATH_ADMIN + "/auth", authRoutes)

    
}
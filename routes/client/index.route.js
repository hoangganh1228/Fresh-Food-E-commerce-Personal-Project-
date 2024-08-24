const categoryMiddleware =  require("../../middlewares/client/category.middleware");

const productRoute = require("./products.route");
const homeRoute = require("./home.route");
const searchRoutes = require("./search.route");

module.exports = (app) => {
    app.use(categoryMiddleware.category)

    app.use("/", homeRoute)
    
    app.use("/products", productRoute);

    app.use("/search", searchRoutes);
    
}
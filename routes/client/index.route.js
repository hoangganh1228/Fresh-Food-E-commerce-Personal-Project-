const categoryMiddleware =  require("../../middlewares/client/category.middleware");
const cartMiddleware =  require("../../middlewares/client/cart.middleware");

const productRoute = require("./products.route");
const homeRoute = require("./home.route");
const searchRoutes = require("./search.route");
const cartRoutes = require("./cart.route");
const checkoutRoutes = require("./checkout.route");

module.exports = (app) => {
    app.use(categoryMiddleware.category);
    app.use(cartMiddleware.cartId);

    app.use("/", homeRoute)
    
    app.use("/products", productRoute);

    app.use("/search", searchRoutes);
    
    app.use("/cart", cartRoutes);

    app.use("/checkout", checkoutRoutes);
}
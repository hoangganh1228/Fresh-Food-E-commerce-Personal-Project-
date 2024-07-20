const Product = require("../../models/products.model")

module.exports.index = async (req, res) => {

    let find = {
        status: "active",
        deleted: false
    }

    const products = await Product.find(find);

    products.map(item => {
        item.newPrice = (item.price - item.price * (item.discountPercentage / 100)).toFixed(0);
        return item;
    });
    
    

    res.render("client/pages/products/index", {
        pageTitle: "Trang chủ",
        products: products
    })
}
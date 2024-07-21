const Product = require("../../models/products.model")

module.exports.index = async (req, res) => {
    let find = {
        deleted: "false",
    }

    const products = await Product.find(find);
    // console.log(products);

    res.render("admin/pages/products/index", {
        pageTitle: "Trang sản phẩm",
        products: products
    })
}
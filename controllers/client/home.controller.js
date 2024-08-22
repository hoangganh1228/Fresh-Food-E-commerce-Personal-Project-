const Product = require("../../models/products.model")

const productHelper = require("../../helpers/products")

module.exports.index = async (req, res) => {
    // Lấy ra sản phẩm nổi bật 

    const productsFeatured = await Product.find({
        featured: "1",
        deleted: false,
        status: "active"
    }).limit(6)

    const newProductsFeatured = productHelper.priceNewProducts(productsFeatured);
    
    // Hết lấy ra sản phẩm nổi bật
    
    // Hiển thị danh sách sản phẩm mới nhất
    const productsNew = await Product.find({
        status: "active",
        deleted: false
    }).limit(6);

    

    const newProductsNew = productHelper.priceNewProducts(productsNew);
    // Hết hiển thị danh sách sản phẩm mới nhất

    res.render("client/pages/home/index", {
        pageTitle: "Trang chủ",
        productsFeatured: newProductsFeatured,
        productsNew: newProductsNew
    })
}


const Product = require("../../models/products.model")
const ProductCategory = require("../../models/product-category.model");

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

module.exports.detail = async (req, res) => {
    
    try {
        let find = {
            slug: req.params.slug,
            deleted: false
        }
    
        const product = await Product.findOne(find);
    
        res.render("client/pages/products/detail", {
            pageTitle: product.title,
            product: product
        }) 
        
    } catch (error) {
        req.flash("error", `Không tồn tại sản phẩm này!`)

        res.redirect(`/products`)
    }

}
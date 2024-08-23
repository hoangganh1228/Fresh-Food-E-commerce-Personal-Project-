const Product = require("../../models/products.model")
const ProductCategory = require("../../models/product-category.model");

const createTreeHelper = require("../../helpers/createTree");   
const productHelper = require("../../helpers/products")

const productsCategoryHelper = require("../../helpers/products-category");

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
            slug: req.params.slugCategory,
            deleted: false
        }
    
        const product = await Product.findOne(find);

        if(product.product_category_id) {
            const category = await Product.findOne({
                _id: product.product_category_id,
                deleted: false,
                status: "active"
            })

            product.category = category;
        }

        product.priceNew = productHelper.priceNewProduct(product);
    
        res.render("client/pages/products/detail", {
            pageTitle: product.title,
            product: product
        }) 
        
    } catch (error) {
        req.flash("error", `Không tồn tại sản phẩm này!`)

        res.redirect(`/products`)
    }

}

// [GET] /detail/router.get("/:slugCategory", controller.category);
module.exports.category = async (req, res) => {
    try {
        const category = await ProductCategory.findOne({
            slug: req.params.slugCategory,
            deleted: false,
            status: "active"

        })

        const listSubCategory = await productsCategoryHelper.getSubCategory(category.id);

        const listSubCategoryId = listSubCategory.map(item => item.id);


        const products = await Product.find({
            product_category_id: { $in: [category.id, ...listSubCategoryId] },
            deleted: false
        }).sort({ positipn: "desc" });

        const newProducts = productHelper.priceNewProducts(products);

        res.render("client/pages/products/index", {
            pageTitle: category.title,
            products: newProducts,
        })
    } catch (error) {
        res.redirect(`/products`)
    }

}
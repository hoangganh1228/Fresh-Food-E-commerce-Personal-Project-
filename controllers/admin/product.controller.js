const Product = require("../../models/products.model")

const filterStatusHelper = require("../../helpers/filterStatus")

module.exports.index = async (req, res) => {
    

    let find = {
        deleted: "false",
    }

    const filterStatus = filterStatusHelper(req.query);

    if(req.query.status) {
        find.status = req.query.status;
    }

    let keyword = "";
    if(req.query.keyword) {
        keyword = req.query.keyword;
        // console.log(keyword);
        const regex = new RegExp(keyword, "i")
        find.title = regex;
    }

    const products = await Product.find(find);
    // console.log(products);

    res.render("admin/pages/products/index", {
        pageTitle: "Trang sản phẩm",
        products: products,
        keyword: keyword,
        filterStatus: filterStatus
    })
}
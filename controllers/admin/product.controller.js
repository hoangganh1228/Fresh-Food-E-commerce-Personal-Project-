const Product = require("../../models/products.model")

const filterStatusHelper = require("../../helpers/filterStatus")
const searchHelper = require("../../helpers/search")
const paginationHelper = require("../../helpers/pagination")
 
module.exports.index = async (req, res) => {
    

    let find = {
        deleted: "false",
    }

    const filterStatus = filterStatusHelper(req.query);
    const objectSearch = searchHelper(req.query);
    
    if(objectSearch.regex) {
        find.title = objectSearch.regex;
    }

    if(req.query.status) {
        find.status = req.query.status;
    }

    const countProducts = await Product.countDocuments(find);
    
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 4
        },
        req.query,
        countProducts
    )




    const products = await Product.find(find).limit(objectPagination.limitItems).skip(objectPagination.skip);
    // console.log(products);

    res.render("admin/pages/products/index", {
        pageTitle: "Trang sản phẩm",
        products: products,
        keyword: objectSearch.keyword,
        filterStatus: filterStatus,
        pagination: objectPagination
    })
}

module.exports.changeStauts = async (req, res) => {
    const status = req.params.status; 
    const id = req.params.id;
    await Product.updateOne({_id: id}, {status: status});
    res.redirect("back");
}
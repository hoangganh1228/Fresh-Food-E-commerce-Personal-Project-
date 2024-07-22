const Product = require("../../models/products.model")

const filterStatusHelper = require("../../helpers/filterStatus")
const searchHelper = require("../../helpers/search")
 
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
    
    let objectPagination = {
        currentPage: 1,
        limitItems: 4
    }

    if(req.query.page) {
        objectPagination.currentPage = parseInt(req.query.page)
    }

    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;

    const totalPage = Math.ceil(countProducts/objectPagination.limitItems);

    objectPagination.totalPage = totalPage;



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
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

module.exports.changeMulti = async (req, res) => {
    const ids = req.body.ids.split(", ");
    const type = req.body.type;
    
   
    switch (type) {
        case "active":
            await Product.updateMany({ _id: { $in: ids } }, 
                { status: "active" })
            break;
        case "inactive":
            await Product.updateMany({ _id: { $in: ids } }, 
                { status: "inactive" })
            break;
        case "delete-all":
            await Product.updateMany({ _id: { $in: ids } }, 
                { 
                    deleted: true,
                    deletedAt: new Date() 
                })
            break;
        default:
            break;
    }
    res.redirect("back");
    // res.send("OK")
}

module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;
    console.log(id);
    await Product.updateOne({ _id: id }, { 
        deleted: true,
        deletedAt: new Date()
    });
    // res.send("OK")
    res.redirect("back");
}
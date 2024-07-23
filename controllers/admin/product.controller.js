const Product = require("../../models/products.model")

const systemConfig = require("../../config/system")

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




    const products = await Product.find(find)
    .sort({ position: "desc"})
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
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
    req.flash('success', `Cập nhật trạng thái thành công sản phẩm!`);
    res.redirect("back");
}

module.exports.changeMulti = async (req, res) => {
    const ids = req.body.ids.split(", ");
    const type = req.body.type;
    
   
    switch (type) {
        case "active":
            await Product.updateMany({ _id: { $in: ids } }, 
                { status: "active" })
            req.flash('success', `Đã thay đổi thành công vị trí của ${ids.length} sản phẩm!`);
            break;
        case "inactive":
            await Product.updateMany({ _id: { $in: ids } }, 
                { status: "inactive" })
            req.flash('success', `Đã thay đổi thành công vị trí của ${ids.length} sản phẩm!`);
            break;
        case "delete-all":
            await Product.updateMany({ _id: { $in: ids } }, 
                { 
                    deleted: true,
                    deletedAt: new Date() 
                })
            req.flash('success', `Đã thay đổi thành công vị trí của ${ids.length} sản phẩm!`);
            break;
        case "change-position":
            for (const item of ids) {
                // console.log(item);
                let [id, position] = item.split("-");
                // console.log(position);
                position = parseInt(position);
                await Product.updateMany({ _id: id  }, 
                    { 
                        position: position 
                    })
                req.flash('success', `Đã thay đổi thành công vị trí của ${ids.length} sản phẩm!`);
            }
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

// [GET] /admin/products/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/products/create", {
        pageTitle: "Thêm mới sản phẩm",

    })
}

// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage  = parseInt(req.body.discountPercentage );
    req.body.stock = parseInt(req.body.stock);

    if(req.body.position == "") {
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }


    const product = new Product(req.body);
    await product.save();



    res.redirect(`${systemConfig.prefixAdmin}/products`)
}
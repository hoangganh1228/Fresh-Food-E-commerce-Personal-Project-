const Product = require("../../models/products.model")
const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");

const systemConfig = require("../../config/system")

const filterStatusHelper = require("../../helpers/filterStatus")
const searchHelper = require("../../helpers/search")
const paginationHelper = require("../../helpers/pagination")
const createTreeHelper = require("../../helpers/createTree");  

module.exports.index = async (req, res) => {
    

    let find = {
        deleted: "false",
    }

    let sort = {}
    if(req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.position = "desc"
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
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
    // console.log(products);

    for(const product of products) {
        const user = await Account.findOne({
            _id: product.createdBy.account_id
        })
        if(user) {
            product.accountFullName = user.fullName
        }
    }

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
                    deletedBy: {
                        account_id: res.locals.user.id,
                        deletedAt: new Date(),
                    }
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
        deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
        }
    });
    // res.send("OK")
    res.redirect("back");
}

// [GET] /admin/products/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };

    const category = await ProductCategory.find(find);

    const newCategory = createTreeHelper.tree(category)
    res.render("admin/pages/products/create", {
        pageTitle: "Thêm mới sản phẩm",
        category: newCategory
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
    
    req.body.createdBy = {
        account_id: res.locals.user.id
    }

    const product = new Product(req.body);
    await product.save();



    res.redirect(`${systemConfig.prefixAdmin}/products`)
}

// [GET] /admin/products/edit
module.exports.edit = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const product = await Product.findOne(find);

        const category = await ProductCategory.find({
            deleted: false
        })

        const newCategory = createTreeHelper.tree(category)
    
        res.render("admin/pages/products/edit", {
            pageTitle: "Chỉnh sửa sản phẩm",
            product: product,
            category: newCategory 
        });
        
    } catch (error) {
        req.flash("error", `Không tồn tại sản phẩm này!`);

        res.redirect(`${systemConfig.prefixAdmin}/products`)       
    }
}

module.exports.editPatch = async (req, res) => {
    const id = req.params.id;
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position)

  
    try {
        await Product.updateOne( { _id: id}, req.body)
        req.flash("success", `Cập nhật thành công sản phẩm!`);
    } catch (error) {
        req.flash("error", `Cập nhật thất bại!`);
    }
    res.redirect("back");
}

// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
    
        const product = await Product.findOne(find);
    
        res.render("admin/pages/products/details", {
            pageTitle: product.title,
            product: product  
        });
        
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`)   
    }
}
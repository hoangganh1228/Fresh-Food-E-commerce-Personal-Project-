const ProductCategory = require("../../models/product-category.model")

const systemConfig = require("../../config/system")
const createTreeHelper = require("../../helpers/createTree")
const searchHelper = require("../../helpers/search")
const filterStatusHelper = require("../../helpers/filterStatus")
const paginationHelper = require("../../helpers/pagination")

const Product = require("../../models/products.model")
const Account = require("../../models/account.model");

module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    }
    
    const filterStatus = filterStatusHelper(req.query)
    const objectSearch = searchHelper(req.query);

    if(objectSearch.regex) {
        find.title = objectSearch.regex;
    }

    if(req.query.status) {
        find.status = req.query.status;
    }

    

    const countProductsCategory = await ProductCategory.countDocuments(find);
    
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 8
        },
        req.query,
        countProductsCategory
    )

    const records = await ProductCategory.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

    for(const record of records) {
        const user = await Account.findOne({
            _id: record.createdBy.account_id
        })
        if(user) {
            record.accountFullName = user.fullName        
        }

        const updatedBy = record.updatedBy[record.updatedBy.length-1];
        if(updatedBy) {
            const userUpdated = await Account.findOne({
                _id: updatedBy.account_id
            })

            updatedBy.accountFullName = userUpdated.fullName
        }
    }

    const newRecords =  createTreeHelper.tree(records);

    res.render("admin/pages/products-category/index", {
        pageTitle: "Trang danh mục sản phẩm",
        records: newRecords,
        keyword: objectSearch.keyword,
        filterStatus: filterStatus,
        pagination: objectPagination
    })
}

module.exports.changeStauts = async (req, res) => {
    const status = req.params.status; 
    const id = req.params.id;
    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }
    await ProductCategory.updateOne({_id: id}, {
        status: status,
        $push: {updatedBy: updatedBy}
    });
    req.flash('success', `Cập nhật trạng thái thành công sản phẩm!`);
    res.redirect("back");
}

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    }


    const records = await ProductCategory.find(find);

    const newRecords =  createTreeHelper.tree(records);
    res.render("admin/pages/products-category/create", {
        pageTitle: "Tạo danh mục sản phẩm",
        records: newRecords
    })
}  

// [POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {
    if(req.body.position == "") {
        const count = await ProductCategory.countDocuments();
        req.body.position = count + 1;
    } else {
        req.body.position = parseInt(req.body.position)
    } 

    req.body.createdBy = {
        account_id: res.locals.user.id
    }

    const record = new ProductCategory(req.body);
    await record.save();
    res.redirect(`${systemConfig.prefixAdmin}/products-category`)

}  

// [DELETE] /delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;
    
    await ProductCategory.updateOne({ _id: id }, { 
        deleted: true,
        deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
        }
    });
    res.redirect("back");
}

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await ProductCategory.findOne({
            _id: id,
            deleted: false
        })

        const records = await ProductCategory.find({
            deleted: false
        });

        const newRecords = createTreeHelper.tree(records);


        res.render("admin/pages/products-category/edit", {
            pageTitle: "Chỉnh sửa danh mục sản phẩm",
            data: data,
            records: newRecords
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`); 
    }
}

// [GET] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    req.body.position = parseInt(req.body.position)

    const updatedBy = {
        account_id: res.locals.user.id,
        deletedAt: new Date()
    }
    
    await ProductCategory.updateOne({ _id: id }, {
        ...req.body,
        $push: { updatedBy: updatedBy }
    });

    res.redirect("back")

}
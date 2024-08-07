const ProductCategory = require("../../models/product-category.model")

const systemConfig = require("../../config/system")
const createTreeHelper = require("../../helpers/createTree")
const searchHelper = require("../../helpers/search")
const filterStatusHelper = require("../../helpers/filterStatus")
const paginationHelper = require("../../helpers/pagination")
const Product = require("../../models/products.model")

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
    .skip(objectPagination.skip);;   

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
    await ProductCategory.updateOne({_id: id}, {status: status});
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
    const record = new ProductCategory(req.body);
    await record.save();
    res.redirect(`${systemConfig.prefixAdmin}/products-category`)

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

    await ProductCategory.updateOne({ _id: id }, req.body);

    res.redirect("back")

}
const Product = require("../../models/products.model")

module.exports.index = async (req, res) => {
    let filterStatus = [
        {
            name: "Tất cả",
            status: "",
            class: ""
        },
        {
            name: "Hoạt động",
            status: "active",
            class: ""
        },
        {
            name: "Dừng hoạt động",
            status: "inactive",
            class: ""
        }
    ]

    if(req.query.status) {
        const index = filterStatus.findIndex(item => item.status == req.query.status);
        filterStatus[index].class = "active"
    } else {
        const index = filterStatus.findIndex(item => item.status == "");
        filterStatus[index].class = "active"
    }

    let find = {
        deleted: "false",
    }

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
const Product = require("../../models/products.model");
const productsHelper = require("../../helpers/products");

module.exports.index = async (req, res) => {
  const keyword = req.query.keyword;
  
  let newProducts = [];

  if(keyword) {
    const regex = new RegExp(keyword, "i");
    const products = await Product.find({
      deleted: false,
      status: "active",
      title: regex 
    })
    newProducts = productsHelper.priceNewProducts(products)
  }
  
  res.render("client/pages/search/index", {
    pageTitle: "Kết quả tìm kiếm",
    keyword: keyword,
    products: newProducts
})
}
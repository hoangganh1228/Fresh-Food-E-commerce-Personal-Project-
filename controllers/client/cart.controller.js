const Cart = require("../../models/cart.model")
const Product = require("../../models/products.model")

const productsHelper = require("../../helpers/products");

module.exports.index = async (req, res) => {
  const cartId = req.cookies.cartId;

  const cart = await Cart.findOne({
    _id: cartId
  })

  // console.log(cart);

  if(cart.products.length > 0) {
    for(const item of cart.products) {
      const productId = item.product_id;
      const productInfo = await Product.findOne({
        _id: productId
      }).select("title thumbnail slug price discountPercentage");
      productInfo.priceNew = productsHelper.priceNewProduct(productInfo);
      item.productInfo = productInfo;
      // console.log(item.productInfo);
      item.totalPrice = productInfo.priceNew * item.quantity;

      cart.totalPrice = cart.products.reduce((sum, item) => item.totalPrice + sum, 0);
    }
  }
  
  res.render("client/pages/cart/index", {
    pageTitle: "Giỏ hàng",
    cartDetail: cart,
  });
}

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
  const quantity = parseInt(req.body.quantity);
  const productId = req.params.productId;
  const cartId = req.cookies.cartId;

  const cart = await Cart.findOne({
    _id: cartId
  })

  // console.log(quantity);
  
  const existProductInCart = cart.products.find(item => item.product_id == productId);
  // console.log(existProductInCart);
  
  if(existProductInCart) {
    
    const newQuantity = quantity + existProductInCart.quantity;
    
    await Cart.updateOne({
      _id: cartId,
      "products.product_id": productId
  }, {
      $set: {
        "products.$.quantity": newQuantity
      }
    })
  } else {
    const objectCart = {
      product_id: productId,
      quantity: quantity
    }
  
    await Cart.updateOne(
      { _id: cartId },
      {
        $push: { products: objectCart }
      }
    )

  }


  req.flash("success", "Đã thêm sản phẩm vào giỏ hàng!");

  res.redirect("back")
  // res.send("OK")
}

// [UPDATE] /cart/update/:productId/:quantity
module.exports.update = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;
  const quantity = req.params.quantity;

  await Cart.updateOne({
    _id: cartId,
    "products.product_id": productId
  }, {
    $set: { "products.$.quantity": quantity }
  })

  req.flash("success", "Cập nhật số lượng thành công!");

  res.redirect("back");

}

// [DELETE] /cart/delete/:productId
module.exports.delete = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;

  await Cart.updateOne({
    _id: cartId
  }, {
    $pull: { products: { product_id: productId } }
  })

  req.flash("success", `Đã xóa sản phẩm thành công trong giỏ hàng`)

  res.redirect("back")

}


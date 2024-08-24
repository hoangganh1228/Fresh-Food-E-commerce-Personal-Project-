const Cart = require("../../models/cart.model")


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
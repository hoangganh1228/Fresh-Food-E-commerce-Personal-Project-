const md5 = require("md5");
const User = require("../../models/user.model");
const Key = require("../../models/key.model");
const ForgotPassword = require("../../models/forgot-password.model");
const Cart = require("../../models/cart.model");
const generateHelper = require("../../helpers/generate");   
const sendMailHelper = require("../../helpers/sendMail");
const { hashPassword, generateRSAKeys, generateTokens, comparePassword, verifyToken } = require("../../utils/jwtHelper");

// [GET] /user/register
module.exports.register = async (req, res) => {
  res.render("client/pages/user/register", {
    pageTitle: "Đăng ký tài khoản",
  });
};

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
  // console.log(req.body);

  const existEmail = await User.findOne({
    email: req.body.email
  })

  if(existEmail) {
    req.flash("error", "Email đã tồn tại!");
    res.redirect("back");
    return;
  }

  req.body.password = await hashPassword(req.body.password);
  const user = new User(req.body);
  user.save();

  const { publicKey, privateKey } = generateRSAKeys();
  const { accessToken, refreshToken } = generateTokens(user._id, privateKey)
  await Key.create({ userId: user._id, privateKey, publicKey, refreshToken });


  res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

  res.redirect("/");

  
}

// Làm mới Access Token (Xóa Refresh Token cũ & tạo mới)
module.exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(403).json({ message: "Không có refresh token" });

  const key = await Key.findOne({ refreshToken });
  if (!key) return res.status(403).json({ message: "Refresh token không hợp lệ" });

  const decoded = verifyToken(refreshToken, key.publicKey);
  if (!decoded || key.userId.toString() !== decoded.userId) {
    return res.status(403).json({ message: "Refresh token hết hạn hoặc không hợp lệ" });
  }

  // Xóa Refresh Token cũ và tạo mới
  const {accessToken, refreshToken: newRefreshToken} = generateTokens(decoded.userId, key.privateKey);
  await Key.updateOne({ userId: decoded.userId }, { refreshToken: newRefreshToken });

  res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
  res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true });

  res.json({ accessToken });
}  
// [GET] /user/login
module.exports.login = async (req, res) => {
  res.render("client/pages/user/login", {
    pageTitle: "Đăng nhập tài khoản",
  });
};

// [POST] /user/login
// module.exports.loginPost = async (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   const user = await User.findOne({
//     email: email,
//     deleted: false
//   })
  
//   if(!user) {
//     req.flash("error", "Email không tồn tại!");
//     res.redirect("back");
//     return;
// }

//   if(md5(password) !== user.password) {
//       req.flash("error", "Sai mật khẩu!");
//       res.redirect("back");
//       return;
//   }

//   if(user.status === "inactive") {
//     req.flash("error", "Tài khoản đang bị khóa!");
//     res.redirect("back");
//     return;
//   }


//   const cart = await Cart.findOne({
//     user_id: user.id
//   })

  
  

//   await Cart.updateOne({
//     _id: req.cookies.userId
//   }, {
//     user_id: user.id
//   })

//   if(cart) {
//     res.cookie("cartId", cart.id);
//   } else  {
//     await Cart.updateOne({
//       _id: req.cookies.cartId
//       }, {
//       user_id: user.id
//     });
//   }

//   res.cookie("tokenUser", user.tokenUser);
//   res.redirect("/");
// }

module.exports.loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra xem email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Email không tồn tại!");
      return res.redirect("/user/login");
    }
  
    const validPassword = await comparePassword(password, user.password)
    if (!validPassword) {
      req.flash("error", "Mật khẩu không đúng!");
      return res.redirect("/user/login");
    }

  
    let key = await Key.findOne({ userId: user._id });
    if (!key) {
      const { publicKey, privateKey } = generateRSAKeys();
      const { accessToken, refreshToken } = generateTokens(user._id, privateKey);
    
      key = await Key.create({ userId: user._id, privateKey, publicKey, refreshToken });
    } else {
      const { accessToken, refreshToken } = generateTokens(user._id, key.privateKey);
      await Key.updateOne({ userId: user._id }, { refreshToken });
    }
     // Tạo Access Token & Refresh Token
    const { accessToken, refreshToken } = generateTokens(user._id, key.privateKey);

    // Cập nhật Refresh Token trong database
    await Key.updateOne({ userId: user._id }, { refreshToken });

    // Lưu token vào cookie
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    // Chuyển hướng sau khi đăng nhập thành công
    res.redirect("/");
  
  } catch (error) {
    console.error("Login error:", error);
    req.flash("error", "Xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại!");
    res.redirect("/user/login");
  }


}

// [GET] /user/logout
// module.exports.logout = async (req, res) => {
//   res.clearCookie("tokenUser");
//   res.clearCookie("cartId");
//   res.redirect("/");
// };

module.exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      req.flash("error", "Không có Refresh Token!");
      return res.redirect("/user/login");
    }

    await Key.deleteOne({refreshToken});

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // Chuyển hướng về trang đăng nhập
    res.redirect("/user/login");
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    req.flash("error", "Có lỗi xảy ra khi đăng xuất!");
    res.redirect("/user/login");
  }
  
}




// [GET] /user/info
module.exports.info = async (req, res) => {
  res.render("client/pages/user/info", {
    pageTitle: "Thông tin tài khoản",
  });
};

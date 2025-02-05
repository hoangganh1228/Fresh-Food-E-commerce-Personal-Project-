const User = require("../../models/user.model");
const Key = require("../../models/key.model");
const {verifyToken} = require("../../utils/jwtHelper")

module.exports.infoUser = async (req, res, next) => {
  const token = req.cookies.refreshToken;
  console.log(token);
  
  const key = await Key.findOne({
    refreshToken: token
  })
  // if (!key) {
  //   req.flash("error", "Không tìm thấy khóa bảo mật, hãy đăng nhập lại!");
  //   return res.redirect("/user/login");
  // }

  console.log(key);
  

  const decoded = verifyToken(token, key.publicKey);
  // if (!decoded) {
  //   req.flash("error", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
  //   return res.redirect("/user/login"); 
  // }
  console.log(decoded);
  
  const user = await User.findById(decoded.userId).select("-password");
  if (user) {
    res.locals.user = user;
    req.userId = decoded.userId;
  }
  
  
  next();
}
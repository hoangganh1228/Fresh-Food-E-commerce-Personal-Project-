const User = require("../../models/user.model");
const Key = require("../../models/key.model");
const {verifyToken} = require("../../utils/jwtHelper")

// module.exports.requireAuth = async (req, res, next) => {
//   if (!req.cookies.tokenUser) {
//     res.redirect(`/user/login`);
//   } else {
//     const user = await User.findOne({ tokenUser: req.cookies.tokenUser }).select("-password");
//     if (!user) {
//       res.redirect(`/user/login`);
//     } else {
//       res.locals.user = user;
//       next();
//     }
//   }
// };

module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    req.flash("error", "Vui lòng đăng nhập trước khi truy cập!");
    return res.redirect("/user/login");
  }

  const key = await Key.findOne({
    userId: req.userId
  })
  if (!key) {
    req.flash("error", "Không tìm thấy khóa bảo mật, hãy đăng nhập lại!");
    return res.redirect("/user/login");
  }

  const decoded = verifyToken(token, key.publicKey);
  if (!decoded) {
    req.flash("error", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
    return res.redirect("/user/login"); 
  }

  const user = await User.findById(decoded.userId).select("-password");
  if (!user) {
    req.flash("error", "Tài khoản không tồn tại!");
    return res.redirect("/user/login");
  }
  
  res.locals.user = user;
  req.userId = decoded.userId;
  next();

}

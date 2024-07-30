const Role = require("../../models/role.model")
const systemConfig = require("../../config/system");

module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  }

  const records = await Role.find(find);

  res.render("admin/pages/roles/index", {
      pageTitle: "Nhóm quyền",
      records: records
  })
}

module.exports.create = async (req, res) => {
  res.render("admin/pages/roles/create", {
      pageTitle: "Tạo nhóm quyền",
  })
}

module.exports.createPost = async (req, res) => {
  const records = new Role(req.body);
  records.save();

  res.redirect(`${systemConfig.prefixAdmin}/roles`);

}
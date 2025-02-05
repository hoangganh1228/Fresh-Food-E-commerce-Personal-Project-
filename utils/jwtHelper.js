const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");


const generateRSAKeys = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  })

  return { publicKey, privateKey };
}

// Tạo Access Token & Refresh Token
const generateTokens = (userId, privateKey) => {
  const accessToken = jwt.sign({userId}, privateKey, {
    algorithm: "RS256", 
    expiresIn: "30m" 
  })

  const refreshToken = jwt.sign({userId}, privateKey, {
    algorithm: "RS256", 
    expiresIn: "7d"
  })

  return { accessToken, refreshToken };
}

// Xác thực JWT bằng Public Key
const verifyToken = (token, publicKey) => {
  try {
    return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
  } catch (err) {
    return null;
  }
}

// Hash mật khẩu
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

// Kiểm tra mật khẩu
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}


module.exports = { generateRSAKeys, generateTokens, verifyToken, hashPassword, comparePassword };

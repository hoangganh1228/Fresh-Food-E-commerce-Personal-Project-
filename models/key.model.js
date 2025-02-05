const mongoose = require("mongoose");

const KeySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  privateKey: { 
    type: String, 
    required: true 
  },
  publicKey: { 
    type: String, 
    required: true 
  },
  refreshToken: { 
    type: String, 
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Key", KeySchema);
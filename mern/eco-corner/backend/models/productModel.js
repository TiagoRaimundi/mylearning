const mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true
  },
  price:{
    type: Number,
    required: true,
  },
  brand:{
    type: String,
    enum: ['Apple', "Samsung", "Lenovo"],
  },
  category:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  quantity: Number,
  sold:{
    type: Number,
    default: 0,
  },
  images:{
    type: Array,
  },
  color: {
    type: String,
    enum: ['Black', "Brown", "Red"],
  },
  ratings: [{
    star: Number,
    postedby:{type:mongoose.Schema.Types.ObjectId, ref: "User"},
  }],
}, {timestamps: true});

module.exports = mongoose.model("Product", productSchema);
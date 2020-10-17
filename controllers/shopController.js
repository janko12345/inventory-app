const mongoose = require("mongoose");

// models
const Category = require("../models/category");
const Item = require("../models/item");

exports.allItems_get = (req, res, next) => {
  let isValidId = mongoose.isValidObjectId(req.query.category) && req.query.category !== undefined && req.query.category !== null;

  Promise.all([
    Category.find(),
    Item.find(isValidId ? { category: req.query.category} : {}).populate("category"),
    Category.findById(req.query.category)
  ])
    .then(results =>{
      let [categories, items, activeCategory] = results;
    res.render("shop/items", { title: "all items", items, categories, activeCategory });
  })
    .catch(next);
};

exports.item_get = (req, res, next) => {
  Item.findById(req.params.id).populate("category")
    .then(item =>{
      if(item === null) return res.redirect("/shop");
      res.render("shop/item", { title: "one item", item });
    })
};


exports.itemBuy_post = (req,res,next) => {
  Item.findById(req.params.id)
    .then(item =>{
      item.stock = item.stock === 0 ? item.stock : item.stock - 1;
      Item.findByIdAndUpdate(item._id,item,(error,document) =>{
        if(error) return next(error);
        res.redirect(item.url);
      })
    })
}

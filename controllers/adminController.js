const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

// models
const Category = require("../models/category");
const Item = require("../models/item");

// dependencies for file upload
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./public/images/uploads",
  filename: (req, file,cb) => {
    cb(null,`${file.fieldname} - ${Date.now()}${path.extname(file.originalname)}`)
  }
  
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
}).single("image");

exports.index_get = (req, res, next) => {
  res.render("admin/adminIndex", {
    title: res.locals.isAdmin ? "Admin" : "Guest",
  });
};

exports.index_post = (req, res, next) => {
  let { isAdmin } = res.locals;
  if (!isAdmin)
    res.render("admin/adminIndex", {
      title: "Guest",
      valid: false,
    });
  else
    res.render("admin/adminIndex", {
      title: "Admin",
    });
};

/* CATEGORIES */

exports.createCategory_get = (req, res, next) => {
  res.render("admin/form_category", { title: "create category" });
};

exports.createCategory_post = [
  body("name", "field must not be empty").isLength({ min: 1 }).escape(),
  (req, res, next) => {
    if(!res.locals.isAdmin) return res.redirect("/admin");

    let errors = validationResult(req);
    let category = new Category({
      name: req.body.name,
    });
    if (!errors.isEmpty()) {
      res.render("admin/form_category", {
        title: "create category",
        errors: errors.array(),
        category,
      });
    } else {
      category.save((err, product) => {
        if (err) return next(err);
        res.redirect(`/shop/items?category=${category._id}`);
      });
    }
  },
];

exports.deleteCategory_get = (req,res,next) => {
  Item.find({category: req.params.id})
    .then(items =>{
      res.render("admin/deleteCategory", { title: "delete category", items});
    })
    .catch(next);
}

exports.deleteCategory_post = (req,res,next) => {
  if(!res.locals.isAdmin) return res.redirect("/admin")
  Promise.all([
    Item.find({category: req.params.id}),
    Category.findById(req.params.id)
  ])
    .then(results =>{
      let [items, category] = results;
      if(items.length > 0)
        return res.redirect(`/admin/deleteCategory/${category._id}`);

      category.remove((err,product) =>{
        if(err) return next(err);
        res.redirect("/shop/items");
      })
    })
    .catch(next);
}



/* ITEMS */

// array middleware functions for validating and sanitizing input
const item_formValidation = [
  body("brand", "field BRAND must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "CATEGORY must be selected")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("stock", "STOCK must be positive integer or 0").isInt({
    gt: -1,
  }),
  body("price", "PRICE must be positive float greater than 0").isFloat({
    gt: 0,
  }),
  body("description").trim(),
];

exports.createItem_get = (req, res, next) => {
  Category.find()
    .then((categories) => {
    res.render("admin/form_item", { title: "create item", categories });
  })
    .catch(next);
};



  exports.createItem_post = [
    upload,
    item_formValidation,
    (req, res, next) => {
    if(!res.locals.isAdmin) return res.redirect("/admin");
    
    let errors = validationResult(req);
    let { brand, category, stock, price, description } = req.body;
    let item = new Item({
      brand,
      category,
      stock,
      price,
    });
    if (description) item.description = description;
    if(req.file !== undefined) item.imgUrl = `/images/uploads/${req.file.filename}`;
    if (!errors.isEmpty()) {
        
        Category.find()
          .then((categories) => {
          res.render("admin/form_item", {
            title: "create item",
            categories,
            item,
            errors: errors.array(),
          });
        })
          .catch(next);
    } else {
      
      item.save((error, product) => {
          if (error) return next(error);
          res.redirect(item.url);
        });
    }
  }];



exports.updateItem_get = (req,res,next) => {
  console.log("we got here")
  if(!mongoose.isValidObjectId(req.params.id))
    return res.redirect("/shop/items");

  Promise.all([
    Category.find(),
    Item.findById(req.params.id)
  ])
    .then(results =>{
      let [categories, item] = results
      res.render("admin/form_item", { title: "update item", item, categories, update: true})
    })
    .catch(next)
};


exports.updateItem_post = [
  upload,
  item_formValidation,
  (req, res, next) => {
    if(!res.locals.isAdmin) return res.redirect("/admin")

  let errors = validationResult(req);
  let { brand, category, stock, price, description, image } = req.body;
  let item = new Item({
    _id: req.params.id,
    brand,
    category,
    stock,
    price,
  });
  if (description) item.description = description;
  if(req.file !== undefined) item.imgUrl = `/images/uploads/${req.file.filename}`;
  if (!errors.isEmpty()) {
    Category.find()
      .then((categories) => {
      res.render("admin/form_item", {
        title: "create item",
        categories,
        item,
        errors: errors.array(),
      });
    })
      .catch(next);
  } else {
    Item.findByIdAndUpdate(req.params.id,item,function(error,document) {
      if(error) return next(error);
      res.redirect(item.url);
    })
  }
}];

exports.deleteItem_post = (req,res,next) => {
  Item.findByIdAndRemove(req.params.id,(error,document) =>{
    if (error) return next(error);
    res.redirect(`/shop/items`);
  })
}

exports.deleteAllCategoryItems_post = (req,res,next) => {
  if(!mongoose.isValidObjectId(req.params.id))
    return res.redirect("/shop/items");
  Item.find({category: req.params.id})  
    .then(items =>{
      items.forEach(item => item.remove((err,product) =>{
        if (err) return next(err);

        res.redirect(`/admin/deleteCategory/${req.params.id}`);
      }))
    })
    .catch(next);
}

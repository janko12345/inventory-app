#! /usr/bin/env node
console.log(
  "This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true"
);
// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Category = require("./models/category");
var Item = require("./models/item");
var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
var categories = [];
var items = [];

function categoryCreate(name, cb) {
  var category = new Category({
    name,
  });
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New category: " + category);
    categories.push(category);
    cb(null, category);
  });
}
function itemCreate(brand, category, stock, price, description, imgUrl, cb) {
  var itemDetail = {
    brand,
    category,
    stock,
    price,
  };
  if (description) itemDetail.description = description;
  if (imgUrl) itemDetail.imgUrl = imgUrl;
  var item = new Item(itemDetail);
  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.parallel(
    [
      function (callback) {
        categoryCreate("jeans", callback);
      },
      function (callback) {
        categoryCreate("shirts", callback);
      },
      function (callback) {
        categoryCreate("slippers", callback);
      },
      function (callback) {
        categoryCreate("pants", callback);
      },
      function (callback) {
        categoryCreate("leggins", callback);
      },
    ],
    // Optional callback
    cb
  );
}
function createItems(cb) {
  async.parallel(
    [
      function (callback) {
        itemCreate("adidas", categories[0], 3, 30, false, false, callback);
      },
      function (callback) {
        itemCreate("adidas", categories[1], 7, 3, false, false, callback);
      },
      function (callback) {
        itemCreate("adidas", categories[0], 50, 55, false, false, callback);
      },
      function (callback) {
        itemCreate("adidas", categories[0], 30, 53, false, false, callback);
      },
      function (callback) {
        itemCreate("adidas", categories[2], 20, 25, false, false, callback);
      },
      function (callback) {
        itemCreate("adidas", categories[1], 110, 15, false, false, callback);
      },
    ],
    // optional callback
    cb
  );
}
async.series(
  [createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("succeeded");
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);

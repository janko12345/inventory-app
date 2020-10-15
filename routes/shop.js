var express = require("express");
var router = express.Router();
const shopController = require("../controllers/shopController");

/* GET users listing. */
router.get("/items", shopController.allItems);

router.get("/items/:id", shopController.item_get);

router.post("/buyItem/:id",shopController.itemBuy_post);

module.exports = router;

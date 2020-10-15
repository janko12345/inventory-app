var express = require("express");
var router = express.Router();
const adminController = require("../controllers/adminController");

/* GET users listing. */
router.get("/", adminController.index_get);
router.post("/", adminController.index_post);

router.get("/createCategory", adminController.createCategory_get);
router.post("/createCategory", adminController.createCategory_post);

router.get("/createItem", adminController.createItem_get);
router.post("/createItem", adminController.item_formValidation,adminController.createItem_post);

router.get("/updateItem/:id",adminController.updateItem_get);
router.post("/updateItem/:id",adminController.item_formValidation,adminController.updateItem_post);

router.post("/deleteItem/:id",adminController.deleteItem_post);

router.get("/deleteCategory/:id", adminController.deleteCategory_get);
router.post("/deleteCategory/:id", adminController.deleteCategory_post);

module.exports = router;

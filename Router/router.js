const router = require("express").Router();
const Controller = require("../Controller/controller");
const multer = require("multer");

//multer storage

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Upload");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

//multer upload
const upload = multer({
  storage: storage,
});

router.post("/set", upload.single("path"), Controller.readExcelFile);
router.get("/get", Controller.downloadPdf);

module.exports = router;

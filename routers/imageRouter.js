const express = require("express");
const imageController = require("../controllers/imageController");
const multer = require("multer");

const upload = multer({
  storage: imageController.storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: imageController.fileFilter,
});

const router = express.Router();
router.get("/getImage/:path", imageController.getImage);
router.get("/downloadMap", imageController.downloadMap);

router.post(
  "/uploadImage",
  upload.single("userImage"),
  imageController.uploadImage
);

module.exports = router;

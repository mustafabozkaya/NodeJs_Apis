const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();
router.post(
  "/signup",
  // authController.protect,
  // authController.restrictTo('superAdmin'),
  authController.signup
);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.route("/getAllUsers").get(
  // authController.protect,
  // authController.restrictTo('admin', 'superAdmin'),
  userController.getUsers
);
router.route("/forgetPassword").post(authController.forgetPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);
// router.route('/deleteUser').delete(
//   authController.protect,
//   authController.restrictTo('superAdmin'),
//   userController.deleteUser);

router.route("/postUser").post(userController.postUser);

router
  .route("/:id")
  .get(authController.protect, userController.getUser)
  .post(authController.protect, userController.postUser)
  .patch(
    // authController.protect,
    // authController.restrictTo('superAdmin'),
    userController.updateUser
  )
  .delete(userController.deleteUser);
//delete by id()
module.exports = router;

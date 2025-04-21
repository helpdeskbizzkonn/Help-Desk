const express = require("express");
const adminController = require("../controllers/user.controller");
const upload = require("../middlewares/multermiddleware");
const router = express.Router();

router.post("/admin/login", adminController.adminLogin);

router.post(
  "/admin/signup",
  upload.single("admin_profile_photo"),
  adminController.adminSignup
);

router.post("/admin/forgetpassword/api", adminController.admincheckemail);

router.post("/admin/reset", adminController.ForgotPassword);

router.post("/signup", adminController.staffsingup);

router.post("/login", adminController.stafflogin);

router.post("/verify-email", adminController.staffcheckemail);

router.post("/reset-password", adminController.staffresetpass);

router.post("/banker/signup", adminController.bankersignup);

router.post("/banker/login", adminController.bankerlogin);

router.post("/banker/checkemail", adminController.bankercheckemail);

router.post("/banker/forgetpassword", adminController.bankerforgetpass);

router.delete("/api/staff/:email", adminController.deletestaf);

router.delete("/api/banker/:email", adminController.deletebanker);

router.delete("/api/admin/:email", adminController.deleteadmin);

module.exports = router;

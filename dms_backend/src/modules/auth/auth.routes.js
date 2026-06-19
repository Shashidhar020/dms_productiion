
import express from "express";
import authController from "./auth.controller.js";
import authenticate from "../../shared/middelware/authenticate.middleware.js";
const router = express.Router();

router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authController.me);
router.post("/change-email",authenticate,authController.changeEmail);
router.post("/verify-password",authenticate,authController.verifyPassword);
router.post("/change-password",authenticate,authController.changePassword);
router.post("/forgot-password",authController.forgotPassword);
router.post("/send-otp",authController.sendOTP)
router.post("/logout-all", authenticate, authController.logoutAll);
router.post("/request-email-change", authenticate, authController.requestEmailChange);
router.get("/verify-email-change", authController.verifyEmailChange);
export default router;

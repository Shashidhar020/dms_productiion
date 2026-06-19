import express from "express";

import { DistributorController } from "./distributor.controller.js";
import authenticate from "../../shared/middelware/authenticate.middleware.js";
import { uploadExcel } from "../../shared/middelware/excelUpload.middleware.js";
const router = express.Router();
const controller = new DistributorController();
router.post('/send-otp', DistributorController.sendOTP);
router.post('/verify-otp', DistributorController.verifyOTP);
router.post("/onboard", authenticate, controller.onboard);

router.post("/bulk-onboard", authenticate, (req, res) => {
  uploadExcel.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    controller.bulkOnboard(req, res);
  });
});
router.delete("/deleteById/:distributorId",authenticate,controller.deleteDistributor)
export default router;


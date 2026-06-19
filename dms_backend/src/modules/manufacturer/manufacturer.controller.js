
import { ManufacturerService } from './manufacturer.service.js';

export class ManufacturerController {

  /**
   * SEND OTP
   */
  static async sendOTP(req, res) {

    try {

      const response =await ManufacturerService.sendOnboardOTP(req.body);

      return res.status(200).json(response);

    } catch (error) {

      console.log(error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message:
          error.message ||
          "Unable to send OTP"
      });
    }
  }

  /**
   * VERIFY OTP
   */
  static async verifyOTP(req, res) {

    try {

      const response = await ManufacturerService.verifyOnboardOTP(req.body);

      return res.status(200).json(response);

    } catch (error) {

      console.log(error);

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to verify OTP"
      });
    }
  }

  /**
   * ONBOARD
   */
  static async onboard(req, res) {

    try {

      const response =await ManufacturerService.onboardManufacturer(req.body);

      return res.status(201).json({
        success: true,
        message:
          "Manufacturer registered successfully",
        data: response,
      });

    } catch (error) {

      console.log(error);

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to complete sign up"
      });
    }
  }

  /**
   * GET DISTRIBUTOR
   */
  static async getDistributor(req,res) {

    try {

      const response =await ManufacturerService.getDistributor(req.auth);

      return res.status(200).json(response);

    } catch (error) {

      console.log(error);

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to get Distributor"
      });
    }
  }
}
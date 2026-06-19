
import { DistributorService } from "./distributor.service.js";

const service = new DistributorService();

export class DistributorController {
  /**
   * SEND OTP TO DISTRIBUTOR EMAIL
   */
  static async sendOTP(req, res) {

    try {

      const response = await DistributorService.sendOnboardOTP(req.body);

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
   * VERIFY OTP TO DISTRIBUTOR EMAIL
   */

  static async verifyOTP(req, res) {

    try {

      const response = await DistributorService.verifyOnboardOTP(req.body);

      return res.status(200).json(response);

    } catch (error) {

      console.log(error);

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:error.message ||"Unable to verify OTP"
      });
    }
  }

  /**
   * Distributor onboard 
   * 
   * It takes distributor data and store them in database
   */

  async onboard(req, res, next) {
    try {
      const result = await service.onboardDistributor(
        req.body,
        req.auth
      );

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Distributor Bulk onboard
   * 
   * Accepts excel file data.
   * 
   * Excel validation and Database Validation.
   */

  async bulkOnboard(req, res, next) {

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Excel file is required",
        });
      }

      const result = await service.bulkOnboardDistributors(
        req.file.path,
        req.auth
      );

      return res.status(201).json(result);

    } catch (error) {

      next(error);

    }
  }
  async deleteDistributor(req, res) {
    try {
      const { distributorId} = req.params;

      const result = await service.deleteDistributor(
        distributorId,
        req.auth
      );

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import validator from "validator";

import { db } from '../../config/database.js';
import { ManufacturerRepository } from './manufacturer.repository.js';

import {sendOTP, sendApiKey,sendOnboardMessage } from '../../services/Mailservices.js';

export class ManufacturerService {

   static async sendOnboardOTP(payload) {
 
    const connection = await db.getConnection();

    try {

      /**
       * VALIDATIONS
       */

      if (!payload.admin_email) {

        const error = new Error("Admin email is required");

        error.statusCode = 400;

        throw error;
      }

      if (!validator.isEmail(payload.admin_email)) {

        const error = new Error("Invalid Email");

        error.statusCode = 400;

        throw error;
      }

      /**
       * CHECK EXISTING USER
       */

      const existingUser = await ManufacturerRepository.findUserByEmail(payload.admin_email,connection);

      if (existingUser) {

        const error = new Error("Admin email already exists");

        error.statusCode = 409;

        throw error;
      }

      /**
       * RATE LIMIT CHECK
       */

      const recentOtp = await ManufacturerRepository.getLatestOTP(payload.admin_email,connection);

      if (recentOtp) {

        const now = new Date();

        const createdAt = new Date(recentOtp.created_at);

        const diffSeconds = (now - createdAt) / 1000;

        if (diffSeconds < 30) {

          const error = new Error(`Please wait ${Math.ceil(30 - diffSeconds)} seconds before requesting another OTP`);

          error.statusCode = 429;

          throw error;
        }
      }

      /**
       * GENERATE OTP
       */

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      /**
       * HASH OTP
       */

      const otpHash = await bcrypt.hash(otp, 10);

      /**
       * EXPIRY
       */

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000 );

      /**
       * SAVE OTP
       */

      await ManufacturerRepository.createOTP({
        email: payload.admin_email,
        otp_hash: otpHash,
        expires_at: expiresAt
      }, connection);

      /**
       * SEND EMAIL
       */

      await sendOTP(payload.admin_email,otp);

      return {
        success: true,
        message: "OTP sent successfully"
      };

    } catch (error) {

      throw error;

    } finally {

      connection.release();

    }
  }

  /**
   * VERIFY OTP
   */
  static async verifyOnboardOTP(payload) {

    const connection = await db.getConnection();

    try {

      if (!payload.admin_email) {

        const error = new Error("Admin email is required");

        error.statusCode = 400;

        throw error;
      }

      if (!payload.otp) {

        const error = new Error("OTP is required");

        error.statusCode = 400;

        throw error;
      }

      /**
       * GET OTP RECORD
       */

      const otpRecord = await ManufacturerRepository.getValidOTP(payload.admin_email,connection);

      if (!otpRecord) {

        const error = new Error("OTP not found or expired");

        error.statusCode = 400;

        throw error;
      }

      /**
       * CHECK ATTEMPTS
       */

      if (otpRecord.attempts >= 5) {

        const error = new Error("Maximum OTP attempts exceeded");

        error.statusCode = 429;

        throw error;
      }

      /**
       * VERIFY OTP
       */

      const isValid =await bcrypt.compare(payload.otp,otpRecord.otp_hash);

      if (!isValid) {

        await ManufacturerRepository.incrementOTPAttempts(otpRecord.id,connection);

        const error = new Error("Invalid OTP");

        error.statusCode = 400;

        throw error;
      }

      /**
       * MARK VERIFIED
       */

      await ManufacturerRepository.markOTPVerified(otpRecord.id,connection);

      return {
        success: true,
        message: "OTP verified successfully"
      };
  
    } catch (error) {

      throw error;

    } finally {

      connection.release();

    }
  }

  static async onboardManufacturer(payload) {

    const connection = await db.getConnection();

    try {

      await connection.beginTransaction();

      /**
       * VALIDATIONS
       */

      if (!validator.isEmail(payload.admin_email)) {
        const error = new Error("Invalid Email");
        error.statusCode = 400;
        throw error;
      }

      if (!validator.isMobilePhone(payload.admin_mobile, "en-IN")) {
        const error = new Error("Invalid Mobile number");
        error.statusCode = 400;
        throw error;
      }

      const existingUser = await ManufacturerRepository.findUserByEmail(payload.admin_email,connection);

      if (existingUser) {
        const error = new Error('Admin email already exists');
        error.statusCode = 409;
        throw error;
      }

      /**
       * CREATE MANUFACTURER
       */

      const manufacturerId = await ManufacturerRepository.createManufacturer({
          company_name: payload.company_name,
          gst_number: payload.gst_number,
          pan_number: payload.pan_number,
          email: payload.company_email,
          mobile: payload.company_mobile,
          address: payload.address
        }, connection);

      /**
       * CREATE ROLE
       */

      const roleId =await ManufacturerRepository.createRole(manufacturerId,connection);

      /**
       * HASH PASSWORD
       */

      const passwordHash = await bcrypt.hash(payload.password,10);

      /**
       * CREATE USER
       */

      const userId = await ManufacturerRepository.createUser({
          manufacturer_id: manufacturerId,
          employee_code: `MFG-00${manufacturerId}`,
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.admin_email,
          mobile: payload.admin_mobile,
          password_hash: passwordHash
        }, connection);

      /**
       * ASSIGN ROLE
       */

      await ManufacturerRepository.assignRole(userId,roleId,connection);

      /**
       * GENERATE API KEY
       */

      const rawApiKey =`DMS_${crypto.randomBytes(32).toString('hex')}`;

      await ManufacturerRepository.createApiKey({
        manufacturer_id: manufacturerId,
        user_id: userId,
        api_key: rawApiKey,
        key_name: `${payload.company_name} System Key`
      }, connection);

      /**
       * COMMIT TRANSACTION
       */

      await connection.commit();

      /**
       * SEND API KEY EMAIL
       * AFTER COMMIT
       */

      try {

        await sendOnboardMessage(payload.admin_email,payload.password,
          payload.company_name,`${payload.first_name} ${payload.last_name}`);

        console.log("Password sent successfully");

      } catch (mailError) {

        console.log("Email sending failed:", mailError);

      }

      /**
       * RESPONSE
       */

      return {
        success: true,
        message: 'Manufacturer onboarded successfully',
        data: {
          manufacturer_id: manufacturerId,
          admin_user_id: userId,
          api_key: rawApiKey
        }
      };

    } catch (error) {

      await connection.rollback();

      throw error;

    } finally {

      connection.release();

    }
  }
  static async getDistributor(payload) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction(payload);
      const distributors = await ManufacturerRepository.getDistributor(payload, connection)
    
      await connection.commit()
      return {
        success: true,
        message: 'Distributor Fetched Successfully',
        Distributors:distributors 
       
      };
    }
    catch (error) {
      await connection.rollback();
      throw error;
    }
    finally {
      connection.release()
    }

  }
}

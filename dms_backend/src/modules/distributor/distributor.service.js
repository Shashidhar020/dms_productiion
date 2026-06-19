import XLSX from "xlsx";
import validator from "validator";
import bcrypt from "bcrypt";
import { db } from "../../config/database.js";
import fs from "fs";
import { DistributorRepository } from "./distributor.repository.js";
import { sendOTP, sendApiKey, sendOnboardMessage } from "../../services/Mailservices.js";
const repo = new DistributorRepository()
export class DistributorService {

  constructor() {
    this.repository = new DistributorRepository(db);
  }
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

      const existingUser = await repo.checkUserEmail(connection, payload.admin_email);

      if (existingUser) {

        const error = new Error("Admin email already exists");

        error.statusCode = 409;

        throw error;
      }

      /**
       * RATE LIMIT CHECK
       */

      const recentOtp = await DistributorRepository.getLatestOTP(payload.admin_email, connection);

      if (recentOtp) {

        const now = new Date();

        const createdAt = new Date(recentOtp.created_at);

        const diffSeconds = (now - createdAt) / 1000;

        if (diffSeconds < 30) {

          const error = new Error(
            `Please wait ${Math.ceil(30 - diffSeconds)} seconds before requesting another OTP`);

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

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      /**
       * SAVE OTP
       */

      await DistributorRepository.createOTP({
        email: payload.admin_email,
        otp_hash: otpHash,
        expires_at: expiresAt
      }, connection);

      /**
       * SEND EMAIL
       */

      await sendOTP(payload.admin_email, otp);

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

      const otpRecord = await DistributorRepository.getValidOTP(payload.admin_email, connection);

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

      const isValid = await bcrypt.compare(payload.otp, otpRecord.otp_hash);

      if (!isValid) {

        await DistributorRepository.incrementOTPAttempts(otpRecord.id, connection);

        const error = new Error("Invalid OTP");

        error.statusCode = 400;

        throw error;
      }

      /**
       * MARK VERIFIED
       */

      await DistributorRepository.markOTPVerified(otpRecord.id, connection);

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
  async onboardDistributor(payload, currentUser) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      if (!currentUser) {
        throw new Error("Unauthorized");
      }

      const manufacturerId = currentUser.manufacturerId;
      const parentDistributorId = currentUser.distributorId
      // VALIDATE PARENT DISTRIBUTOR
      if (currentUser.distributorId) {
        const parentDistributor = await this.repository.findParentDistributor(connection, currentUser.distributorId, manufacturerId);

        if (!parentDistributor) {
          throw new Error("Invalid parent distributor");
        }
      }

      // CHECK ROLE CODE
      // const existingRole = await this.repository.checkRoleExists(
      //       connection,
      //       manufacturerId,
      //       payload.role_name
      //     );

      // if (existingRole) {
      //   throw new Error(
      //     "Role Name already exists"
      //   );
      // }

      // CHECK EMAIL
      const existingUser = await this.repository.checkUserEmail(connection, payload.admin_user.email);

      if (existingUser) {
        throw new Error("Email already exists");
      }

      // VALIDATE PERMISSIONS
      const permissions = await this.repository.validatePermissions(connection, payload.permission_ids);

      if (permissions.length !== payload.permission_ids.length) {
        throw new Error("Invalid permissions");
      }

      // CREATE DISTRIBUTOR
      const distributorId = await this.repository.createDistributor(connection, payload, manufacturerId, parentDistributorId);

      // AUTO GENERATE CODE
      const distributorCode = await this.repository.updateDistributorCode(connection, distributorId);

      // CREATE ROLE
      const roleId = await this.repository.createRole(connection, manufacturerId, payload.role_name);

      // MAP ROLE PERMISSIONS
      await this.repository.mapRolePermissions(connection, roleId, payload.permission_ids);

      // HASH PASSWORD
      const hashedPassword = await bcrypt.hash(payload.admin_user.password, 10);

      // CREATE USER
      const userId = await this.repository.createUser(connection, {
        manufacturer_id: manufacturerId,
        distributor_id: distributorId,
        reporting_to_user_id: currentUser.userId,
        user_type: "DISTRIBUTOR",
        first_name: payload.admin_user.first_name,
        last_name: payload.admin_user.last_name,
        email: payload.admin_user.email,
        mobile: payload.admin_user.mobile,
        password_hash: hashedPassword
      });

      // ASSIGN ROLE
      await this.repository.assignRoleToUser(connection, userId, roleId);

      // CREATE API KEY
      const apiKey = await this.repository.createApiKey(connection, manufacturerId, distributorId, userId, payload.role_name);

      await connection.commit();

      try {

        await sendApiKey(
          payload.admin_user.email,
          apiKey,
          payload.business_name,
          `${payload.admin_user.first_name} ${payload.admin_user.last_name}`
        );

        console.log("API key sent successfully");

      } catch (mailError) {
        console.log("Email sending failed:", mailError);
      }

      return {
        success: true,
        message: "Distributor onboarded successfully",
        data: {
          distributor_id: distributorId,
          distributor_code: distributorCode,
          user_id: userId,
          role_id: roleId,
          api_key: apiKey
        }
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }


  async bulkOnboardDistributors(filePath, currentUser) {
    let connection;
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
      if (!rows.length) {
        return { success: false, message: "Excel file is empty" };
      }

      const requiredColumns = ["business_name", "owner_name", "gst_number", "pan_number",
        "company_email", "company_mobile", "company_address", "state_name", "city_name",
        "pincode", "first_name", "last_name", "userEmail", "userMobile"];
      const excelColumns = Object.keys(rows[0]);
      const missingColumns = [];
      for (const column of requiredColumns) {
        if (!excelColumns.includes(column)) {
          missingColumns.push(column);
        }
      }
      if (missingColumns.length > 0) {
        return {
          success: false, message: "Missing required columns",
          failures: [{
            row: null, email: null,
            reason: missingColumns.map(col => `Missing column: ${col}`)
          }]
        }
      }
      /**
       * VALIDATION STORAGE
       */
      const failures = [];
      /**
       * EXCEL DUPLICATE TRACKERS
       */
      const emailSet = new Set();
      const gstSet = new Set();
      const panSet = new Set();
      /**
       * DB CONNECTION
       */
      connection = await db.getConnection();
      /**
       * =====================================
       * PHASE 1
       * COMPLETE VALIDATION
       * =====================================
       */
      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        /**
         * NORMALIZE ROW
         */
        const normalizedRow = {
          business_name: String(row.business_name || "").trim(),
          owner_name: String(row.owner_name || "").trim(),
          gst_number: String(row.gst_number || "").trim(),
          pan_number: String(row.pan_number || "").trim(),
          company_email: String(row.company_email || "").trim(),
          company_mobile: String(row.company_mobile || "").trim(),
          company_address: String(row.company_address || "").trim(),
          state_name: String(row.state_name || "").trim(),
          city_name: String(row.city_name || "").trim(),
          pincode: String(row.pincode || "").trim(),
          first_name: String(row.first_name || "").trim(),
          last_name: String(row.last_name || "").trim(),
          userEmail: String(row.userEmail || "").trim(),
          userMobile: String(row.userMobile || "").trim()
        };
        /**
         * STORE ROW ERRORS
         */
        const rowErrors = [];
        /**
         * REQUIRED FIELD CHECK
         */
        for (const [key, value] of Object.entries(normalizedRow)) {
          if (value === undefined || value === null || String(value).trim() === "") {
            rowErrors.push(`${key} is required`);
          }
        }
        /**
         * EMAIL FORMAT
         */
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (normalizedRow.userEmail && !emailRegex.test(normalizedRow.userEmail)) {
          rowErrors.push("Invalid user email format");
        }
        if (normalizedRow.company_email && !emailRegex.test(normalizedRow.company_email)) {
          rowErrors.push("Invalid company email format");
        }
        /**
         * MOBILE FORMAT
         */
        const mobileRegex = /^[0-9]{10}$/;
        if (normalizedRow.userMobile && !mobileRegex.test(normalizedRow.userMobile)) {
          rowErrors.push("Invalid user mobile number");
        }
        if (normalizedRow.company_mobile && !mobileRegex.test(normalizedRow.company_mobile)) {
          rowErrors.push("Invalid company mobile number");
        }
        /**
         * GST FORMAT
         */
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (normalizedRow.gst_number && !gstRegex.test(normalizedRow.gst_number)) {
          rowErrors.push("Invalid GST number");
        }
        /**PAN FORMAT
         * 
        */
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (normalizedRow.pan_number && !panRegex.test(normalizedRow.pan_number)) {
          rowErrors.push("Invalid PAN number");
        }
        /**
         * EXCEL DUPLICATES
         */
        if (normalizedRow.userEmail) {
          if (emailSet.has(normalizedRow.userEmail)) {
            rowErrors.push("Duplicate user email inside excel");
          } else {
            emailSet.add(normalizedRow.userEmail);
          }
        }
        if (normalizedRow.gst_number) {
          if (gstSet.has(normalizedRow.gst_number)) {
            rowErrors.push("Duplicate GST inside excel");
          } else {
            gstSet.add(normalizedRow.gst_number);
          }
        }
        if (normalizedRow.pan_number) {
          if (panSet.has(normalizedRow.pan_number)) {
            rowErrors.push("Duplicate PAN inside excel");
          }
          else {
            panSet.add(normalizedRow.pan_number);
          }
        }
        /**
         * DB VALIDATIONS
         */
        const existingUser = await this.repository.checkUserEmail(connection, normalizedRow.userEmail);
        if (existingUser) {
          rowErrors.push("User email already exists");
        }
        const existingGST = await this.repository.checkDistributorGST(connection, normalizedRow.gst_number);
        if (existingGST) {
          rowErrors.push("GST already exists");
        }
        const existingPAN = await this.repository.checkDistributorPAN(connection, normalizedRow.pan_number);
        if (existingPAN) {
          rowErrors.push("PAN already exists");
        }
        /**
         * STORE FAILURE
         */
        if (rowErrors.length > 0) {
          failures.push({
            row: index + 1,
            email: normalizedRow.userEmail || null,
            reason: rowErrors
          });
        }
      }
      /**
       * STOP IF VALIDATION FAILED
       */
      if (failures.length > 0) {
        return {
          success: false,
          message: "Excel validation failed",
          total: rows.length,
          failed_count: failures.length,
          failures
        };
      }
      /**
       * =====================================
       * PHASE 2
       * SINGLE TRANSACTION IMPORT
       * =====================================
       */
      const results = [];
      const emailQueue = [];
      await connection.beginTransaction();
      try {
        for (let index = 0; index < rows.length; index++) {
          const row = rows[index];
          /**
           * NORMALIZE
           */
          const normalizedRow = {
            business_name: String(row.business_name || "").trim(),
            owner_name: String(row.owner_name || "").trim(),
            gst_number: String(row.gst_number || "").trim(),
            pan_number: String(row.pan_number || "").trim(),
            company_email: String(row.company_email || "").trim(),
            company_mobile: String(row.company_mobile || "").trim(),
            company_address: String(row.company_address || "").trim(),
            state_name: String(row.state_name || "").trim(),
            city_name: String(row.city_name || "").trim(),
            pincode: String(row.pincode || "").trim(),
            first_name: String(row.first_name || "").trim(),
            last_name: String(row.last_name || "").trim(),
            userEmail: String(row.userEmail || "").trim(),
            userMobile: String(row.userMobile || "").trim()
          };
          /**
           * PASSWORD
           */
          const password = `${normalizedRow.first_name}@321`;
          const hashedPassword = await bcrypt.hash(password, 10);
          /**
           * PAYLOAD
           */
          const payload = {
            business_name: normalizedRow.business_name,
            owner_name: normalizedRow.owner_name,
            gst_number: normalizedRow.gst_number,
            pan_number: normalizedRow.pan_number,
            email: normalizedRow.company_email,
            mobile: normalizedRow.company_mobile,
            address: normalizedRow.company_address,
            state_name: normalizedRow.state_name,
            city_name: normalizedRow.city_name,
            pincode: normalizedRow.pincode,
            role_name: "Distributor",
            permission_ids: [1, 2, 3],
            admin_user: {
              first_name: normalizedRow.first_name,
              last_name: normalizedRow.last_name,
              email: normalizedRow.userEmail,
              mobile: normalizedRow.userMobile,
              password
            }
          };
          /**
           * CREATE DISTRIBUTOR
           */
          const distributorId = await this.repository.createDistributor(connection, payload, currentUser.manufacturerId, currentUser.distributorId);
          /**
           * UPDATE DISTRIBUTOR CODE
           */
          const distributorCode = await this.repository.updateDistributorCode(connection, distributorId);

          /**
           * CREATE ROLE
           * EXISTING LOGIC UNCHANGED
           */
          const roleId = await this.repository.createRole(connection, currentUser.manufacturerId, payload.role_name);
          /**
           * MAP ROLE PERMISSIONS
           * EXISTING LOGIC UNCHANGED
           */
          await this.repository.mapRolePermissions(connection, roleId, payload.permission_ids);
          /**
           * CREATE USER
           */
          const userId = await this.repository.createUser(connection,
            {
              manufacturer_id: currentUser.manufacturerId,
              distributor_id: distributorId,
              reporting_to_user_id: currentUser.userId,
              user_type: "DISTRIBUTOR",
              first_name: payload.admin_user.first_name,
              last_name: payload.admin_user.last_name,
              email: payload.admin_user.email,
              mobile: payload.admin_user.mobile,
              password_hash: hashedPassword
            }
          );
          /**
           * ASSIGN ROLE
           */
          await this.repository.assignRoleToUser(connection, userId, roleId);
          /**
           * CREATE API KEY
           */
          const apiKey = await this.repository.createApiKey(connection, currentUser.manufacturerId,
            distributorId, userId, payload.role_name);
          /**
           * SUCCESS
           */
          results.push({
            row: index + 1,
            distributor_id: distributorId,
            distributor_code: distributorCode,
            user_id: userId,
            api_key: apiKey
          });
          emailQueue.push({
            email: payload.admin_user.email,
            password: password,
            companyName: payload.business_name,
            adminName: `${payload.admin_user.first_name} ${payload.admin_user.last_name}`
          });
        }
        /**
         * COMMIT ENTIRE IMPORT
         */
        /**
         * SUCCESS RESPONSE
         */
        await connection.commit();
        try {
          await Promise.allSettled(
            emailQueue.map(user => sendOnboardMessage(user.email, user.password, user.companyName, user.adminName)));
        } catch (emailError) {
          console.error(emailError);
        }

        return {
          success: true,
          message: "Bulk onboarding completed successfully",
          total: rows.length,
          success_count: results.length,
          results
        };
      } catch (error) {
        /**
         * ROLLBACK ENTIRE IMPORT
         */
        await connection.rollback();
        return {
          success: false,
          message: "Bulk onboarding failed",
          error: error.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    } finally {
      /**
       * RELEASE CONNECTION
       */
      if (connection) {
        connection.release();
      }
      /**
       * DELETE FILE
       */
      if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log("File delete failed:", err.message);
          }
        }
        );
      }
    }
  }
  async deleteDistributor(distributorId, currentUser) {
    const result = await this.repository.deleteById(
      distributorId,
      currentUser.manufacturerId
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "Distributor not found"
      };
    }

    return {
      success: true,
      message: "Distributor deleted successfully"
    };
  }
}
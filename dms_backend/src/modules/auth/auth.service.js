
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from '../../config/database.js';
import validator from "validator";
import { sendOTP, sendNewEmailNotification, sendOldEmailNotification, sendPasswordChangedNotification, sendEmailChangeLink } from "../../services/Mailservices.js";
import authRepository from "./auth.repository.js";
import { env } from "../../config/env.js";
import crypto from "crypto";
class AuthService {

  async login(payload, meta) {
    const { email, password } = payload;

    const user = await authRepository.findUserByEmail(email);

    if (!user) throw new Error("Invalid credentials");
    if (user.status !== "ACTIVE") throw new Error("User inactive");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error("Invalid credentials");

    const sessionId = uuidv4();

    const accessToken = jwt.sign({
      userId: user.id,
      manufacturerId: user.manufacturer_id,
      distributorId: user.distributor_id,
      userType: user.user_type,
      sessionId
    }, env.accessSecret, { algorithm: "HS256", expiresIn: env.accessExpires });

    const refreshToken = jwt.sign(
      { userId: user.id },
      env.refreshSecret,
      { algorithm: "HS256", expiresIn: env.refreshExpires }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await authRepository.createSession({
      sessionId,
      userId: user.id,
      manufacturerId: user.manufacturer_id,
      distributorId: user.distributor_id,
      refreshToken,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        manufacturerId: user.manufacturer_id,
        distributorId: user.distributor_id,
        userType: user.user_type,
        email: user.email,
      }
    };
  }
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new Error("Refresh token missing");

    const decoded = jwt.verify(refreshToken, env.refreshSecret);

    const session = await authRepository.findSessionByRefreshToken(refreshToken);

    if (!session) throw new Error("Invalid session");
    if (session.status !== "ACTIVE") throw new Error("Session inactive");
    if (new Date(session.expires_at) < new Date()) throw new Error("Session expired");

    const user = await authRepository.findUserById(decoded.userId);
    if (!user || user.status !== "ACTIVE") throw new Error("User inactive");

    const newAccessToken = jwt.sign({
      userId: user.id,
      manufacturerId: user.manufacturer_id,
      distributorId: user.distributor_id,
      userType: user.user_type,
      sessionId: session.session_id
    }, env.accessSecret, { algorithm: "HS256", expiresIn: env.accessExpires });

    return { accessToken: newAccessToken };
  }
  async logout(refreshToken) {
    if (!refreshToken) throw new Error("Refresh token missing");

    await authRepository.revokeSession(refreshToken);

    return true;
  }
  async changeEmail(auth, payload, meta) {
    const { password, newEmail } = payload;

    const user = await authRepository.findUserForEmailChange(auth.userId);

    if (!user) throw new Error("User not found");

    if (user.status !== "ACTIVE") throw new Error("User inactive");
    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
      throw new Error(
        "New email cannot be same as current email"
      );
    }
    // Run independent operations together
    const [valid, existing] = await Promise.all([
      bcrypt.compare(password, user.password_hash),
      authRepository.findUserByEmail(newEmail),
    ]);

    if (!valid) throw new Error("Invalid credentials");

    if (existing) throw new Error("Email already exists");

    const oldEmail = user.email;

    // Update email and revoke session simultaneously

    await authRepository.updateEmail(auth.userId, newEmail)
    await authRepository.revokeSession(meta.refreshToken)


    const sessionId = uuidv4();

    const accessToken = jwt.sign(
      {
        userId: user.id,
        manufacturerId: user.manufacturer_id,
        distributorId: user.distributor_id,
        userType: user.user_type,
        sessionId,
      },
      env.accessSecret,
      {
        algorithm: "HS256",
        expiresIn: env.accessExpires,
      }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
      },
      env.refreshSecret,
      {
        algorithm: "HS256",
        expiresIn: env.refreshExpires,
      }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await authRepository.createSession({
      sessionId,
      userId: user.id,
      manufacturerId: user.manufacturer_id,
      distributorId: user.distributor_id,
      refreshToken,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      expiresAt,
    });

    // Send emails in background
    Promise.all([sendOldEmailNotification(oldEmail, newEmail),
    sendNewEmailNotification(newEmail),
    ]).catch((err) => {
      console.error("Email notification error:", err);
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        manufacturerId: user.manufacturer_id,
        distributorId: user.distributor_id,
        userType: user.user_type,
        email: newEmail,
      },
    };
  }
  async verifyPassword(auth, payload) {

    const { password } = payload;

    if (!password) throw new Error("Password is required");

    const user = await authRepository.findUserForPasswordVerification(auth.userId);

    if (!user) throw new Error("User not found");

    if (user.status !== "ACTIVE") throw new Error("User inactive");

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) throw new Error("Invalid credentials");

    return true;

  }
  async changePassword(auth, payload, meta) {

    const { currentPassword, newPassword } = payload;
    if (!newPassword || newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    const user = await authRepository.findUserForPasswordChange(auth.userId);

    if (!user) throw new Error("User not found");

    if (user.status !== "ACTIVE") throw new Error("User inactive");

    const valid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!valid) throw new Error("Invalid credentials");

    const samePassword = await bcrypt.compare(newPassword, user.password_hash);

    if (samePassword)
      throw new Error("New password cannot be same as current password");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Promise.all([
      authRepository.updatePassword(auth.userId, hashedPassword),
      authRepository.revokeSession(meta.refreshToken)
    ]);

    const sessionId = uuidv4();

    const accessToken = jwt.sign({
      userId: user.id,
      manufacturerId: user.manufacturer_id,
      distributorId: user.distributor_id,
      userType: user.user_type,
      sessionId
    },
      env.accessSecret,
      {
        algorithm: "HS256",
        expiresIn: env.accessExpires
      });

    const refreshToken = jwt.sign(
      {
        userId: user.id
      },
      env.refreshSecret,
      {
        algorithm: "HS256",
        expiresIn: env.refreshExpires
      });

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 7);

    await authRepository.createSession({
      sessionId,
      userId: user.id,
      manufacturerId: user.manufacturer_id,
      distributorId: user.distributor_id,
      refreshToken,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      expiresAt
    });

    sendPasswordChangedNotification(user.email).catch(console.error);

    return {

      accessToken,

      refreshToken

    };

  }
  async forgotPassword(payload) {
    const { email, newPassword } = payload;

    if (!newPassword || newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const user = await authRepository.findUserByEmail(email);

    if (!user) throw new Error("User not found");

    if (user.status !== "ACTIVE") throw new Error("User inactive");

    // OTP already verified before reaching here

    const samePassword = await bcrypt.compare(newPassword, user.password_hash);

    if (samePassword)
      throw new Error("New password cannot be same as current password");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await authRepository.updatePassword(user.id, hashedPassword);

    sendPasswordChangedNotification(user.email).catch(console.error);

    return true;
  }
  async logoutAll(auth) {

    const user = await authRepository.findUserById(auth.userId);

    if (!user)
      throw new Error("User not found");

    if (user.status !== "ACTIVE")
      throw new Error("User inactive");

    await authRepository.revokeAllSessions(auth.userId);

    return true;
  }
  async sendOnboardOTP(payload) {
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

        const error = new Error(
          "Invalid Email"
        );

        error.statusCode = 400;

        throw error;
      }

      /**
       * CHECK EXISTING USER
       */


      /**
       * RATE LIMIT CHECK
       */

      const recentOtp = await authRepository.getLatestOTP(payload.admin_email, connection);

      if (recentOtp) {

        const now = new Date();

        const createdAt = new Date(recentOtp.created_at);

        const diffSeconds = (now - createdAt) / 1000;

        if (diffSeconds < 30) {

          const error = new Error(
            `Please wait ${Math.ceil(30 - diffSeconds)} seconds before requesting another OTP`
          );

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

      await authRepository.createOTP({
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
  async requestEmailChange(auth, payload) {
    const { password, newEmail } = payload;
    console.log(payload)
    const user = await authRepository.findUserForEmailChange(auth.userId);
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error("Invalid password");

    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
      throw new Error("New email cannot be same as current email");
    }

    const existing = await authRepository.findUserByEmail(newEmail);
    if (existing) throw new Error("Email already exists");

    // generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await authRepository.createEmailChangeRequest({
      userId: user.id,
      oldEmail: user.email,
      newEmail,
      token,
      expiresAt
    });

    const verifyLink = `${env.clientUrl}/verify-email-change?token=${token}`;
    await sendEmailChangeLink(newEmail, verifyLink);

    return true;
  }
  async verifyEmailChange(token, req) {

    const request = await authRepository.findEmailChangeRequest(token);

    if (!request) throw new Error("Invalid or expired token");

    if (request.status !== "PENDING") {
      throw new Error("Token already used");
    }

    if (new Date() > new Date(request.expires_at)) {
      await authRepository.expireEmailChange(token);
      throw new Error("Token expired");
    }

    // transaction recommended (simple version shown)

    await authRepository.updateEmail(request.user_id, request.new_email);

    await authRepository.markEmailChangeVerified(token);

    // revoke all sessions (IMPORTANT)
    // await authRepository.revokeAllSessions(request.user_id);

    const newSessionId = uuidv4();

    // const accessToken = jwt.sign(
    //   {
    //     userId: request.user_id,
    //     manufacturerId: request.manufacturer_id,
    //     distributorId: request.distributor_id,
    //     userType: request.user_type,
    //     sessionId: newSessionId
    //   },
    //   env.accessSecret,
    //   { algorithm: "HS256", expiresIn: env.accessExpires }
    // );

    // const refreshToken = jwt.sign(
    //   { userId: request.user_id },
    //   env.refreshSecret,
    //   { algorithm: "HS256", expiresIn: env.refreshExpires }
    // );

    // await authRepository.createSession({
    //   sessionId: newSessionId,
    //   userId: request.user_id,
    //   manufacturerId: request.manufacturer_id,
    //   distributorId: request.distributor_id,
    //   refreshToken,
    //   ipAddress: req.ip,
    //   userAgent: req.headers["user-agent"],
    //   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    // });

    const user = await authRepository.findUserById(request.user_id);

    return user
  }
}

export default new AuthService();

import authService from "./auth.service.js";
import { env } from "../../config/env.js";
import jwt from "jsonwebtoken";
class AuthController {

  async login(req, res) {
    try {
      const result = await authService.login(req.body, {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "Login successful",
        userType: result.user.userType,
        data: { user: result.user }
      });

    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message
      });
    }
  }

  async refresh(req, res) {
    try {
      const token = req.cookies.refreshToken;
      const result = await authService.refreshAccessToken(token);
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "Token refreshed"
      });

    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message
      });
    }
  }

  async logout(req, res) {
    try {
      await authService.logout(req.cookies.refreshToken)
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.json({
        success: true,
        message: "Logout successful"
      });

    } catch (err) {
      console.log(err)
      return res.status(401).json({
        success: false,
        message: err.message
      });
    }
  }
  async me(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ authenticated: false });
    }
    try {
      // verify refresh token

      const payload = jwt.verify(refreshToken, env.refreshSecret);

      return res.json({
        authenticated: true,
        userId: payload.userId,
      });
    } catch (error) {
      console.log(error)
      return res.status(401).json({ authenticated: false });
    }
  }
  async changeEmail(req, res) {
    try {
      const result = await authService.changeEmail(req.auth, req.body,
        {
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          refreshToken: req.cookies.refreshToken,
        }
      );

      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "Email updated successfully",
        data: {
          user: result.user,
        },
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message,
      });
    }
  }
  async verifyPassword(req, res) {
    try {

      await authService.verifyPassword(req.auth, req.body);

      return res.json({
        success: true,
        message: "Password verified"
      });

    } catch (err) {

      return res.status(401).json({
        success: false,
        message: err.message
      });

    }
  }
  async changePassword(req, res) {
    try {

      const result = await authService.changePassword(req.auth, req.body,
        {
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          refreshToken: req.cookies.refreshToken
        }
      );

      res.cookie("accessToken", result.accessToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000,
        }
      );

      res.cookie("refreshToken", result.refreshToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
      );

      return res.json({
        success: true,
        message: "Password updated successfully"
      });

    } catch (err) {

      return res.status(401).json({
        success: false,
        message: err.message
      });

    }
  }
  async forgotPassword(req, res) {
    try {

      await authService.forgotPassword(req.body);

      return res.json({
        success: true,
        message: "Password updated successfully"
      });

    } catch (err) {

      return res.status(401).json({
        success: false,
        message: err.message
      });

    }
  }
  async logoutAll(req, res) {
    try {

      await authService.logoutAll(req.auth);

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.json({
        success: true,
        message: "Logged out from all devices"
      });

    } catch (err) {

      return res.status(401).json({
        success: false,
        message: err.message
      });

    }
  }
  async sendOTP(req, res) {
    try {
      const response = await authService.sendOnboardOTP(req.body);
      return res.status(200).json(response);

    } catch (error) {
      console.log(error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Unable to send OTP"
      });
    }
  }
  async requestEmailChange(req, res) {
    try {
      console.log("Entered")
      const result = await authService.requestEmailChange(req.auth, req.body);

      return res.json({
        success: true,
        message: "Verification link sent to new email"
      });

    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
  async verifyEmailChange(req, res) {
    try {
      const result = await authService.verifyEmailChange(req.query.token, req);
    //  console.log(result.accessToken)
    //  console.log(result.refreshToken)
    //   res.cookie("accessToken", result.accessToken, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: "strict",
    //     maxAge: 24 * 60 * 60 * 1000,
    //   });

    //   res.cookie("refreshToken", result.refreshToken, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: "strict",
    //     maxAge: 7 * 24 * 60 * 60 * 1000,
    //   });

      return res.json({
        success: true,
        message: "Email updated successfully",
        data: result
      });

    } catch (err) {
      console.log(err)
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
}

export default new AuthController();
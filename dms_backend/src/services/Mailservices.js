

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});


// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });
// Verify SMTP connection
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("SMTP Error:", error);
//   } else {
//     console.log("SMTP Server Ready");
//   }
// });

/**
 * Send OTP Email
 */
export const sendOTP = async (email, otp) => {
  try {
    const response = await transporter.sendMail({
      from: `"DMS System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Manufacturer Email Verification OTP",
      html: `
        <div style="font-family: Arial; padding: 20px; background:#f8f9fa;">
          <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:10px;">
            
            <h2>Email Verification</h2>

            <p>Use the OTP below to verify your email.</p>

            <div style="
              background:#f4f4f4;
              padding:18px;
              border-radius:8px;
              font-size:30px;
              font-weight:bold;
              text-align:center;
              letter-spacing:5px;
              margin:20px 0;">
              ${otp}
            </div>

            <p>This OTP will expire in <strong>5 minutes</strong>.</p>

            <p>If you did not request this, please ignore this email.</p>

          </div>
        </div>
      `,
    });

    console.log("OTP Email Sent:", response.messageId);

    return response;
  } catch (error) {
    console.error("OTP Email Error:", error);
    throw error;
  }
};

/**
 * Send API Key Email
 */

export const sendApiKey = async (email,apiKey,companyName,adminName) => {
  try {
    const response = await transporter.sendMail({
      from: `"DMS System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your API Key",
      html: `
        <div style="font-family: Arial; padding:20px;">

          <h2>Welcome ${adminName}</h2>

          <p>
            Your account for
            <strong>${companyName}</strong>
            has been created successfully.
          </p>

          <p>Below is your API Key:</p>

          <div style="
            background:#f4f4f4;
            padding:15px;
            border-radius:5px;
            word-break:break-all;
            font-size:15px;">
            ${apiKey}
          </div>

          <br/>

          <p>
            Keep this API key secure.
            Do not share it publicly.
          </p>

        </div>
      `,
    });

    console.log("API Key Email Sent:", response.messageId);
     
    return response;
  } catch (error) {
    console.error("API Key Email Error:", error);
    throw error;
  }
};

/**
 * Send Welcome / Password Email
 */
export const sendOnboardMessage = async (email,password,companyName,adminName) => {
  try {
    const response = await transporter.sendMail({
      from: `"DMS System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "DMS Manufacturer Onboarding",
      html: `
        <div style="font-family: Arial; padding:20px;">

          <h2>Welcome ${adminName}</h2>

          <p>
            Your account for
            <strong>${companyName}</strong>
            has been created successfully.
          </p>

          <p>Temporary Password:</p>

          <div style="
            background:#f4f4f4;
            padding:15px;
            border-radius:5px;
            word-break:break-all;
            font-size:15px;">
            ${password}
          </div>

          <br/>

          <p>
            Please change your password after first login.
          </p>

        </div>
      `,
    });

    console.log("Onboarding Email Sent:", response.messageId);

    return response;
  } catch (error) {
    console.error("Password Email Error:", error);
    throw error;
  }
};

export const sendOldEmailNotification = async (oldEmail,newEmail) => {
  await transporter.sendMail({
    from: `"DMS System" <${process.env.EMAIL_USER}>`,
    to: oldEmail,
    subject: "Email Changed",
    html: `
      <h2>Email Changed</h2>

      <p>Your account email has been changed.</p>

      <p>
        New Email:
        <strong>${newEmail}</strong>
      </p>

      <p>
        If this wasn't you,
        contact support immediately.
      </p>
    `,
  });
};
export const sendNewEmailNotification = async (email) => {
  await transporter.sendMail({
    from: `"DMS System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Updated Successfully",
    html: `
      <h2>Email Updated</h2>

      <p>
        Your email has been updated successfully.
      </p>

      <p>
        You can now login using:
        <strong>${email}</strong>
      </p>
    `,
  });
};

export const sendPasswordChangedNotification = async ( email)=>{

await transporter.sendMail({

from:`"DMS System"<${process.env.EMAIL_USER}>`,

to:email,

subject:"Password Changed",

html:
`
<h2>Password Changed</h2>

<p>

Your account password has been changed.

</p>

<p>

If you did not perform this action, contact support
immediately.

</p>
`
});

};
export const sendEmailChangeLink = async (email, link) => {
  return transporter.sendMail({
    from: `${"DMS System".bold()} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your new email",
    html: `
      <h2>Email Change Request</h2>

      <p>You requested to change your email.</p>

      <p>Click below link to confirm:</p>

      <a href="${link}" style="
        display:inline-block;
        padding:10px 20px;
        background:#4CAF50;
        color:white;
        text-decoration:none;
        border-radius:5px;">
        Verify Email
      </a>

      <p>This link expires in 15 minutes.</p>

      <p>If this wasn't you, ignore this email.</p>
    `
  });
};
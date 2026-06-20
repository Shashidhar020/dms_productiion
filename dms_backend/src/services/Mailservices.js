// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();

// /**
//  * Generic Email Sender
//  */
// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const response = await axios.post(
//       "https://api.brevo.com/v3/smtp/email",
//       {
//         sender: {
//           name: "DMS System",
//           email: process.env.EMAIL_USER,
//         },
//         to: [
//           {
//             email: to,
//           },
//         ],
//         subject,
//         htmlContent: html,
//       },
//       {
//         headers: {
//           accept: "application/json",
//           "api-key": process.env.BREVO_API_KEY,
//           "content-type": "application/json",
//         },
//       }
//     );

//     console.log("Email Sent:", response.data);

//     return response.data;
//   } catch (error) {
//     console.error(
//       "Brevo Error:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

// /**
//  * Send OTP
//  */
// export const sendOTP = async (email, otp) => {
//   return sendEmail({
//     to: email,
//     subject: "Manufacturer Email Verification OTP",
//     html: `
//       <h2>Email Verification</h2>

//       <p>Use the OTP below to verify your email.</p>

//       <div style="
//         background:#f4f4f4;
//         padding:18px;
//         border-radius:8px;
//         font-size:30px;
//         font-weight:bold;
//         text-align:center;
//         letter-spacing:5px;
//         margin:20px 0;">
//         ${otp}
//       </div>

//       <p>This OTP will expire in <strong>5 minutes</strong>.</p>

//       <p>If you did not request this, please ignore this email.</p>
//     `,
//   });
// };

// /**
//  * Send API Key
//  */
// export const sendApiKey = async (
//   email,
//   apiKey,
//   companyName,
//   adminName
// ) => {
//   return sendEmail({
//     to: email,
//     subject: "Your API Key",
//     html: `
//       <h2>Welcome ${adminName}</h2>

//       <p>
//         Your account for
//         <strong>${companyName}</strong>
//         has been created successfully.
//       </p>

//       <p>Below is your API Key:</p>

//       <div style="
//         background:#f4f4f4;
//         padding:15px;
//         border-radius:5px;
//         word-break:break-all;
//         font-size:15px;">
//         ${apiKey}
//       </div>

//       <br>

//       <p>
//         Keep this API key secure.
//         Do not share it publicly.
//       </p>
//     `,
//   });
// };

// /**
//  * Send Welcome Password
//  */
// export const sendOnboardMessage = async (
//   email,
//   password,
//   companyName,
//   adminName
// ) => {
//   return sendEmail({
//     to: email,
//     subject: "DMS Manufacturer Onboarding",
//     html: `
//       <h2>Welcome ${adminName}</h2>

//       <p>
//         Your account for
//         <strong>${companyName}</strong>
//         has been created successfully.
//       </p>

//       <p>Temporary Password:</p>

//       <div style="
//         background:#f4f4f4;
//         padding:15px;
//         border-radius:5px;
//         word-break:break-all;
//         font-size:15px;">
//         ${password}
//       </div>

//       <br>

//       <p>
//         Please change your password after first login.
//       </p>
//     `,
//   });
// };

// /**
//  * Notify Old Email
//  */
// export const sendOldEmailNotification = async (
//   oldEmail,
//   newEmail
// ) => {
//   return sendEmail({
//     to: oldEmail,
//     subject: "Email Changed",
//     html: `
//       <h2>Email Changed</h2>

//       <p>Your account email has been changed.</p>

//       <p>
//         New Email:
//         <strong>${newEmail}</strong>
//       </p>

//       <p>
//         If this wasn't you,
//         contact support immediately.
//       </p>
//     `,
//   });
// };

// /**
//  * Notify New Email
//  */
// export const sendNewEmailNotification = async (
//   email
// ) => {
//   return sendEmail({
//     to: email,
//     subject: "Email Updated Successfully",
//     html: `
//       <h2>Email Updated</h2>

//       <p>
//         Your email has been updated successfully.
//       </p>

//       <p>
//         You can now login using:
//         <strong>${email}</strong>
//       </p>
//     `,
//   });
// };

// /**
//  * Password Changed Notification
//  */
// export const sendPasswordChangedNotification = async (
//   email
// ) => {
//   return sendEmail({
//     to: email,
//     subject: "Password Changed",
//     html: `
//       <h2>Password Changed</h2>

//       <p>Your account password has been changed.</p>

//       <p>
//         If you did not perform this action,
//         contact support immediately.
//       </p>
//     `,
//   });
// };

// /**
//  * Email Change Verification Link
//  */
// export const sendEmailChangeLink = async (
//   email,
//   link
// ) => {
//   return sendEmail({
//     to: email,
//     subject: "Verify your new email",
//     html: `
//       <h2>Email Change Request</h2>

//       <p>You requested to change your email.</p>

//       <p>Click below to confirm:</p>

//       <a href="${link}"
//          style="
//          display:inline-block;
//          padding:10px 20px;
//          background:#4CAF50;
//          color:white;
//          text-decoration:none;
//          border-radius:5px;">
//          Verify Email
//       </a>

//       <p>This link expires in 15 minutes.</p>

//       <p>If this wasn't you, ignore this email.</p>
//     `,
//   });
// };

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Generic Email Sender
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "DMS System",
          email: process.env.EMAIL_USER,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    console.log("Email Sent:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Brevo Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Send OTP
 */
export const sendOTP = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "Manufacturer Email Verification OTP",
    html: `
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
    `,
  });
};

/**
 * Send API Key
 */
export const sendApiKey = async (
  email,
  apiKey,
  companyName,
  adminName
) => {
  return sendEmail({
    to: email,
    subject: "Your API Key",
    html: `
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

      <br>

      <p>
        Keep this API key secure.
        Do not share it publicly.
      </p>
    `,
  });
};

/**
 * Send Welcome Password
 */
export const sendOnboardMessage = async (
  email,
  password,
  companyName,
  adminName
) => {
  return sendEmail({
    to: email,
    subject: "DMS Manufacturer Onboarding",
    html: `
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

      <br>

      <p>
        Please change your password after first login.
      </p>
    `,
  });
};

/**
 * Notify Old Email
 */
export const sendOldEmailNotification = async (
  oldEmail,
  newEmail
) => {
  return sendEmail({
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

/**
 * Notify New Email
 */
export const sendNewEmailNotification = async (
  email
) => {
  return sendEmail({
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

/**
 * Password Changed Notification
 */
export const sendPasswordChangedNotification = async (
  email
) => {
  return sendEmail({
    to: email,
    subject: "Password Changed",
    html: `
      <h2>Password Changed</h2>

      <p>Your account password has been changed.</p>

      <p>
        If you did not perform this action,
        contact support immediately.
      </p>
    `,
  });
};

/**
 * Email Change Verification Link
 */
export const sendEmailChangeLink = async (
  email,
  link
) => {
  return sendEmail({
    to: email,
    subject: "Verify your new email",
    html: `
      <h2>Email Change Request</h2>

      <p>You requested to change your email.</p>

      <p>Click below to confirm:</p>

      <a href="${link}"
         style="
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
    `,
  });
};
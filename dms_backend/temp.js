// import bcrypt from "bcryptjs";

// const hash = await bcrypt.hash("Admin@123", 10);

// console.log(hash);
// import crypto from 'crypto';

export const generateApiKey = () => {
  const apiKey = `DMS_${crypto.randomBytes(24).toString('hex')}`;
console.log("apikey",apiKey)
  const keyHash = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
console.log(keyHash)
  return {
    apiKey,     // show ONLY once to client
    keyHash,    // store in DB
  };
};
generateApiKey()


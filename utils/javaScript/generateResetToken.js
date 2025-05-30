import crypto from "crypto";

function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex"); // 32 bytes = 64 characters
  return token;
}

export default generateResetToken;

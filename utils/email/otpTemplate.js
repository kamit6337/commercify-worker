const otpTemplate = (otp) => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f7f7f7;">
    <tr>
      <td>
        <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color: #ffffff; border-radius: 10px; overflow: hidden;">
          <tr>
            <td style="padding: 20px; background-color: #4CAF50; color: #ffffff; font-size: 24px;">
              <strong>Your OTP Code</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; color: #333333; font-size: 16px;">
              <p>Please use the following OTP to complete your verification:</p>
              <h2 style="color: #4CAF50; font-size: 32px;">${otp}</h2>
              <p>This OTP is valid only for 10 minutes</p>
              <p>If you did not request this, please ignore this email.</p>
              <p>Thank you!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export default otpTemplate;

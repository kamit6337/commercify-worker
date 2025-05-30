const resetPasswordLinkTemplate = (url) => {
  return `
  <table
      role="presentation"
      cellspacing="0"
      cellpadding="0"
      border="0"
      align="center"
      width="100%"
      style="max-width: 600px; margin: 0 auto; border-radius: 10px"
    >
      <tr>
        <td bgcolor="#ffffff" style="padding: 30px">
          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            width="100%"
          >
            <tr>
              <td style="text-align: center">
                <p style="color: #333; font-size: 18px; margin: 0">
                  Click on this Link to create a new password
                </p>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding-top: 20px">
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="margin: 0 auto"
                >
                  <tr>
                    <td style="border-radius: 4px; background-color: #3cba54">
                      <a
                        href="${url}"
                        target="_blank"
                        style="
                          display: inline-block;
                          padding: 10px 20px;
                          text-decoration: none;
                          color: #ffffff;
                          font-size: 16px;
                        "
                        >Create New Password</a
                      >
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  
  `;
};

export default resetPasswordLinkTemplate;

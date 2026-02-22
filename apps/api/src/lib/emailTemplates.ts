const WEB_URL = process.env.WEB_URL || "http://localhost:3000";

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F6F8FA; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F6F8FA;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px 40px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #C8A24D; width: 40px; height: 40px; border-radius: 8px; text-align: center; vertical-align: middle;">
                    <span style="color: #0B1C2D; font-weight: 700; font-size: 16px; line-height: 40px;">CV</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="color: #0B1C2D; font-weight: 700; font-size: 20px;">Capvista</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px; color: #0B1C2D; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px 40px; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 13px; line-height: 1.5;">&copy; 2026 Capvista Holdings. All rights reserved.</p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px; line-height: 1.5;">This is a transactional email from Capvista. Please do not reply directly.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
  <tr>
    <td style="background-color: #C8A24D; border-radius: 6px;">
      <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">${text}</a>
    </td>
  </tr>
</table>`;
}

// ============================================================================
// 3a. Welcome Email
// ============================================================================
export function welcomeEmail(firstName: string, role: "FOUNDER" | "INVESTOR"): { subject: string; html: string } {
  const roleMessage =
    role === "FOUNDER"
      ? "Your account has been created. Submit your company profile to begin the listing process."
      : "Your account has been created. Complete your investor profile to access qualified investment opportunities.";

  return {
    subject: "Welcome to Capvista",
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Welcome, ${firstName}.</p>
      <p style="margin: 0 0 16px 0;">${roleMessage}</p>
      ${ctaButton("Go to Dashboard", `${WEB_URL}/dashboard`)}
      <p style="margin: 0; color: #6B7280; font-size: 14px;">If you did not create this account, please disregard this email.</p>
    `),
  };
}

// ============================================================================
// 3b. Company Submission Confirmation
// ============================================================================
export function companySubmissionEmail(companyLegalName: string): { subject: string; html: string } {
  return {
    subject: `Company Submission Received \u2014 ${companyLegalName}`,
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0;">Your company submission for <strong>${companyLegalName}</strong> has been received and is under review.</p>
      <p style="margin: 0 0 16px 0;">Our team will review your application, including corporate identity, financial documentation, and founder verification.</p>
      <p style="margin: 0 0 16px 0;">You will be notified when a decision has been made. Review typically takes 2\u20135 business days.</p>
      ${ctaButton("View Submission Status", `${WEB_URL}/dashboard`)}
    `),
  };
}

// ============================================================================
// 3c. Company Approved
// ============================================================================
export function companyApprovedEmail(companyLegalName: string): { subject: string; html: string } {
  return {
    subject: `Company Approved \u2014 ${companyLegalName}`,
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0;">Your company <strong>${companyLegalName}</strong> has been approved for listing on Capvista.</p>
      <p style="margin: 0 0 16px 0;">Next steps: Sign the Platform Participation Agreement and upload issuance documentation to publish your first deal.</p>
      ${ctaButton("Go to Dashboard", `${WEB_URL}/dashboard`)}
    `),
  };
}

// ============================================================================
// 3d. Company Rejected
// ============================================================================
export function companyRejectedEmail(companyLegalName: string, rejectionReason: string): { subject: string; html: string } {
  return {
    subject: `Company Application Update \u2014 ${companyLegalName}`,
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0;">After review, your company application for <strong>${companyLegalName}</strong> was not approved at this time.</p>
      <p style="margin: 0 0 16px 0;"><strong>Reason:</strong> ${rejectionReason}</p>
      <p style="margin: 0 0 16px 0;">If you believe this decision was made in error or would like to provide additional information, please contact us.</p>
      ${ctaButton("View Details", `${WEB_URL}/dashboard`)}
    `),
  };
}

// ============================================================================
// 3e. Investor Profile Verified
// ============================================================================
export function investorVerifiedEmail(): { subject: string; html: string } {
  return {
    subject: "Investor Profile Verified",
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0;">Your investor profile has been verified. You now have full access to qualified investment opportunities on Capvista.</p>
      <p style="margin: 0 0 16px 0;">Browse verified companies and live offerings from your dashboard.</p>
      ${ctaButton("Browse Companies", `${WEB_URL}/dashboard/investor/companies`)}
    `),
  };
}

// ============================================================================
// 3f. Investor Profile Rejected
// ============================================================================
export function investorRejectedEmail(rejectionReason: string): { subject: string; html: string } {
  return {
    subject: "Investor Profile Update",
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0;">After review, your investor profile verification was not approved at this time.</p>
      <p style="margin: 0 0 16px 0;"><strong>Reason:</strong> ${rejectionReason}</p>
      <p style="margin: 0 0 16px 0;">You may update your profile and resubmit for review.</p>
      ${ctaButton("Update Profile", `${WEB_URL}/dashboard`)}
    `),
  };
}

// ============================================================================
// 3g. Deal Submitted for Review
// ============================================================================
export function dealSubmittedEmail(dealName: string, companyName: string): { subject: string; html: string } {
  return {
    subject: `Deal Submitted for Review \u2014 ${dealName}`,
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0;">Your deal <strong>\u2018${dealName}\u2019</strong> for <strong>${companyName}</strong> has been submitted for review.</p>
      <p style="margin: 0 0 16px 0;">Our team will review the offering structure, terms, risk disclosures, and documentation.</p>
      <p style="margin: 0 0 16px 0;">You will be notified when a decision has been made.</p>
      ${ctaButton("View Deal Status", `${WEB_URL}/dashboard`)}
    `),
  };
}

// ============================================================================
// 3h. Deal Approved / Gone Live
// ============================================================================
export function dealLiveEmail(dealName: string): { subject: string; html: string } {
  return {
    subject: `Deal Now Live \u2014 ${dealName}`,
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0;">Your deal <strong>\u2018${dealName}\u2019</strong> is now live on Capvista and visible to qualified investors.</p>
      <p style="margin: 0 0 16px 0;">Investors can now express interest and commit capital to your offering.</p>
      ${ctaButton("View Live Deal", `${WEB_URL}/dashboard`)}
    `),
  };
}

// ============================================================================
// 3i. Investment Commitment Confirmation
// ============================================================================
export function investmentCommitmentEmail(
  dealName: string,
  companyName: string,
  commitmentAmount: number,
  dealId: string,
): { subject: string; html: string } {
  return {
    subject: `Investment Commitment Confirmed \u2014 ${dealName}`,
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0;">Your commitment of <strong>$${commitmentAmount.toLocaleString()}</strong> to <strong>${dealName}</strong> (${companyName}) has been recorded.</p>
      <p style="margin: 0 0 16px 0;">Next step: Complete the subscription agreement to proceed with funding.</p>
      ${ctaButton("Continue Subscription", `${WEB_URL}/dashboard/investor/invest/${dealId}`)}
    `),
  };
}

// ============================================================================
// 3j. Funding Instructions Email
// ============================================================================
export function fundingInstructionsEmail(
  dealName: string,
  wireInstructions: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    reference: string;
    amount: number;
    deadline: string;
  },
): { subject: string; html: string } {
  const deadlineFormatted = new Date(wireInstructions.deadline).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    subject: `Funding Instructions \u2014 ${dealName}`,
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0;">Your subscription to <strong>${dealName}</strong> has been executed. Please remit funds using the following instructions:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 16px 0; width: 100%; border: 1px solid #E5E7EB; border-radius: 6px; overflow: hidden;">
        <tr style="background-color: #F9FAFB;">
          <td style="padding: 10px 16px; font-weight: 600; font-size: 14px; border-bottom: 1px solid #E5E7EB; width: 40%;">Bank Name</td>
          <td style="padding: 10px 16px; font-size: 14px; border-bottom: 1px solid #E5E7EB;">${wireInstructions.bankName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; font-weight: 600; font-size: 14px; border-bottom: 1px solid #E5E7EB;">Account Number</td>
          <td style="padding: 10px 16px; font-size: 14px; border-bottom: 1px solid #E5E7EB;">${wireInstructions.accountNumber}</td>
        </tr>
        <tr style="background-color: #F9FAFB;">
          <td style="padding: 10px 16px; font-weight: 600; font-size: 14px; border-bottom: 1px solid #E5E7EB;">Routing Number</td>
          <td style="padding: 10px 16px; font-size: 14px; border-bottom: 1px solid #E5E7EB;">${wireInstructions.routingNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; font-weight: 600; font-size: 14px; border-bottom: 1px solid #E5E7EB;">Reference Code</td>
          <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #E5E7EB; color: #C8A24D;">${wireInstructions.reference}</td>
        </tr>
        <tr style="background-color: #F9FAFB;">
          <td style="padding: 10px 16px; font-weight: 600; font-size: 14px; border-bottom: 1px solid #E5E7EB;">Amount</td>
          <td style="padding: 10px 16px; font-size: 14px; border-bottom: 1px solid #E5E7EB;">$${wireInstructions.amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; font-weight: 600; font-size: 14px;">Deadline</td>
          <td style="padding: 10px 16px; font-size: 14px;">${deadlineFormatted}</td>
        </tr>
      </table>
      <p style="margin: 0 0 16px 0;"><strong>Important:</strong> Include your reference code <strong>${wireInstructions.reference}</strong> in the transfer memo. Funds must be received by ${deadlineFormatted}.</p>
      <p style="margin: 0; color: #6B7280; font-size: 14px;">Do not send funds directly to the company. All transfers must be made to the escrow account.</p>
    `),
  };
}

// ============================================================================
// 3k. Funding Confirmed
// ============================================================================
export function fundingConfirmedEmail(
  dealName: string,
  companyName: string,
  fundedAmount: number,
): { subject: string; html: string } {
  return {
    subject: `Investment Funded \u2014 ${dealName}`,
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0;">Your investment of <strong>$${fundedAmount.toLocaleString()}</strong> in <strong>${dealName}</strong> (${companyName}) has been confirmed.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
        <tr>
          <td style="padding: 4px 0; font-size: 15px;"><strong>Funded amount:</strong> $${fundedAmount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 15px;"><strong>Status:</strong> Active</td>
        </tr>
      </table>
      <p style="margin: 0 0 16px 0;">You can track your investment performance from your dashboard.</p>
      ${ctaButton("View My Investments", `${WEB_URL}/dashboard`)}
    `),
  };
}

// ============================================================================
// 3l. Password Reset
// ============================================================================
export function passwordResetEmail(resetToken: string): { subject: string; html: string } {
  return {
    subject: "Password Reset \u2014 Capvista",
    html: baseTemplate(`
      <p style="margin: 0 0 16px 0;">A password reset was requested for your Capvista account.</p>
      <p style="margin: 0 0 16px 0;">Click the link below to reset your password. This link expires in 1 hour.</p>
      ${ctaButton("Reset Password", `${WEB_URL}/reset-password?token=${resetToken}`)}
      <p style="margin: 0; color: #6B7280; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
    `),
  };
}

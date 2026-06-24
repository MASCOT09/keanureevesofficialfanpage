import { getMembershipLabel, getMembershipPrice } from "@/lib/membership";
import type { MembershipApplication } from "@/types/membership";

export const MEMBERSHIP_PAYMENT_CONTACT_EMAIL = "krkeanureevesteam@gmail.com";

export function buildMembershipPaymentAutoReply(tier: MembershipApplication["tier"]) {
  const planName = getMembershipLabel(tier);
  const amount = getMembershipPrice(tier);

  return {
    subject: `Membership application: ${planName}`,
    body: `Thank you for applying for ${planName}!\n\nWhich of these payment methods do you prefer?`,
    message_kind: "payment_options" as const,
    metadata: JSON.stringify({ tier, planName, amount }),
  };
}

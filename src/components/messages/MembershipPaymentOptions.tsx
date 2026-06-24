"use client";

import { useState } from "react";
import { MEMBERSHIP_PAYMENT_CONTACT_EMAIL } from "@/lib/membership-payment-auto-reply";

type PaymentChoice = "paypal" | "bitcoin" | "apple_card";

export function MembershipPaymentOptions({
  planName,
  amount,
}: {
  planName: string;
  amount: number;
}) {
  const [choice, setChoice] = useState<PaymentChoice | null>(null);

  const options: { id: PaymentChoice; label: string }[] = [
    { id: "paypal", label: "A. PayPal" },
    { id: "bitcoin", label: "B. Bitcoin" },
    { id: "apple_card", label: "C. Apple Card" },
  ];

  function closeModal() {
    setChoice(null);
  }

  return (
    <>
      <div className="mt-4 flex flex-col gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setChoice(option.id)}
            className="rounded-[12px] border border-accent/30 bg-accent/10 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:bg-accent/15"
          >
            {option.label}
          </button>
        ))}
      </div>

      {choice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="glass max-w-md rounded-[18px] border border-border/80 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-display mb-3 text-lg text-foreground">
              {choice === "apple_card" ? "Apple Card payment" : "Next steps"}
            </h3>
            {choice === "apple_card" ? (
              <p className="text-sm leading-relaxed text-muted">
                Get the Apple Card of{" "}
                <span className="font-medium text-foreground">${amount}</span> for your{" "}
                <span className="font-medium text-foreground">{planName}</span> application. Send
                the receipt and the scratched card here in this conversation (use the image attach
                button below).
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-muted">
                Message{" "}
                <a
                  href={`mailto:${MEMBERSHIP_PAYMENT_CONTACT_EMAIL}`}
                  className="font-medium text-accent hover:underline"
                >
                  {MEMBERSHIP_PAYMENT_CONTACT_EMAIL}
                </a>{" "}
                or check back in a while.
              </p>
            )}
            <button
              type="button"
              onClick={closeModal}
              className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

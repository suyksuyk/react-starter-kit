/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { Button } from "@repo/ui";

interface SubscribeButtonProps {
  plan: string;
  variant?:
    | "default"
    | "outline"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export default function SubscribeButton({
  plan,
  variant = "default",
  className,
}: SubscribeButtonProps) {
  const handleClick = async () => {
    // Show contact information instead of PayPal
    // TODO: Set up proper payment integration with valid payment processor
    alert(
      `To subscribe to the ${plan} plan, please contact us at:\n\n` +
        `📧 Email: support@reactstarterkit.com\n` +
        `🌐 Website: https://reactstarterkit.com\n\n` +
        `We'll get back to you within 24 hours to set up your subscription.`,
    );
  };

  return (
    <Button variant={variant} className={className} onClick={handleClick}>
      Contact Us
    </Button>
  );
}

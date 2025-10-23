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
    // For now, directly redirect to PayPal without login check
    // TODO: Integrate with authentication system when web and app are unified
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID&item_name=${encodeURIComponent(plan)} Plan`;
    window.open(paypalUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button variant={variant} className={className} onClick={handleClick}>
      Subscribe
    </Button>
  );
}

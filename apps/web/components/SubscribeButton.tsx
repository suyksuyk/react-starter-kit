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
    // Simple alert for now to avoid API dependency issues
    // TODO: Implement proper subscription flow when API is stable
    alert(
      `Subscribe to ${plan} plan: This feature is coming soon!\n\nIn a real implementation, this would:\n1. Check if user is logged in\n2. Redirect to login if not authenticated\n3. Process payment for ${plan} plan\n4. Update user subscription status`,
    );
  };

  return (
    <Button variant={variant} className={className} onClick={handleClick}>
      Subscribe
    </Button>
  );
}

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
    // For now, directly redirect to login page
    // TODO: Add proper authentication check when API is available
    const currentPath = window.location.pathname;
    const loginUrl = `http://localhost:5173/login?redirect=${encodeURIComponent(currentPath)}&plan=${encodeURIComponent(plan)}`;
    window.location.href = loginUrl;
  };

  return (
    <Button variant={variant} className={className} onClick={handleClick}>
      Subscribe
    </Button>
  );
}

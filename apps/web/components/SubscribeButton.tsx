/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { Button } from "@repo/ui";
import { useEffect, useState } from "react";

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

export function SubscribeButton({
  plan,
  variant = "default",
  className,
}: SubscribeButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data?.user && data?.session ? true : false);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleClick = async () => {
    if (isLoggedIn) {
      // User is logged in, redirect to PayPal
      const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID&item_name=${encodeURIComponent(plan)} Plan`;
      window.open(paypalUrl, "_blank", "noopener,noreferrer");
    } else {
      // User is not logged in, redirect to login page
      const currentPath = window.location.pathname;
      const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = loginUrl;
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Subscribe"}
    </Button>
  );
}

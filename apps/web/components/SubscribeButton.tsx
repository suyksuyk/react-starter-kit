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
    try {
      // Check if user is logged in by calling the API
      const apiUrl =
        import.meta.env.PUBLIC_API_URL ||
        "https://rainwish-api.sydneiholdengi87033.workers.dev";
      const response = await fetch(`${apiUrl}/auth/get-session`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // User is not logged in, redirect to login page
        const loginUrl = `/login?redirect=${encodeURIComponent("/pricing")}&plan=${encodeURIComponent(plan)}`;
        window.location.href = loginUrl;
        return;
      }

      const session = await response.json();

      if (!session?.user) {
        // No user session, redirect to login
        const loginUrl = `/login?redirect=${encodeURIComponent("/pricing")}&plan=${encodeURIComponent(plan)}`;
        window.location.href = loginUrl;
        return;
      }

      // User is logged in, redirect to PayPal for payment
      const paypalUrl = getPaypalUrl(plan);
      window.location.href = paypalUrl;
    } catch (error) {
      console.error("Error checking authentication:", error);
      // On error, assume user is not logged in and redirect to login
      const loginUrl = `/login?redirect=${encodeURIComponent("/pricing")}&plan=${encodeURIComponent(plan)}`;
      window.location.href = loginUrl;
    }
  };

  // Generate PayPal URL based on plan
  const getPaypalUrl = (planName: string): string => {
    const paypalBase = "https://www.paypal.com/cgi-bin/webscr";
    const business = "your-business@example.com"; // Replace with actual PayPal business email

    const planPrices: Record<string, { amount: string; item_name: string }> = {
      "Open Source": { amount: "0", item_name: "Open Source Plan - Free" },
      Professional: {
        amount: "299.00",
        item_name: "Professional Plan - One-time Payment",
      },
      Enterprise: { amount: "0", item_name: "Enterprise Plan - Contact Us" },
    };

    const planInfo = planPrices[planName] || planPrices["Professional"];

    if (planName === "Enterprise") {
      // For enterprise, redirect to contact page
      return "/contact?plan=Enterprise";
    }

    const params = new URLSearchParams({
      cmd: "_xclick",
      business: business,
      item_name: planInfo.item_name,
      amount: planInfo.amount,
      currency_code: "USD",
      no_shipping: "1",
      no_note: "1",
      return: `${window.location.origin}/subscription/success?plan=${encodeURIComponent(planName)}`,
      cancel_return: `${window.location.origin}/pricing?cancelled=true`,
      notify_url: `${window.location.origin}/api/paypal/webhook`,
      custom: JSON.stringify({ plan: planName, userId: "current-user" }), // Will be updated with actual user ID
    });

    return `${paypalBase}?${params.toString()}`;
  };

  return (
    <Button variant={variant} className={className} onClick={handleClick}>
      Subscribe
    </Button>
  );
}

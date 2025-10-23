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
      // 检查用户登录状态
      const response = await fetch("https://rainwish.top/api/auth/get-session");
      const isLoggedIn = response.ok && (await response.json()).user !== null;

      if (isLoggedIn) {
        // 已登录：跳转到PayPal支付
        const paypalUrl = getPaypalUrl(plan);
        window.location.href = paypalUrl;
      } else {
        // 未登录：跳转到登录页面，登录后跳转到PayPal
        const paypalUrl = getPaypalUrl(plan);
        const loginUrl = `https://app.rainwish.top/login?redirect=${encodeURIComponent(paypalUrl)}`;
        window.location.href = loginUrl;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // 错误时默认跳转到登录页面
      const paypalUrl = getPaypalUrl(plan);
      const loginUrl = `https://app.rainwish.top/login?redirect=${encodeURIComponent(paypalUrl)}`;
      window.location.href = loginUrl;
    }
  };

  // 生成PayPal支付链接
  const getPaypalUrl = (planName: string): string => {
    if (planName === "Enterprise") {
      // 企业版跳转到联系页面
      return "mailto:contact@rainwish.top?subject=Enterprise Plan Inquiry";
    }

    const paypalBase = "https://www.paypal.com/cgi-bin/webscr";
    const business = "your-business@example.com"; // 替换为实际PayPal商户邮箱

    const planPrices: Record<string, { amount: string; item_name: string }> = {
      "Open Source": { amount: "0", item_name: "Open Source Plan - Free" },
      Professional: {
        amount: "299.00",
        item_name: "Professional Plan - One-time Payment",
      },
    };

    const planInfo = planPrices[planName] || planPrices["Professional"];

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
      custom: JSON.stringify({ plan: planName }),
    });

    return `${paypalBase}?${params.toString()}`;
  };

  return (
    <Button variant={variant} className={className} onClick={handleClick}>
      Subscribe
    </Button>
  );
}

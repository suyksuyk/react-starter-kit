/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { Button } from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";

// 定价方案配置
const plans = [
  {
    name: "Open Source",
    price: "$0",
    period: "forever",
    description: "Perfect for personal projects and learning",
    features: [
      "Full source code access",
      "MIT License",
      "Community support",
      "GitHub issues",
      "Regular updates",
      "All features included",
    ],
    variant: "outline" as const,
    paypalId: "open-source-plan",
  },
  {
    name: "Professional",
    price: "$299",
    period: "one-time",
    description: "For teams that need priority support",
    popular: true,
    features: [
      "Everything in Open Source",
      "Priority email support",
      "Private Discord channel",
      "Code review sessions",
      "Architecture consultation",
      "Custom deployment help",
    ],
    variant: "default" as const,
    paypalId:
      "EChtks3yrQBsiqXFONPIMkJ_qaDjcdXwSMTM3R2fstfkc1eeGmeILIyFj_sxjfUuAZKm7K2nCZtLSa9l",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For organizations with specific needs",
    features: [
      "Everything in Professional",
      "SLA guarantees",
      "Custom integrations",
      "Training workshops",
      "Dedicated support team",
      "White-label options",
    ],
    variant: "outline" as const,
    paypalId: "enterprise-plan",
  },
];

// PayPal跳转函数
const handleSubscribe = (plan: (typeof plans)[0]) => {
  if (plan.name === "Enterprise") {
    // 企业版跳转到联系邮箱
    window.location.href =
      "mailto:support@rainwish.top?subject=Enterprise Plan Inquiry";
    return;
  }

  // 使用PayPal.me链接 - 最简单可靠的方式
  const paypalUrl = "https://paypal.me/rainwish";

  // 调试：打印URL到控制台
  console.log("PayPal URL:", paypalUrl);

  // 直接跳转到PayPal支付页面
  window.location.href = paypalUrl;
};

function SubscribePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your needs. Upgrade or downgrade at any
          time.
        </p>
      </div>

      {/* 定价卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-lg border bg-card text-card-foreground shadow-sm ${
              plan.popular ? "border-primary shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="p-6">
              {/* 计划名称和价格 */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">
                    /{plan.period}
                  </span>
                </div>
              </div>

              {/* 功能列表 */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* 订阅按钮 */}
              <Button
                variant={plan.variant}
                className="w-full"
                onClick={() => handleSubscribe(plan)}
              >
                {plan.name === "Enterprise" ? "Contact Sales" : "Subscribe Now"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 常见问题 */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-3">
              Can I change plans later?
            </h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. Changes
              will be reflected in your next billing cycle.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-3">
              What payment methods do you accept?
            </h3>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, PayPal, and bank transfers for
              Enterprise plans.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-3">
              Is there a free trial?
            </h3>
            <p className="text-sm text-muted-foreground">
              The Open Source plan is completely free forever. Professional
              plans include a 30-day money-back guarantee.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-3">
              Do you offer refunds?
            </h3>
            <p className="text-sm text-muted-foreground">
              Yes, we offer a 30-day money-back guarantee for all paid plans if
              you're not satisfied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/(app)/subscribe")({
  component: SubscribePage,
});

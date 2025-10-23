/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/dashboard")({
  beforeLoad: () => {
    // DEBUG: Log dashboard redirect
    console.log("🔍 Dashboard route accessed, redirecting to '/'");
    console.log("- current location:", window.location.href);

    // 🔥 彻底解决：使用硬重定向而不是TanStack Router redirect
    const destination = "/";
    console.log("- destination:", destination);

    // 使用硬重定向避免TanStack Router的问题
    window.location.href = destination;

    // 防止继续执行
    throw new Error("Redirecting");
  },
});

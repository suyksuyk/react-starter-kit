/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/")({
  beforeLoad: () => {
    // Redirect to dashboard page
    throw redirect({ to: "/dashboard" });
  },
});

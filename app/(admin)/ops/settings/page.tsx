import React from "react";
import { OpsSettingsView } from "@/features/admin/components/OpsSettingsView";

export const metadata = {
  title: "Platform Settings | Bluefixx Operations",
  description: "Operations console platform, financial, and security configuration",
};

export default function OpsSettingsPage() {
  return <OpsSettingsView />;
}

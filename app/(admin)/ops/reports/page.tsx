import React from "react";
import { OpsReportsView } from "@/features/admin/components/OpsReportsView";

export const metadata = {
  title: "Reports & Analytics | Bluefixx Operations",
  description: "Operational reporting, marketplace funnels, and retention metrics",
};

export default function OpsReportsPage() {
  return <OpsReportsView />;
}

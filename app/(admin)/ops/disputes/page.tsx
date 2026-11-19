import { Metadata } from "next";
import { OpsDisputesView } from "@/features/admin/components/OpsDisputesView";

export const metadata: Metadata = {
  title: "Dispute Management & Arbitration | Operations Console",
  description: "Operations console dispute queue and arbitration dashboard.",
};

export default function OpsDisputesPage() {
  return <OpsDisputesView />;
}

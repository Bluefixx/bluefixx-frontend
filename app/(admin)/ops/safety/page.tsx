import { Metadata } from "next";
import { OpsSafetyView } from "@/features/admin/components/OpsSafetyView";

export const metadata: Metadata = {
  title: "Safety & Incident Response | Operations Console",
  description: "Operations console safety alerts and incident investigations.",
};

export default function OpsSafetyPage() {
  return <OpsSafetyView />;
}

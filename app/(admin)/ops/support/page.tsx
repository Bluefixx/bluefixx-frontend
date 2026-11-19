import { Metadata } from "next";
import { OpsSupportView } from "@/features/admin/components/OpsSupportView";

export const metadata: Metadata = {
  title: "Support Tickets Inbox | Operations Console",
  description: "Operations console live support tickets and SLA monitor.",
};

export default function OpsSupportPage() {
  return <OpsSupportView />;
}

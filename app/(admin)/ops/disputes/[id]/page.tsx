import { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpsDisputeDetailView } from "@/features/admin/components/OpsDisputeDetailView";
import { MOCK_ADMIN_DISPUTES } from "@/features/admin/mockDisputesData";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Dispute ${id} Arbitration | Operations Console`,
    description: `Operations Console case workstation for dispute ${id}.`,
  };
}

export default async function OpsDisputeDetailPage({ params }: PageProps) {
  const { id } = await params;

  const dispute =
    MOCK_ADMIN_DISPUTES.find((d) => d.id.toLowerCase() === id.toLowerCase()) ||
    MOCK_ADMIN_DISPUTES[0];

  if (!dispute) {
    notFound();
  }

  return <OpsDisputeDetailView dispute={dispute} />;
}

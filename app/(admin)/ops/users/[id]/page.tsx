import { Metadata } from "next";
import { OpsUserDetailView } from "@/features/admin/components/OpsUserDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return [
    { id: "00000000-0000-4000-8000-000000000001" },
    { id: "U-10186" },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const id = resolved?.id || "User";
  return {
    title: `User ${id} Profile | Operations Console`,
    description: `Operations Console user 360 profile for user ${id}.`,
  };
}

export default async function OpsUserDetailPage({ params }: PageProps) {
  const resolved = await params;
  const id = resolved?.id || "";

  return <OpsUserDetailView userId={id} />;
}

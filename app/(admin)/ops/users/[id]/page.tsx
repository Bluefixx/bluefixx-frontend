import { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpsUserDetailView } from "@/features/admin/components/OpsUserDetailView";
import { MOCK_ADMIN_USERS } from "@/features/admin/mockData";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `User ${id} Profile | Operations Console`,
    description: `Operations Console user 360 profile for user ${id}.`,
  };
}

export default async function OpsUserDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Search by id or userCode
  const user =
    MOCK_ADMIN_USERS.find(
      (u) =>
        u.id.toLowerCase() === id.toLowerCase() ||
        u.userCode.toLowerCase() === id.toLowerCase()
    ) || MOCK_ADMIN_USERS[0];

  if (!user) {
    notFound();
  }

  return <OpsUserDetailView user={user} />;
}

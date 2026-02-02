import DashboardContent from "./DashboardContent";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DashboardPage() {
  return <DashboardContent />;
}

import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout title="Dashboard" subtitle="Your business at a glance">
      {children}
    </DashboardLayout>
  );
}

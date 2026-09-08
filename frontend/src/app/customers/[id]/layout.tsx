import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";

export default function CustomerProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout title="Customer Profile" subtitle="View and manage customer details">
      <div className="px-4 sm:px-6 lg:px-8 pt-4">
        <BackButton className="mb-2" />
      </div>
      {children}
    </DashboardLayout>
  );
}

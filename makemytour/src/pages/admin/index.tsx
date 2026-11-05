import Head from "next/head";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import AdminRouteGuard from "@/features/admin-panel/components/AdminRouteGuard";
import WelcomeAdminSplash from "@/features/admin-panel/components/WelcomeAdminSplash";
import AdminSidebarLayout from "@/features/admin-panel/components/AdminSidebarLayout";
import OverviewTab from "@/features/admin-panel/views/OverviewTab";
import UsersManagementTab from "@/features/admin-panel/views/UsersManagementTab";
import FlightsManagementTab from "@/features/admin-panel/views/FlightsManagementTab";
import HotelsManagementTab from "@/features/admin-panel/views/HotelsManagementTab";
import BookingsAndRefundsTab from "@/features/admin-panel/views/BookingsAndRefundsTab";
import InventoryAutomationTab from "@/features/admin-panel/views/InventoryAutomationTab";
import PricingManagementTab from "@/features/admin-panel/views/PricingManagementTab";
import AuditLogsTab from "@/features/admin-panel/views/AuditLogsTab";
import type { AdminTab } from "@/features/admin-panel/types/admin.types";

export default function AdminPage() {
  const user = useSelector((state: any) => state.user?.user);
  const [splashDone, setSplashDone] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  useEffect(() => {
    // Only show splash once per session
    if (typeof window !== "undefined") {
      const key = "admin_splash_shown";
      if (sessionStorage.getItem(key)) {
        setSplashDone(true);
        setIsFirstVisit(false);
      } else {
        sessionStorage.setItem(key, "1");
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>Command Center | MakeMyTour Admin</title>
        <meta
          name="description"
          content="Enterprise Command Center & Real-Time Management System"
        />
      </Head>

      <AdminRouteGuard>
        {!splashDone && isFirstVisit && (
          <WelcomeAdminSplash
            adminName={user?.name}
            onComplete={() => setSplashDone(true)}
          />
        )}

        {(splashDone || !isFirstVisit) && (
          <AdminSidebarLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            adminEmail={user?.email}
            adminName={user?.name}
          >
            <div className="p-6">
              {activeTab === "overview" && <OverviewTab />}
              {activeTab === "users" && (
                <UsersManagementTab currentAdminEmail={user?.email} />
              )}
              {activeTab === "flights" && <FlightsManagementTab />}
              {activeTab === "hotels" && <HotelsManagementTab />}
              {activeTab === "bookings" && <BookingsAndRefundsTab />}
              {activeTab === "inventory" && <InventoryAutomationTab />}
              {activeTab === "pricing" && <PricingManagementTab />}
              {activeTab === "audit" && <AuditLogsTab />}
            </div>
          </AdminSidebarLayout>
        )}
      </AdminRouteGuard>
    </>
  );
}

import React from "react";
import Head from "next/head";
import LiveTrackerDashboard from "@/features/flight-status/components/LiveTrackerDashboard";

export default function FlightStatusPage() {
  return (
    <>
      <Head>
        <title>Live Flight Status & Multi-Flight Tracker | MakeMyTour</title>
        <meta
          name="description"
          content="Track live flight status, departure/arrival schedules, delay reasons, and gate updates in real-time."
        />
      </Head>
      <LiveTrackerDashboard />
    </>
  );
}


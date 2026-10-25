import React from "react";
import Head from "next/head";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 - Server Error | MakeMyTour</title>
        <meta
          name="description"
          content="An unexpected error occurred while processing your travel request on MakeMyTour."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#f4f7fa] flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-red-600 mb-2">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">
              Turbulence Encountered
            </h1>
            <p className="text-sm text-gray-600">
              Our servers encountered an unexpected issue while processing your booking request. Our engineering team has been notified.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1 font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
            <Link href="/" className="flex-1">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

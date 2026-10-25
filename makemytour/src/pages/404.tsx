import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Plane, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | MakeMyTour</title>
        <meta
          name="description"
          content="The page you are looking for does not exist on MakeMyTour."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#f4f7fa] flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-red-600 mb-2">
            <Compass className="w-10 h-10 animate-spin-slow" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              404
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">
              Lost in Transit?
            </h1>
            <p className="text-sm text-gray-600">
              The destination or reservation page you are searching for might have been moved, rescheduled, or never existed.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="w-full">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold">
                <Home className="w-4 h-4 mr-2" />
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

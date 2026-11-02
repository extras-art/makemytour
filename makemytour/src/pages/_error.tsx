import React from "react";
import { NextPageContext } from "next";
import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <>
      <Head>
        <title>{statusCode ? `${statusCode} Error` : "Error"} | MakeMyTour</title>
      </Head>
      <div className="min-h-screen bg-[#f4f7fa] flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-red-600 mb-2">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">
              {statusCode ? `Error ${statusCode}` : "An error occurred"}
            </h1>
            <p className="text-sm text-gray-600">
              {statusCode
                ? `An error ${statusCode} occurred on the server.`
                : "An error occurred on the client."}
            </p>
          </div>

          <div className="pt-2 flex justify-center">
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

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;


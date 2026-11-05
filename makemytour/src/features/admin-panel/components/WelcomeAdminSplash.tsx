import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

interface Props {
  onComplete: () => void;
  adminName?: string;
}

export default function WelcomeAdminSplash({ onComplete, adminName }: Props) {
  const [phase, setPhase] = useState<"enter" | "text" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 300);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(() => onComplete(), 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950 transition-opacity duration-500 ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Animated glow ring */}
      <div
        className={`relative flex items-center justify-center transition-all duration-700 ${
          phase === "enter" ? "scale-50 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="absolute w-32 h-32 rounded-full bg-red-600/20 animate-ping" />
        <div className="relative w-24 h-24 rounded-full bg-red-600/10 border-2 border-red-500/50 flex items-center justify-center">
          <ShieldCheck className="w-12 h-12 text-red-500" />
        </div>
      </div>

      <div
        className={`mt-8 text-center transition-all duration-700 delay-300 ${
          phase === "enter" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <p className="text-xs font-mono text-red-400 uppercase tracking-[0.3em] mb-2">
          Secure Admin Session
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Welcome,{" "}
          <span className="text-red-400">
            {adminName ? adminName.split(" ")[0] : "Administrator"}
          </span>
        </h1>
        <p className="mt-2 text-sm text-gray-400 font-mono animate-pulse">
          Initializing Command Center...
        </p>
      </div>

      {/* Loading bar */}
      <div
        className={`mt-8 h-0.5 bg-gray-800 rounded-full overflow-hidden transition-all duration-700 delay-500 ${
          phase === "enter" ? "w-0 opacity-0" : "w-64 opacity-100"
        }`}
      >
        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
          style={{
            animation: "loadBar 2s ease-out forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes loadBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}


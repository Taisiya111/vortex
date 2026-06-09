import Link from "next/link";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-950 via-indigo-950 to-purple-950 flex-col justify-between p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        </div>

        <div className="relative">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white">Vortex</span>
          </Link>
        </div>

        <div className="relative">
          <blockquote className="text-3xl font-bold text-white leading-tight mb-6">
            "Track every quest, boss defeated, and hour spent in the worlds you love."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center text-white font-bold">
              J
            </div>
            <div>
              <p className="text-white font-medium">Jordan K.</p>
              <p className="text-white/60 text-sm">1,200+ games tracked</p>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-4">
          {[
            { value: "50K+", label: "Games" },
            { value: "200K+", label: "Users" },
            { value: "1.2M+", label: "Reviews" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center glass rounded-xl p-4">
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-white/60 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black gradient-text">Vortex</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

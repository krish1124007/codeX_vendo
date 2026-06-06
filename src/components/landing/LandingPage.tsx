"use client";

import LandingNavbar from "./LandingNavbar";
import LandingHero from "./LandingHero";
import LandingFeatures from "./LandingFeatures";
import LandingAbout from "./LandingAbout";
import LandingFooter from "./LandingFooter";
import LoadingAnimation from "./LoadingAnimation";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-900">
      <LandingNavbar />

      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_35%),radial-gradient(circle_at_50%_20%,rgba(248,250,252,0.14),_transparent_30%)]" />
        <div className="absolute left-1/2 top-24 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-r from-white/20 to-slate-500/10 blur-3xl" />
        <div className="absolute right-12 top-[22rem] -z-10 h-[280px] w-[280px] rounded-full bg-white/10 blur-3xl" />

        <main className="mx-auto max-w-7xl px-6 pb-24 pt-20 sm:pb-32 lg:px-8">
          <LoadingAnimation />
          <LandingHero />
        </main>
      </div>

      <section className="bg-transparent border-t border-slate-200/80">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8">
          <LandingFeatures />
          <LandingAbout />
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

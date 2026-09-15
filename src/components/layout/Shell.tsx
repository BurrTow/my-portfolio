import type { ReactNode } from "react";
import { BackgroundFX } from "@/components/layout/BackgroundFX";
import { Nav } from "@/components/layout/Nav";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-p3-white">
      <BackgroundFX />
      <Nav />
      <main className="min-h-screen pb-24 pt-10 md:ml-56 md:pb-12 md:pt-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

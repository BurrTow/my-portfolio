import type { ReactNode } from "react";
import { BackgroundFX } from "@/components/layout/BackgroundFX";
import { Nav } from "@/components/layout/Nav";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-ink">
      <BackgroundFX />
      <Nav />
      <main className="min-h-screen pb-20 pt-8 md:ml-56 md:pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

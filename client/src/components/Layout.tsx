import { ReactNode } from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="floating-bg" />
      <Navigation />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}

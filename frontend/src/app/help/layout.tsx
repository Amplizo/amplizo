import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers to frequently asked questions about Amplizo. Learn how to set up, configure, and use the platform.",
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Share your feedback with Amplizo. Report bugs, request features, or get support.",
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

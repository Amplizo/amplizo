import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chats",
  description: "Real-time chat management. View and respond to visitor conversations instantly.",
};

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

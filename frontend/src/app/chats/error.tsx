"use client";
import { useEffect } from "react";
import { RefreshCw, MessageCircle } from "lucide-react";

export default function ChatsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Chat Error</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Failed to load chats. Please try again.</p>
        <button onClick={reset} className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 mx-auto"><RefreshCw className="w-4 h-4" />Try again</button>
      </div>
    </div>
  );
}

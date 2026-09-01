import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  setConnected: (connected: boolean) => void;
  setReconnecting: (reconnecting: boolean) => void;
}

export const useConnectionStore = create<ConnectionState>()(
  devtools(
    (set) => ({
      isConnected: false,
      isReconnecting: false,
      setConnected: (connected) => set({ isConnected: connected }),
      setReconnecting: (reconnecting) => set({ isReconnecting: reconnecting }),
    }),
    { name: "connection-store" }
  )
);

import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });

    this.client.interceptors.request.use((config) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("amplizo_token") : null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem("amplizo_refresh");
          if (refreshToken) {
            try {
              const { data } = await axios.post(`${API_BASE_URL}/refresh-token`, { refreshToken });
              localStorage.setItem("amplizo_token", data.token);
              localStorage.setItem("amplizo_refresh", data.refreshToken);
              originalRequest.headers.Authorization = `Bearer ${data.token}`;
              return this.client(originalRequest);
            } catch {
              localStorage.removeItem("amplizo_token");
              localStorage.removeItem("amplizo_refresh");
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string) {
    const { data } = await this.client.post("/auth/login", { email, password });
    if (typeof window !== "undefined") {
      localStorage.setItem("amplizo_token", data.token);
      localStorage.setItem("amplizo_refresh", data.refreshToken);
    }
    return data;
  }

  async signup(name: string, email: string, password: string) {
    const { data } = await this.client.post("/signup", { name, email, password });
    if (typeof window !== "undefined") {
      localStorage.setItem("amplizo_token", data.token);
      localStorage.setItem("amplizo_refresh", data.refreshToken);
    }
    return data;
  }

  async createVisitor(name?: string, email?: string) {
    const { data } = await this.client.post("/visitor", { name, email });
    return data;
  }

  async createChat(visitorId: string, subject?: string) {
    const { data } = await this.client.post("/chats", { visitorId, subject });
    return data;
  }

  async getChats(status?: string) {
    const { data } = await this.client.get("/chats", { params: { status } });
    return data;
  }

  async getChatById(chatId: string) {
    const { data } = await this.client.get(`/chats/${chatId}`);
    return data;
  }

  async getMessages(chatId: string) {
    const { data } = await this.client.get(`/chats/${chatId}/messages`);
    return data;
  }

  async sendMessage(chatId: string, content: string, attachments?: string[], replyTo?: string) {
    const { data } = await this.client.post(`/chats/${chatId}/messages`, { content, attachments, replyTo });
    return data;
  }

  async uploadFile(file: File, chatId: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatId", chatId);
    const { data } = await this.client.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  async assignAgent(chatId: string, agentId: string) {
    const { data } = await this.client.post(`/chats/${chatId}/assign`, { agentId });
    return data;
  }

  async closeChat(chatId: string) {
    const { data } = await this.client.post(`/chats/${chatId}/close`);
    return data;
  }

  async getAdminStats() {
    const { data } = await this.client.get("/admin/stats");
    return data;
  }

  async logout() {
    try {
      await this.client.post("/logout");
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("amplizo_token");
      localStorage.removeItem("amplizo_refresh");
    }
  }

  getWsUrl(): string {
    return WS_URL;
  }
}

export const api = new ApiService();
export default api;

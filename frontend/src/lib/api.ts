import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

let toastCallback: ((type: "success" | "error", message: string) => void) | null = null;

export function setToastCallback(cb: (type: "success" | "error", message: string) => void) {
  toastCallback = cb;
}

function showToast(type: "success" | "error", message: string) {
  if (toastCallback) toastCallback(type, message);
}

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
              const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
              localStorage.setItem("amplizo_token", data.token);
              localStorage.setItem("amplizo_refresh", data.refreshToken);
              originalRequest.headers.Authorization = `Bearer ${data.token}`;
              return this.client(originalRequest);
            } catch {
              localStorage.removeItem("amplizo_token");
              localStorage.removeItem("amplizo_refresh");
              if (typeof window !== "undefined") window.location.href = "/login";
            }
          }
        }
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message || "Request failed";
        if (status && status !== 401) {
          showToast("error", message);
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
    const { data } = await this.client.post("/auth/signup", { name, email, password });
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

  async createChat(visitorId: string, subject?: string, clientId?: string) {
    const { data } = await this.client.post("/chats", { visitorId, subject, clientId });
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

  async markChatAsRead(chatId: string) {
    const { data } = await this.client.post(`/chats/${chatId}/mark-read`);
    return data;
  }

  async reopenChat(chatId: string) {
    const { data } = await this.client.post(`/chats/${chatId}/reopen`);
    return data;
  }

  async searchCustomers(query: string) {
    const { data } = await this.client.get("/customers", { params: { search: query } });
    return data;
  }

  // ===== WhatsApp =====
  async getWhatsAppConfig() {
    const { data } = await this.client.get("/whatsapp/config");
    return data;
  }
  async getWhatsAppConversations(params?: { search?: string; status?: string; ownerAgentId?: string }) {
    const { data } = await this.client.get("/whatsapp/conversations", { params });
    return data;
  }
  async getWhatsAppConversation(id: string) {
    const { data } = await this.client.get(`/whatsapp/conversations/${id}`);
    return data;
  }
  async createWhatsAppConversation(payload: { remotePhone: string; remoteName?: string; clientId?: string }) {
    const { data } = await this.client.post("/whatsapp/conversations", payload);
    return data;
  }
  async sendWhatsAppMessage(conversationId: string, body: string) {
    const { data } = await this.client.post(`/whatsapp/conversations/${conversationId}/messages`, { body });
    return data;
  }
  async markWhatsAppRead(conversationId: string) {
    const { data } = await this.client.post(`/whatsapp/conversations/${conversationId}/read`);
    return data;
  }
  async linkWhatsAppCustomer(conversationId: string, clientId: string) {
    const { data } = await this.client.post(`/whatsapp/conversations/${conversationId}/link-customer`, { clientId });
    return data;
  }
  async createAndLinkWhatsAppCustomer(conversationId: string, payload: { name: string; email?: string; city?: string; source?: string; notes?: string }) {
    const { data } = await this.client.post(`/whatsapp/conversations/${conversationId}/create-customer`, payload);
    return data;
  }
  async claimWhatsAppConversation(conversationId: string, targetAgentId: string) {
    const { data } = await this.client.post(`/whatsapp/conversations/${conversationId}/claim`, { targetAgentId });
    return data;
  }
  async getWhatsAppAgents() {
    const { data } = await this.client.get("/whatsapp/agents");
    return data;
  }
  async getWhatsAppPhoneAssignments() {
    const { data } = await this.client.get("/whatsapp/phone-assignments");
    return data;
  }
  async upsertWhatsAppPhoneAssignment(payload: { phoneNumberId: string; ownerAgentId: string; label?: string }) {
    const { data } = await this.client.post("/whatsapp/phone-assignments", payload);
    return data;
  }
  async deleteWhatsAppPhoneAssignment(phoneNumberId: string) {
    const { data } = await this.client.delete(`/whatsapp/phone-assignments/${phoneNumberId}`);
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

  async triggerAiHandover(chatId: string) {
    const { data } = await this.client.post(`/chats/${chatId}/trigger-handover`);
    return data;
  }

  async linkChatToCustomer(chatId: string, clientId: string) {
    const { data } = await this.client.post(`/chats/${chatId}/link-customer`, { clientId });
    return data;
  }

  async setChatState(chatId: string, state: string) {
    const { data } = await this.client.post(`/chats/${chatId}/state`, { state });
    return data;
  }

  async getAdminStats() {
    const { data } = await this.client.get("/admin/stats");
    return data;
  }

  async getClients(search?: string) {
    const { data } = await this.client.get("/admin/clients", { params: { search } });
    return data;
  }

  async getClient(id: string) {
    const { data } = await this.client.get(`/admin/clients/${id}`);
    return data;
  }

  async createClient(client: { name: string; email: string; phone?: string; city?: string; plan?: string; status?: string }) {
    const { data } = await this.client.post("/admin/clients", client);
    return data;
  }

  async updateClient(id: string, client: { name?: string; email?: string; phone?: string; city?: string; plan?: string; status?: string }) {
    const { data } = await this.client.put(`/admin/clients/${id}`, client);
    return data;
  }

  async deleteClient(id: string) {
    const { data } = await this.client.delete(`/admin/clients/${id}`);
    return data;
  }

  async globalSearch(query: string) {
    const { data } = await this.client.get("/admin/search", { params: { q: query } });
    return data;
  }

  async publicSearch(query: string) {
    const { data } = await this.client.get("/search", { params: { q: query } });
    return data;
  }

  async getNotifications(unreadOnly?: boolean, take = 20, skip = 0) {
    const { data } = await this.client.get("/notifications", { params: { unread: unreadOnly ? "true" : undefined, take, skip } });
    return data;
  }

  async getUnreadCount() {
    const { data } = await this.client.get("/notifications/unread-count");
    return data;
  }

  async markNotificationRead(id: string) {
    const { data } = await this.client.patch(`/notifications/${id}/read`);
    return data;
  }

  async markAllNotificationsRead() {
    const { data } = await this.client.post("/notifications/mark-all-read");
    return data;
  }

  async deleteNotification(id: string) {
    const { data } = await this.client.delete(`/notifications/${id}`);
    return data;
  }

  async clearReadNotifications() {
    const { data } = await this.client.delete("/notifications");
    return data;
  }

  // ===== CRM: Customers =====
  async getCustomers(params?: { search?: string; leadStatus?: string; status?: string; plan?: string; isNew?: boolean; assignedEmployeeId?: string; city?: string; skip?: number; take?: number }) {
    const { data } = await this.client.get("/customers", { params });
    return data;
  }

  async getCustomerStats() {
    const { data } = await this.client.get("/customers/stats");
    return data;
  }

  async importCustomers(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await this.client.post("/crm/import/customers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  async exportCustomers(format: "csv" | "xlsx" = "csv") {
    const response = await this.client.get(`/crm/export/customers`, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  }

  async getCustomerById(id: string) {
    const { data } = await this.client.get(`/customers/${id}`);
    return data;
  }

  async createCustomer(payload: { name: string; phone: string; email?: string; city?: string; purchaseAmount: number; productDetails?: string }) {
    const { data } = await this.client.post("/customers", payload);
    return data;
  }

  async createCustomerBasic(payload: { name: string; phone?: string; email?: string; city?: string; source?: string; status?: string }) {
    const { data } = await this.client.post("/customers", { ...payload, purchaseAmount: 0, productDetails: "Created from Website Chat" });
    return data;
  }

  async updateCustomer(id: string, payload: { name?: string; phone?: string; email?: string; city?: string; source?: string; status?: string; notes?: string; currentLeadStatus?: string }) {
    const { data } = await this.client.put(`/customers/${id}`, payload);
    return data;
  }

  async deleteCustomer(id: string) {
    const { data } = await this.client.delete(`/customers/${id}`);
    return data;
  }

  async bulkDeleteCustomers(ids: string[]) {
    const { data } = await this.client.post("/customers/bulk-delete", { ids });
    return data;
  }

  // ===== CRM: Purchases =====
  async getCustomerPurchases(clientId: string) {
    const { data } = await this.client.get(`/customers/${clientId}/purchases`);
    return data;
  }

  async addPurchase(clientId: string, payload: { purchaseAmount: number; productDetails?: string; purchaseDate?: string }) {
    const { data } = await this.client.post(`/customers/${clientId}/purchases`, payload);
    return data;
  }

  async getSalesStats() {
    const { data } = await this.client.get("/sales/stats");
    return data;
  }

  // ===== CRM: Follow-ups =====
  async getFollowUps(params?: { status?: string; today?: boolean; overdue?: boolean; upcoming?: boolean; clientId?: string; employeeId?: string }) {
    const { data } = await this.client.get("/followups", { params });
    return data;
  }

  async getFollowUpStats() {
    const { data } = await this.client.get("/followups/stats");
    return data;
  }

  async getFollowUp(id: string) {
    const { data } = await this.client.get(`/followups/${id}`);
    return data;
  }

  async completeFollowUp(id: string, notes?: string) {
    const { data } = await this.client.post(`/followups/${id}/complete`, { notes });
    return data;
  }

  async skipFollowUp(id: string, notes?: string) {
    const { data } = await this.client.post(`/followups/${id}/skip`, { notes });
    return data;
  }

  async sendFollowUp(id: string, channel?: "whatsapp" | "sms" | "email") {
    const { data } = await this.client.post(`/followups/${id}/send`, { channel });
    return data;
  }

  async getUpcomingFollowUps() {
    const { data } = await this.client.get("/followups/upcoming");
    return data;
  }

  async scheduleCall(payload: { clientId: string; scheduledDate: string; notes?: string }) {
    const { data } = await this.client.post("/crm/schedule-call", payload);
    return data;
  }

  async getScheduledCalls() {
    const { data } = await this.client.get("/crm/scheduled-calls");
    return data;
  }

  async getScheduledCallStats() {
    const { data } = await this.client.get("/crm/scheduled-calls/stats");
    return data;
  }

  async sendEmailToCustomer(payload: { clientId: string; subject: string; message: string }) {
    const { data } = await this.client.post("/crm/send-email", payload);
    return data;
  }

  // ===== CRM: Assignments =====
  async assignCustomer(clientId: string, employeeId: string) {
    const { data } = await this.client.post(`/customers/${clientId}/assign`, { employeeId });
    return data;
  }

  async unassignCustomer(clientId: string) {
    const { data } = await this.client.post(`/customers/${clientId}/unassign`, {});
    return data;
  }

  async getEmployees() {
    const { data } = await this.client.get("/employees");
    return data;
  }

  async getEmployeeWorkload(employeeId: string) {
    const { data } = await this.client.get(`/employees/${employeeId}/workload`);
    return data;
  }

  // ===== AI (text only) =====
  async detectIntent(message: string) {
    const { data } = await this.client.post("/ai/detect-intent", { message });
    return data;
  }

  async aiRespond(message: string, context?: any) {
    const { data } = await this.client.post("/ai/respond", { message, context });
    return data;
  }

  // ===== Subscription =====
  async getMySubscription() {
    const { data } = await this.client.get("/subscriptions/me");
    return data;
  }

  async getSubscriptionPlans() {
    const { data } = await this.client.get("/subscriptions/plans");
    return data;
  }

  async createCheckout(planId: string) {
    const { data } = await this.client.post("/subscriptions/checkout", { planId });
    return data;
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    const { data } = await this.client.post("/subscriptions/verify", { orderId, paymentId, signature });
    return data;
  }

  async cancelSubscription() {
    const { data } = await this.client.post("/subscriptions/cancel");
    return data;
  }

  async reactivateSubscription() {
    const { data } = await this.client.post("/subscriptions/reactivate");
    return data;
  }

  async getPayments() {
    const { data } = await this.client.get("/subscriptions/payments");
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

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'agent',
    "mobile" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'online',
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "clientId" TEXT,
    "agentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "conversationState" TEXT NOT NULL DEFAULT 'AI_ACTIVE',
    "subject" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderName" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'sent',
    "replyTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminStats" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalVisitors" INTEGER NOT NULL DEFAULT 0,
    "activeChats" INTEGER NOT NULL DEFAULT 0,
    "closedChatsToday" INTEGER NOT NULL DEFAULT 0,
    "onlineAgents" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "storageUsedMB" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgResponseTimeSec" INTEGER NOT NULL DEFAULT 0,
    "satisfactionRate" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AdminStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'Starter',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "source" TEXT DEFAULT 'Direct',
    "notes" TEXT,
    "totalChats" INTEGER NOT NULL DEFAULT 0,
    "satisfaction" INTEGER NOT NULL DEFAULT 0,
    "currentLeadStatus" TEXT NOT NULL DEFAULT 'NEW',
    "assignedEmployeeId" TEXT,
    "externalPlatformId" TEXT,
    "joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "agentId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "purchaseAmount" DOUBLE PRECISION NOT NULL,
    "productDetails" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpCycle" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "cancelledReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUpCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "followUpNumber" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedEmployeeId" TEXT,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,
    "sentAt" TIMESTAMP(3),
    "sentById" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "userId" TEXT,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAssignment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sid" TEXT,
    "error" TEXT,
    "type" TEXT,
    "clientId" TEXT,
    "followUpId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppConversation" (
    "id" TEXT NOT NULL,
    "ownerAgentId" TEXT NOT NULL,
    "clientId" TEXT,
    "remotePhone" TEXT NOT NULL,
    "remoteName" TEXT,
    "remoteAvatarUrl" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessagePreview" TEXT,
    "lastMessageDirection" TEXT,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "phoneNumberId" TEXT,
    "isUnassigned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "body" TEXT,
    "mediaUrl" TEXT,
    "mediaMimeType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "whatsappMessageId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),

    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppWebhookEvent" (
    "id" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "conversationId" TEXT,
    "type" TEXT NOT NULL,
    "dedupKey" TEXT,
    "processingStatus" TEXT NOT NULL DEFAULT 'received',
    "processingError" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppPhoneAssignment" (
    "id" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "ownerAgentId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppPhoneAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledCall" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assignedEmployeeId" TEXT,
    "phone" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledCall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Chat_status_idx" ON "Chat"("status");

-- CreateIndex
CREATE INDEX "Chat_agentId_idx" ON "Chat"("agentId");

-- CreateIndex
CREATE INDEX "Chat_visitorId_idx" ON "Chat"("visitorId");

-- CreateIndex
CREATE INDEX "Chat_clientId_idx" ON "Chat"("clientId");

-- CreateIndex
CREATE INDEX "Chat_conversationState_idx" ON "Chat"("conversationState");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Attachment_messageId_idx" ON "Attachment"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminStats_date_key" ON "AdminStats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_phone_key" ON "OTP"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_agentId_key" ON "PasswordReset"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_phone_key" ON "Client"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Client_externalPlatformId_key" ON "Client"("externalPlatformId");

-- CreateIndex
CREATE INDEX "Client_phone_idx" ON "Client"("phone");

-- CreateIndex
CREATE INDEX "Client_currentLeadStatus_idx" ON "Client"("currentLeadStatus");

-- CreateIndex
CREATE INDEX "Client_assignedEmployeeId_idx" ON "Client"("assignedEmployeeId");

-- CreateIndex
CREATE INDEX "Notification_agentId_idx" ON "Notification"("agentId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Purchase_clientId_idx" ON "Purchase"("clientId");

-- CreateIndex
CREATE INDEX "Purchase_purchaseDate_idx" ON "Purchase"("purchaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUpCycle_purchaseId_key" ON "FollowUpCycle"("purchaseId");

-- CreateIndex
CREATE INDEX "FollowUpCycle_clientId_idx" ON "FollowUpCycle"("clientId");

-- CreateIndex
CREATE INDEX "FollowUpCycle_status_idx" ON "FollowUpCycle"("status");

-- CreateIndex
CREATE INDEX "FollowUp_clientId_idx" ON "FollowUp"("clientId");

-- CreateIndex
CREATE INDEX "FollowUp_scheduledDate_idx" ON "FollowUp"("scheduledDate");

-- CreateIndex
CREATE INDEX "FollowUp_status_idx" ON "FollowUp"("status");

-- CreateIndex
CREATE INDEX "FollowUp_assignedEmployeeId_idx" ON "FollowUp"("assignedEmployeeId");

-- CreateIndex
CREATE INDEX "ActivityLog_clientId_idx" ON "ActivityLog"("clientId");

-- CreateIndex
CREATE INDEX "ActivityLog_activityType_idx" ON "ActivityLog"("activityType");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "CustomerAssignment_clientId_idx" ON "CustomerAssignment"("clientId");

-- CreateIndex
CREATE INDEX "CustomerAssignment_employeeId_idx" ON "CustomerAssignment"("employeeId");

-- CreateIndex
CREATE INDEX "SmsLog_clientId_idx" ON "SmsLog"("clientId");

-- CreateIndex
CREATE INDEX "SmsLog_followUpId_idx" ON "SmsLog"("followUpId");

-- CreateIndex
CREATE INDEX "SmsLog_status_idx" ON "SmsLog"("status");

-- CreateIndex
CREATE INDEX "SmsLog_sentAt_idx" ON "SmsLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppConversation_ownerAgentId_remotePhone_key" ON "WhatsAppConversation"("ownerAgentId", "remotePhone");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_ownerAgentId_idx" ON "WhatsAppConversation"("ownerAgentId");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_clientId_idx" ON "WhatsAppConversation"("clientId");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_remotePhone_idx" ON "WhatsAppConversation"("remotePhone");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_lastMessageAt_idx" ON "WhatsAppConversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_status_idx" ON "WhatsAppConversation"("status");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_isUnassigned_idx" ON "WhatsAppConversation"("isUnassigned");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_phoneNumberId_idx" ON "WhatsAppConversation"("phoneNumberId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_conversationId_idx" ON "WhatsAppMessage"("conversationId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_status_idx" ON "WhatsAppMessage"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppMessage_whatsappMessageId_key" ON "WhatsAppMessage"("whatsappMessageId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_sentAt_idx" ON "WhatsAppMessage"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppWebhookEvent_dedupKey_key" ON "WhatsAppWebhookEvent"("dedupKey");

-- CreateIndex
CREATE INDEX "WhatsAppWebhookEvent_conversationId_idx" ON "WhatsAppWebhookEvent"("conversationId");

-- CreateIndex
CREATE INDEX "WhatsAppWebhookEvent_type_idx" ON "WhatsAppWebhookEvent"("type");

-- CreateIndex
CREATE INDEX "WhatsAppWebhookEvent_receivedAt_idx" ON "WhatsAppWebhookEvent"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppPhoneAssignment_phoneNumberId_key" ON "WhatsAppPhoneAssignment"("phoneNumberId");

-- CreateIndex
CREATE INDEX "WhatsAppPhoneAssignment_ownerAgentId_idx" ON "WhatsAppPhoneAssignment"("ownerAgentId");

-- CreateIndex
CREATE INDEX "ScheduledCall_clientId_idx" ON "ScheduledCall"("clientId");

-- CreateIndex
CREATE INDEX "ScheduledCall_assignedEmployeeId_idx" ON "ScheduledCall"("assignedEmployeeId");

-- CreateIndex
CREATE INDEX "ScheduledCall_scheduledDate_idx" ON "ScheduledCall"("scheduledDate");

-- CreateIndex
CREATE INDEX "ScheduledCall_status_idx" ON "ScheduledCall"("status");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpCycle" ADD CONSTRAINT "FollowUpCycle_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpCycle" ADD CONSTRAINT "FollowUpCycle_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "FollowUpCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAssignment" ADD CONSTRAINT "CustomerAssignment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAssignment" ADD CONSTRAINT "CustomerAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAssignment" ADD CONSTRAINT "CustomerAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsLog" ADD CONSTRAINT "SmsLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsLog" ADD CONSTRAINT "SmsLog_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "FollowUp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppConversation" ADD CONSTRAINT "WhatsAppConversation_ownerAgentId_fkey" FOREIGN KEY ("ownerAgentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppConversation" ADD CONSTRAINT "WhatsAppConversation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "WhatsAppConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppWebhookEvent" ADD CONSTRAINT "WhatsAppWebhookEvent_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "WhatsAppConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppPhoneAssignment" ADD CONSTRAINT "WhatsAppPhoneAssignment_ownerAgentId_fkey" FOREIGN KEY ("ownerAgentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCall" ADD CONSTRAINT "ScheduledCall_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCall" ADD CONSTRAINT "ScheduledCall_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

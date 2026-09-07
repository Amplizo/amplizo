-- CreateIndex
CREATE INDEX "Chat_agentId_status_idx" ON "Chat"("agentId", "status");

-- CreateIndex
CREATE INDEX "Chat_clientId_status_idx" ON "Chat"("clientId", "status");

-- CreateIndex
CREATE INDEX "Chat_updatedAt_idx" ON "Chat"("updatedAt");

-- CreateIndex
CREATE INDEX "Client_status_idx" ON "Client"("status");

-- CreateIndex
CREATE INDEX "Client_plan_idx" ON "Client"("plan");

-- CreateIndex
CREATE INDEX "Client_city_idx" ON "Client"("city");

-- CreateIndex
CREATE INDEX "Client_createdAt_idx" ON "Client"("createdAt");

-- CreateIndex
CREATE INDEX "FollowUp_clientId_status_scheduledDate_idx" ON "FollowUp"("clientId", "status", "scheduledDate");

-- CreateIndex
CREATE INDEX "FollowUp_assignedEmployeeId_status_scheduledDate_idx" ON "FollowUp"("assignedEmployeeId", "status", "scheduledDate");

-- CreateIndex
CREATE INDEX "Purchase_clientId_purchaseDate_idx" ON "Purchase"("clientId", "purchaseDate");

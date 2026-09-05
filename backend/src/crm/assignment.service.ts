import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActivityLogService } from "./activity-log.service";

@Injectable()
export class AssignmentService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
  ) {}

  async assign(clientId: string, employeeId: string, actorId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException("Customer not found");
    const employee = await this.prisma.agent.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException("Employee not found");

    if (client.assignedEmployeeId) {
      await this.prisma.customerAssignment.updateMany({
        where: { clientId, employeeId: client.assignedEmployeeId, unassignedAt: null },
        data: { unassignedAt: new Date() },
      });
    }

    const assignment = await this.prisma.customerAssignment.create({
      data: { clientId, employeeId, assignedById: actorId },
    });
    await this.prisma.client.update({
      where: { id: clientId },
      data: { assignedEmployeeId: employeeId },
    });
    await this.prisma.followUp.updateMany({
      where: { clientId, status: "PENDING" },
      data: { assignedEmployeeId: employeeId },
    });

    await this.activityLog.log({
      clientId,
      userId: actorId,
      activityType: "CUSTOMER_ASSIGNED",
      description: `Customer assigned to ${employee.name}`,
      metadata: { assignmentId: assignment.id, employeeId, employeeName: employee.name },
    });
    return assignment;
  }

  async unassign(clientId: string, actorId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException("Customer not found");
    if (!client.assignedEmployeeId) return { success: true };
    await this.prisma.customerAssignment.updateMany({
      where: { clientId, employeeId: client.assignedEmployeeId, unassignedAt: null },
      data: { unassignedAt: new Date() },
    });
    await this.prisma.client.update({
      where: { id: clientId },
      data: { assignedEmployeeId: null },
    });
    await this.activityLog.log({
      clientId,
      userId: actorId,
      activityType: "CUSTOMER_UNASSIGNED",
      description: `Customer unassigned`,
    });
    return { success: true };
  }

  async getEmployees() {
    return this.prisma.agent.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true, email: true, mobile: true, role: true, status: true, createdAt: true },
      orderBy: { name: "asc" },
    });
  }

  async getEmployeeWorkload(employeeId: string) {
    const [assignedCustomers, pendingFollowUps, todayFollowUps, completedFollowUps] = await Promise.all([
      this.prisma.client.count({ where: { assignedEmployeeId: employeeId } }),
      this.prisma.followUp.count({ where: { assignedEmployeeId: employeeId, status: "PENDING" } }),
      this.prisma.followUp.count({
        where: {
          assignedEmployeeId: employeeId,
          status: "PENDING",
          scheduledDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lte: new Date(new Date().setHours(23, 59, 59, 999)) },
        },
      }),
      this.prisma.followUp.count({ where: { assignedEmployeeId: employeeId, status: "COMPLETED" } }),
    ]);
    return { assignedCustomers, pendingFollowUps, todayFollowUps, completedFollowUps };
  }
}

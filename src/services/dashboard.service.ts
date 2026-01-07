import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DashboardService {
  async getSummary() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's attendance
    const todayAttendances = await prisma.attendance.findMany({
      where: {
        checkInTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        user: {
          select: {
            department: true,
          },
        },
      },
    });

    // Count missing checkouts
    const missingCheckouts = todayAttendances.filter(
      a => !a.checkOutTime && !a.missingCheckout
    ).length;

    // Count late arrivals
    const lateArrivals = todayAttendances.filter(a => a.lateArrival).length;

    // Get total active users
    const totalEmployees = await prisma.user.count({
      where: { status: "ACTIVE" },
    });

    // Get pending WFH requests
    const pendingWFHRequests = await prisma.wfh_request.count({
      where: { status: "PENDING" },
    });

    // Get unread notifications count (for current user - would need userId in real implementation)
    const unreadNotifications = await prisma.notification.count({
      where: { read: false },
    });

    return {
      today: {
        totalCheckIns: todayAttendances.length,
        missingCheckouts,
        lateArrivals,
        presentCount: todayAttendances.filter(a => a.status === "PRESENT").length,
      },
      overall: {
        totalEmployees,
        pendingWFHRequests,
        unreadNotifications,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

import { PrismaClient } from "@prisma/client";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import { logger } from "@/config/logger";

const prisma = new PrismaClient();

export class AttendanceService {
  async checkIn(userId: string, data: {
    location?: string;
    lat?: number;
    lng?: number;
    timezone?: string;
  }) {
    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        checkInTime: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingAttendance) {
      throw new AppError(
        "Already checked in today",
        400,
        ErrorCode.INVALID_REQUEST
      );
    }

    const checkInTime = new Date();
    const workFromHome = !data.location && (!data.lat || !data.lng);

    // Check if late (assuming 9 AM is standard start time)
    const lateThreshold = new Date(checkInTime);
    lateThreshold.setHours(9, 30, 0, 0);
    const lateArrival = checkInTime > lateThreshold;

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        checkInTime,
        checkInLocation: data.location,
        checkInLat: data.lat,
        checkInLng: data.lng,
        workFromHome,
        lateArrival,
        status: lateArrival ? "LATE" : "PRESENT",
        timezone: data.timezone || "UTC",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return attendance;
  }

  async checkOut(userId: string, data: {
    location?: string;
    lat?: number;
    lng?: number;
  }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        checkInTime: {
          gte: today,
          lt: tomorrow,
        },
        checkOutTime: null,
      },
    });

    if (!attendance) {
      throw new AppError(
        "No active check-in found",
        404,
        ErrorCode.NOT_FOUND
      );
    }

    const checkOutTime = new Date();
    const checkInTime = attendance.checkInTime;
    const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime,
        checkOutLocation: data.location,
        checkOutLat: data.lat,
        checkOutLng: data.lng,
        missingCheckout: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async getMyAttendance(userId: string, filters: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters.startDate || filters.endDate) {
      where.checkInTime = {};
      if (filters.startDate) {
        where.checkInTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.checkInTime.lte = endDate;
      }
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { checkInTime: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      data: attendances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllAttendance(filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
    department?: string;
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.department) {
      where.user = { department: filters.department };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.date) {
      const date = new Date(filters.date);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.checkInTime = {
        gte: date,
        lt: nextDay,
      };
    } else if (filters.startDate || filters.endDate) {
      where.checkInTime = {};
      if (filters.startDate) {
        where.checkInTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.checkInTime.lte = endDate;
      }
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { checkInTime: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            },
          },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      data: attendances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createWFHRequest(userId: string, data: {
    date: string;
    reason: string;
  }) {
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);

    // Check if request already exists for this date
    const existing = await prisma.wfh_request.findFirst({
      where: {
        userId,
        date,
      },
    });

    if (existing) {
      throw new AppError(
        "WFH request already exists for this date",
        400,
        ErrorCode.ALREADY_EXISTS
      );
    }

    const wfhRequest = await prisma.wfh_request.create({
      data: {
        userId,
        date,
        reason: data.reason,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return wfhRequest;
  }

  async updateWFHRequest(requestId: string, status: "APPROVED" | "REJECTED", approvedBy: string) {
    const wfhRequest = await prisma.wfh_request.findUnique({
      where: { id: requestId },
    });

    if (!wfhRequest) {
      throw new AppError("WFH request not found", 404, ErrorCode.NOT_FOUND);
    }

    if (wfhRequest.status !== "PENDING") {
      throw new AppError(
        "WFH request already processed",
        400,
        ErrorCode.INVALID_REQUEST
      );
    }

    const updated = await prisma.wfh_request.update({
      where: { id: requestId },
      data: {
        status,
        approvedBy,
        approvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async getWFHRequests(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) {
      where.status = filters.status;
    }

    const [requests, total] = await Promise.all([
      prisma.wfh_request.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            },
          },
          attachments: true,
        },
      }),
      prisma.wfh_request.count({ where }),
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAttendanceStats(filters: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }) {
    const where: any = {};

    if (filters.department) {
      where.user = { department: filters.department };
    }

    if (filters.startDate || filters.endDate) {
      where.checkInTime = {};
      if (filters.startDate) {
        where.checkInTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.checkInTime.lte = endDate;
      }
    } else {
      // Default to last 30 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      where.checkInTime = { gte: startDate };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            department: true,
          },
        },
      },
    });

    const totalRecords = attendances.length;
    const presentCount = attendances.filter(a => a.status === "PRESENT").length;
    const lateCount = attendances.filter(a => a.lateArrival).length;
    const wfhCount = attendances.filter(a => a.workFromHome).length;
    const missingCheckoutCount = attendances.filter(a => a.missingCheckout).length;

    // Calculate average hours
    const attendancesWithCheckout = attendances.filter(a => a.checkOutTime);
    const totalHours = attendancesWithCheckout.reduce((sum, a) => {
      if (a.checkOutTime) {
        const hours = (a.checkOutTime.getTime() - a.checkInTime.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    const avgHours = attendancesWithCheckout.length > 0
      ? totalHours / attendancesWithCheckout.length
      : 0;

    return {
      totalRecords,
      presentCount,
      lateCount,
      wfhCount,
      missingCheckoutCount,
      avgHours: Math.round(avgHours * 100) / 100,
      onTimeRate: totalRecords > 0
        ? Math.round(((totalRecords - lateCount) / totalRecords) * 10000) / 100
        : 0,
    };
  }

  async getAttendanceCalendar(employeeId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || (now.getMonth() + 1);
    const targetYear = year || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const attendances = await prisma.attendance.findMany({
      where: {
        userId: employeeId,
        checkInTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { checkInTime: "asc" },
    });

    return attendances;
  }
}

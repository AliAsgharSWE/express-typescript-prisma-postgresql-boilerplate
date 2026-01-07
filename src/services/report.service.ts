import { PrismaClient } from "@prisma/client";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";

const prisma = new PrismaClient();

export class ReportService {
  async getAttendanceReport(filters: {
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
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: { checkInTime: "desc" },
    });

    // Group by user
    const userReports = attendances.reduce((acc: any, attendance) => {
      const userId = attendance.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: attendance.user,
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          wfhDays: 0,
          absentDays: 0,
          totalHours: 0,
          attendances: [],
        };
      }

      acc[userId].totalDays++;
      acc[userId].attendances.push(attendance);

      if (attendance.status === "PRESENT") {
        acc[userId].presentDays++;
      } else if (attendance.status === "LATE") {
        acc[userId].lateDays++;
      } else if (attendance.status === "ABSENT") {
        acc[userId].absentDays++;
      }

      if (attendance.workFromHome) {
        acc[userId].wfhDays++;
      }

      if (attendance.checkOutTime) {
        const hours = (attendance.checkOutTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60);
        acc[userId].totalHours += hours;
      }

      return acc;
    }, {});

    return {
      period: {
        startDate: filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: filters.endDate || new Date().toISOString(),
      },
      summary: {
        totalEmployees: Object.keys(userReports).length,
        totalRecords: attendances.length,
      },
      data: Object.values(userReports),
    };
  }

  async getPerformanceReport(filters: {
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
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
    });

    const totalRecords = attendances.length;
    const lateCount = attendances.filter(a => a.lateArrival).length;
    const onTimeRate = totalRecords > 0
      ? Math.round(((totalRecords - lateCount) / totalRecords) * 10000) / 100
      : 0;

    // WFH trends
    const wfhCount = attendances.filter(a => a.workFromHome).length;
    const wfhRate = totalRecords > 0
      ? Math.round((wfhCount / totalRecords) * 10000) / 100
      : 0;

    // Group by date for trends
    const trends = attendances.reduce((acc: any, attendance) => {
      const date = attendance.checkInTime.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          late: 0,
          wfh: 0,
        };
      }
      acc[date].total++;
      if (attendance.lateArrival) acc[date].late++;
      if (attendance.workFromHome) acc[date].wfh++;
      return acc;
    }, {});

    return {
      period: {
        startDate: filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: filters.endDate || new Date().toISOString(),
      },
      metrics: {
        onTimeRate,
        lateArrivalRate: Math.round((lateCount / totalRecords) * 10000) / 100,
        wfhRate,
        totalRecords,
        lateCount,
        wfhCount,
      },
      trends: Object.values(trends).sort((a: any, b: any) => a.date.localeCompare(b.date)),
    };
  }

  async exportReport(type: string, format: string, filters: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }) {
    let data: any;

    if (type === "attendance") {
      data = await this.getAttendanceReport(filters);
    } else if (type === "performance") {
      data = await this.getPerformanceReport(filters);
    } else {
      throw new AppError("Invalid report type", 400, ErrorCode.INVALID_INPUT);
    }

    // In a real implementation, you would use libraries like:
    // - csv-writer for CSV
    // - pdfkit or puppeteer for PDF
    // - exceljs for XLSX
    // For now, we'll return the data with metadata about the export

    return {
      type,
      format,
      data,
      exportedAt: new Date().toISOString(),
      note: "Export functionality requires additional libraries (csv-writer, pdfkit, exceljs)",
    };
  }

  async getKeyInsights(filters: {
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

    // Department performance
    const departmentStats = attendances.reduce((acc: any, attendance) => {
      const dept = attendance.user.department || "Unknown";
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          total: 0,
          late: 0,
          wfh: 0,
        };
      }
      acc[dept].total++;
      if (attendance.lateArrival) acc[dept].late++;
      if (attendance.workFromHome) acc[dept].wfh++;
      return acc;
    }, {});

    const topDepartments = Object.values(departmentStats)
      .map((dept: any) => ({
        ...dept,
        onTimeRate: dept.total > 0
          ? Math.round(((dept.total - dept.late) / dept.total) * 10000) / 100
          : 0,
      }))
      .sort((a: any, b: any) => b.onTimeRate - a.onTimeRate)
      .slice(0, 5);

    const totalRecords = attendances.length;
    const lateCount = attendances.filter(a => a.lateArrival).length;
    const wfhCount = attendances.filter(a => a.workFromHome).length;
    const missingCheckoutCount = attendances.filter(a => a.missingCheckout).length;

    return {
      topDepartments,
      summary: {
        totalRecords,
        lateCount,
        wfhCount,
        missingCheckoutCount,
        onTimeRate: totalRecords > 0
          ? Math.round(((totalRecords - lateCount) / totalRecords) * 10000) / 100
          : 0,
      },
    };
  }
}

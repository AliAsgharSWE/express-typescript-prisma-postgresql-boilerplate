import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import { prisma } from "@/config/database";
import bcrypt from "bcrypt";

export class UserService {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        contact: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404, ErrorCode.NOT_FOUND);
    }

    return user;
  }

  async updateMe(userId: string, data: {
    name?: string;
    contact?: string;
    password?: string;
  }) {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.contact) updateData.contact = data.contact;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        contact: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getAllUsers(filters: {
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.department) {
      where.department = filters.department;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          contact: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        contact: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404, ErrorCode.NOT_FOUND);
    }

    return user;
  }

  async updateUser(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      role: string;
      department: string;
      contact: string;
      status: string;
    }>
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        contact: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUserRole(id: string, role: string) {
    const validRoles = ["ADMIN", "USER", "MANAGER", "HR"];
    if (!validRoles.includes(role)) {
      throw new AppError("Invalid role", 400, ErrorCode.INVALID_INPUT);
    }

    return prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        contact: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(id: string) {
    await prisma.user.delete({
      where: { id },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
    contact?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError("Email already exists", 400, ErrorCode.ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: (data.role as any) || "USER",
        department: data.department,
        contact: data.contact,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        contact: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

import prisma from "../config/database";
import { User, Prisma } from "@prisma/client";

export class UserRepository {
  async findByGoogleId(googleId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { googleId },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async upsertGoogleUser(data: { googleId: string; email: string; name: string; avatar?: string | null }): Promise<User> {
    return prisma.user.upsert({
      where: { googleId: data.googleId },
      create: data,
      update: {
        email: data.email,
        name: data.name,
        avatar: data.avatar,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}

export const userRepository = new UserRepository();

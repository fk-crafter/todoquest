import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UpdateUserDto {
  name?: string;
  gender?: string;
  isOnboarded?: boolean;
  image?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        role: true,
        createdAt: true,
        gender: true,
        isOnboarded: true,
        image: true,
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const [totalTasks, completedTasks, timeAggregation] = await Promise.all([
      this.prisma.task.count({ where: { userId } }),
      this.prisma.task.count({ where: { userId, completed: true } }),
      this.prisma.task.aggregate({
        where: { userId, completed: true },
        _sum: {
          timeSpent: true,
        },
      }),
    ]);

    return {
      ...user,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        totalMinutesSpent: timeAggregation._sum.timeSpent || 0,
      },
    };
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        gender: data.gender,
        isOnboarded: data.isOnboarded,
        image: data.image,
      },
    });
  }
}

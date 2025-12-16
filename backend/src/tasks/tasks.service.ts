import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private getXpCap(level: number): number {
    return 100 + level * 50;
  }

  private calculateXpGain(timeSpent: number): number {
    const baseXp = 50;
    const bonusXp = Math.floor(timeSpent / 5);
    return baseXp + bonusXp;
  }

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async completeTask(userId: string, taskId: string, timeSpent: number = 0) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Tâche introuvable');
    if (task.completed)
      throw new BadRequestException('Cette tâche est déjà terminée');
    if (task.userId !== userId)
      throw new UnauthorizedException('Cette tâche ne vous appartient pas');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const xpGained = this.calculateXpGain(timeSpent);

    let newXP = user.xp + xpGained;
    let newLevel = user.level;
    let xpCap = this.getXpCap(newLevel);

    while (newXP >= xpCap) {
      newXP -= xpCap;
      newLevel++;
      xpCap = this.getXpCap(newLevel);
    }

    const [updatedTask, updatedUser] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: {
          completed: true,
          completedAt: new Date(),
          gainedXp: xpGained,
          timeSpent: timeSpent,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: newXP,
          level: newLevel,
        },
      }),
    ]);

    return {
      message: 'Tâche complétée !',
      task: updatedTask,
      userStats: {
        level: updatedUser.level,
        xp: updatedUser.xp,
        xpToNextLevel: this.getXpCap(updatedUser.level),
        gainedXp: xpGained,
        levelUp: newLevel > user.level,
      },
    };
  }

  async delete(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) throw new NotFoundException('Tâche introuvable');
    if (task.userId !== userId) throw new UnauthorizedException('Accès refusé');

    if (!task.completed) {
      return this.prisma.task.delete({ where: { id: taskId } });
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const xpToRestore = task.gainedXp || 0;
    let newXP = user.xp - xpToRestore;
    let newLevel = user.level;

    while (newXP < 0 && newLevel > 1) {
      newLevel -= 1;
      const prevLevelCap = this.getXpCap(newLevel);
      newXP += prevLevelCap;
    }

    if (newLevel === 1 && newXP < 0) {
      newXP = 0;
    }

    await this.prisma.$transaction([
      this.prisma.task.delete({ where: { id: taskId } }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: newXP,
          level: newLevel,
        },
      }),
    ]);

    return { message: 'Tâche supprimée et XP ajustée' };
  }
}

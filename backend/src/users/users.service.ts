import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UpdateUserDto {
  name?: string;
  gender?: string;
  isOnboarded?: boolean;
  image?: string;
  class?: 'ADVENTURER' | 'ARCHER' | 'MAGE' | 'SWORDSMAN';
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
        class: true,
        gold: true,
        inventory: true,
        equippedTheme: true,
        equippedFrame: true,
        equippedTitle: true,
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
        class: data.class,
      },
    });
  }

  async buyItem(userId: string, itemId: string, price: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (user.gold < price) {
      throw new BadRequestException("Pas assez d'or !");
    }
    const inventory = user.inventory || [];

    if (inventory.includes(itemId)) {
      throw new BadRequestException('Tu possèdes déjà cet objet !');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        gold: { decrement: price },
        inventory: { push: itemId },
      },
    });
  }

  async equipItem(userId: string, itemId: string, category: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (itemId !== 'default' && !user.inventory.includes(itemId)) {
      throw new BadRequestException('Tu ne possèdes pas cet objet !');
    }

    let updateData = {};

    switch (category) {
      case 'THEME':
        updateData = { equippedTheme: itemId === 'default' ? null : itemId };
        break;

      case 'FRAME':
        updateData = { equippedFrame: itemId === 'default' ? null : itemId };
        break;

      case 'TITLE':
        updateData = { equippedTitle: itemId === 'default' ? null : itemId };
        break;

      default:
        throw new BadRequestException(`Catégorie inconnue : ${category}`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}

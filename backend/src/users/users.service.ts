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
        lastRewardClaimedAt: true,
        streakCount: true,
        streakFreezes: true,
        doubleXpPotions: true,
        doubleXpUntil: true,
        monsterHp: true,
        monsterMaxHp: true,
        monsterEndTime: true,
        nextInvasionTime: true,
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

    const now = new Date();

    let monsterFled = null;

    if (
      user.monsterHp !== null &&
      user.monsterEndTime &&
      user.monsterEndTime < now
    ) {
      const cooldownHours = Math.floor(Math.random() * (72 - 24 + 1)) + 24;
      const nextInvasion = new Date(
        now.getTime() + cooldownHours * 60 * 60 * 1000,
      );

      const goldStolen = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
      const actualGoldStolen = Math.min(user.gold, goldStolen);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          monsterHp: null,
          monsterMaxHp: null,
          monsterEndTime: null,
          nextInvasionTime: nextInvasion,
          gold: { decrement: actualGoldStolen },
        },
      });

      user.monsterHp = null;
      user.nextInvasionTime = nextInvasion;
      user.gold -= actualGoldStolen;
      monsterFled = { stolenGold: actualGoldStolen };
    }

    if (
      user.monsterHp === null &&
      (!user.nextInvasionTime || user.nextInvasionTime <= now)
    ) {
      const newEndTime = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          monsterHp: 100,
          monsterMaxHp: 100,
          monsterEndTime: newEndTime,
          nextInvasionTime: null,
        },
      });

      user.monsterHp = 100;
      user.monsterMaxHp = 100;
      user.monsterEndTime = newEndTime;
      user.nextInvasionTime = null;
    }

    return {
      ...user,
      monsterFled,
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

    if (itemId === 'potion_freeze') {
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          gold: { decrement: price },
          streakFreezes: { increment: 1 },
        },
      });
    }

    if (itemId === 'potion_dxp') {
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          gold: { decrement: price },
          doubleXpPotions: { increment: 1 },
        },
      });
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

  async useDoubleXpPotion(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (user.doubleXpPotions <= 0) {
      throw new BadRequestException('Tu ne possèdes pas de Potion Double XP !');
    }

    const now = new Date();
    const currentUntil = user.doubleXpUntil
      ? new Date(user.doubleXpUntil)
      : null;
    const newUntil =
      currentUntil && currentUntil > now
        ? new Date(currentUntil.getTime() + 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        doubleXpPotions: { decrement: 1 },
        doubleXpUntil: newUntil,
      },
      select: {
        doubleXpPotions: true,
        doubleXpUntil: true,
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

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        xp: true,
        class: true,
        createdAt: true,
        gold: true,
      },
    });
  }

  async claimDailyReward(userId: string, useFreeze: boolean = false) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        gold: true,
        xp: true,
        level: true,
        streakCount: true,
        streakFreezes: true,
        lastRewardClaimedAt: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const now = new Date();
    const createdAt = new Date(user.createdAt);

    const isRegistrationDay =
      createdAt.getFullYear() === now.getFullYear() &&
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getDate() === now.getDate();

    if (isRegistrationDay) {
      throw new BadRequestException(
        'Tu pourras commencer à récupérer ta récompense journalière demain !',
      );
    }

    let newStreak = 1;
    let usedFreeze = false;

    if (user.lastRewardClaimedAt) {
      const lastClaim = new Date(user.lastRewardClaimedAt);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastClaimDay = new Date(
        lastClaim.getFullYear(),
        lastClaim.getMonth(),
        lastClaim.getDate(),
      );

      const diffTime = today.getTime() - lastClaimDay.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        throw new BadRequestException(
          "Tu as déjà récupéré ta récompense aujourd'hui ! Reviens demain.",
        );
      } else if (diffDays === 1) {
        newStreak = (user.streakCount || 0) + 1;
      } else {
        if (useFreeze) {
          if (user.streakFreezes <= 0) {
            throw new BadRequestException(
              "Tu n'as pas de Gel de Série en stock !",
            );
          }
          newStreak = user.streakCount || 1;
          usedFreeze = true;
        } else {
          newStreak = 1;
        }
      }
    }

    const baseGold = 25;
    const finalGold = baseGold;
    let finalXp = 0;

    if (newStreak > 0 && newStreak % 3 === 0) {
      finalXp = 150;
    }

    let newXP = user.xp + finalXp;
    let newLevel = user.level || 1;

    const getXpCap = (lvl: number) => lvl * 25;
    let xpCap = getXpCap(newLevel);

    while (newXP >= xpCap) {
      newXP -= xpCap;
      newLevel++;
      xpCap = getXpCap(newLevel);
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        gold: { increment: finalGold },
        xp: newXP,
        level: newLevel,
        streakCount: newStreak,
        lastRewardClaimedAt: now,
        ...(usedFreeze ? { streakFreezes: { decrement: 1 } } : {}),
      },
      select: {
        gold: true,
        xp: true,
        level: true,
        streakCount: true,
        lastRewardClaimedAt: true,
        streakFreezes: true,
      },
    });
  }

  async addGoldToUserAdmin(
    adminId: string,
    targetUserId: string,
    amount: number,
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new BadRequestException(
        'Accès refusé. Seul un Game Master peut faire ça.',
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('Joueur introuvable.');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        gold: { increment: amount },
      },
      select: { id: true, name: true, gold: true },
    });
  }

  async addGoldAfterPayment(userId: string, amount: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        gold: {
          increment: amount,
        },
      },
    });
  }

  async searchUserByTag(searchQuery: string) {
    if (!searchQuery.includes('#')) {
      throw new BadRequestException('Format invalide. Utilisez Pseudo#1234');
    }

    const [name, tag] = searchQuery.split('#');

    if (!name || !tag) {
      throw new BadRequestException('Format invalide. Utilisez Pseudo#1234');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        userTag: tag,
      },
      select: {
        id: true,
        name: true,
        userTag: true,
        level: true,
        class: true,
        image: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Aventurier introuvable.');
    }

    return user;
  }

  async generateMissingTags() {
    const usersWithoutTag = await this.prisma.user.findMany({
      where: { userTag: null },
    });

    let count = 0;

    for (const user of usersWithoutTag) {
      let tag = '';
      let isUnique = false;

      while (!isUnique) {
        tag = Math.floor(1000 + Math.random() * 9000).toString();
        const existingUser = await this.prisma.user.findFirst({
          where: { name: user.name, userTag: tag },
        });
        if (!existingUser) isUnique = true;
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { userTag: tag },
      });
      count++;
    }

    return {
      message: `${count} tags ont été générés pour les anciens comptes !`,
    };
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        userTag: true,
        level: true,
        class: true,
        gender: true,
        image: true,
        xp: true,
        equippedTheme: true,
        equippedFrame: true,
        equippedTitle: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('Aventurier introuvable');

    const completedTasks = await this.prisma.task.count({
      where: { userId, completed: true },
    });

    return { ...user, stats: { completedTasks } };
  }
}

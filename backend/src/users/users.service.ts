import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    // 1. Récupérer les infos de l'utilisateur
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
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // 2. Lancer les calculs de stats en parallèle (plus rapide)
    // On utilise Promise.all pour ne pas attendre que le premier finisse avant de lancer le second
    const [totalTasks, completedTasks, timeAggregation] = await Promise.all([
      // Compte total
      this.prisma.task.count({ where: { userId } }),

      // Compte des terminées
      this.prisma.task.count({ where: { userId, completed: true } }),

      // Somme du temps passé (seulement sur les tâches terminées)
      this.prisma.task.aggregate({
        where: { userId, completed: true },
        _sum: {
          timeSpent: true, // On veut la somme de cette colonne
        },
      }),
    ]);

    // 3. Retourner le résultat fusionné
    return {
      ...user,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        // Si c'est null (aucune tâche), on renvoie 0
        totalMinutesSpent: timeAggregation._sum.timeSpent || 0,
      },
    };
  }
}

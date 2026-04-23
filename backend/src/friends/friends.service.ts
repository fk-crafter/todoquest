import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendFriendRequest(requesterId: string, targetId: string) {
    if (requesterId === targetId) {
      throw new BadRequestException("Tu ne peux pas t'ajouter toi-même !");
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!targetUser) throw new NotFoundException('Joueur introuvable.');

    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: requesterId, addresseeId: targetId },
          { requesterId: targetId, addresseeId: requesterId },
        ],
      },
    });

    if (existingFriendship) {
      throw new BadRequestException(
        'Une demande ou une relation existe déjà avec ce joueur.',
      );
    }

    return this.prisma.friendship.create({
      data: {
        requesterId,
        addresseeId: targetId,
        status: 'PENDING',
      },
    });
  }

  async acceptFriendRequest(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || friendship.addresseeId !== userId) {
      throw new BadRequestException('Demande invalide ou introuvable.');
    }

    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    });
  }

  async removeFriend(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (
      !friendship ||
      (friendship.addresseeId !== userId && friendship.requesterId !== userId)
    ) {
      throw new BadRequestException('Action non autorisée.');
    }

    return this.prisma.friendship.delete({
      where: { id: friendshipId },
    });
  }

  async getPendingRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            userTag: true,
            level: true,
            class: true,
            image: true,
          },
        },
      },
    });
  }

  async getFriendsList(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            userTag: true,
            level: true,
            class: true,
            image: true,
            xp: true,
          },
        },
        addressee: {
          select: {
            id: true,
            name: true,
            userTag: true,
            level: true,
            class: true,
            image: true,
            xp: true,
          },
        },
      },
    });

    return friendships.map((f) => {
      const isRequester = f.requesterId === userId;
      const friend = isRequester ? f.addressee : f.requester;
      return {
        friendshipId: f.id,
        friend,
      };
    });
  }
}

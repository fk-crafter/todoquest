import {
  Controller,
  Get,
  UseGuards,
  Req,
  Patch,
  Body,
  Post,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Polar } from '@polar-sh/sdk';
import { Request } from 'express';

interface RequestWithUser {
  user: {
    id: string;
    email?: string;
  };
}

interface UpdateUserDto {
  name?: string;
  gender?: string;
  isOnboarded?: boolean;
  image?: string;
  class?: 'ADVENTURER' | 'ARCHER' | 'MAGE' | 'SWORDSMAN';
}

interface PolarWebhookEvent {
  type: string;
  data: {
    metadata?: { userId?: string };
    product: {
      metadata?: { goldAmount?: string };
    };
  };
}

@Controller('users')
export class UsersController {
  private polar: Polar;

  constructor(private readonly usersService: UsersService) {
    this.polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@Req() req: RequestWithUser, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('buy')
  async buyItem(
    @Req() req: RequestWithUser,
    @Body() body: { itemId: string; price: number },
  ) {
    try {
      return await this.usersService.buyItem(
        req.user.id,
        body.itemId,
        body.price,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException("Erreur lors de l'achat");
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('equip')
  async equipItem(
    @Req() req: RequestWithUser,
    @Body() body: { itemId: string; category: string },
  ) {
    try {
      return await this.usersService.equipItem(
        req.user.id,
        body.itemId,
        body.category,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException("Erreur lors de l'équipement");
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  remove(@Req() req: RequestWithUser) {
    console.log('Suppression du compte ID:', req.user.id);
    return this.usersService.deleteUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('daily-reward')
  async claimDailyReward(@Req() req: RequestWithUser) {
    try {
      return await this.usersService.claimDailyReward(req.user.id);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(
        'Erreur lors de la récupération de la récompense',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllUsers(@Req() req: RequestWithUser) {
    const user = await this.usersService.getProfile(req.user.id);
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Accès refusé');
    }
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/gold')
  async addGold(
    @Req() req: RequestWithUser,
    @Param('id') targetUserId: string,
    @Body('amount') amount: number,
  ) {
    try {
      if (!amount || amount <= 0) {
        throw new BadRequestException('Le montant doit être supérieur à 0');
      }

      return await this.usersService.addGoldToUserAdmin(
        req.user.id,
        targetUserId,
        amount,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException("Erreur lors de l'ajout d'or");
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(
    @Body() body: { packId: string },
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const polarProducts: Record<string, string | undefined> = {
      small: process.env.POLAR_PRODUCT_SMALL,
      medium: process.env.POLAR_PRODUCT_MEDIUM,
      large: process.env.POLAR_PRODUCT_LARGE,
    };

    const polarProductId = polarProducts[body.packId];

    if (!polarProductId) {
      throw new BadRequestException(
        "Pack d'or invalide ou configuration manquante",
      );
    }

    try {
      const checkout = await this.polar.checkouts.create({
        products: [polarProductId],
        successUrl: `${process.env.FRONTEND_URL}/shop?success=true`,
        metadata: {
          userId: userId.toString(),
        },
      });

      return { url: checkout.url };
    } catch (error) {
      console.error('Erreur Polar Checkout:', error);
      throw new BadRequestException(
        "Erreur lors de l'initialisation du paiement",
      );
    }
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
  ) {
    console.log('WEBHOOK REÇU !');

    const signature = req.headers['polar-webhook-signature'];
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    console.log('Signature présente:', !!signature);
    console.log('Secret présent:', !!webhookSecret);

    if (!signature || typeof signature !== 'string' || !webhookSecret) {
      throw new BadRequestException('Missing signature or webhook secret');
    }

    try {
      const webhookHandler = this.polar.webhooks as unknown as {
        validatePayload: (
          payload: string,
          sig: string,
          secret: string,
        ) => PolarWebhookEvent;
      };

      const event = webhookHandler.validatePayload(
        JSON.stringify(body),
        signature,
        webhookSecret,
      );

      console.log('Événement validé:', event.type);

      if (event.type === 'order.created') {
        const order = event.data;
        const userId = order.metadata?.userId;
        const productMetadata = order.product?.metadata;
        const goldAmountStr = productMetadata?.goldAmount;
        const goldAmount =
          typeof goldAmountStr === 'string' ? parseInt(goldAmountStr, 10) : 0;

        if (userId && goldAmount > 0) {
          console.log(`Succès ! Ajout de ${goldAmount} or à ${userId}`);
          await this.usersService.addGoldAfterPayment(userId, goldAmount);
        }
      }

      return { received: true };
    } catch (error: unknown) {
      // On type l'erreur proprement pour ESLint
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Erreur validation Webhook:', errorMessage);
      throw new BadRequestException(`Webhook error: ${errorMessage}`);
    }
  }
}

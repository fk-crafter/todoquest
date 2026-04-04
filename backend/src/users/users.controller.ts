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

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
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

// Cette interface permet de dire à ESLint que ces fonctions existent de façon "Safe"
interface PolarWebhookHandler {
  validate?: (p: string, s: string, sec: string) => PolarWebhookEvent;
  validatePayload?: (p: string, s: string, sec: string) => PolarWebhookEvent;
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
  async handleWebhook(@Req() req: RequestWithRawBody) {
    const rawBody = req.rawBody?.toString('utf8');
    const signature = req.headers['webhook-signature'];
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    if (
      !rawBody ||
      !signature ||
      typeof signature !== 'string' ||
      !webhookSecret
    ) {
      throw new BadRequestException('Missing raw body, signature or secret');
    }

    try {
      const polarWebhooks = this.polar
        .webhooks as unknown as PolarWebhookHandler;

      const validateFn =
        polarWebhooks.validate || polarWebhooks.validatePayload;

      if (!validateFn) {
        throw new Error('No validation method found on Polar SDK');
      }

      const event = validateFn.call(
        this.polar.webhooks,
        rawBody,
        signature,
        webhookSecret,
      );

      if (event.type === 'order.created') {
        const order = event.data;
        const userId = order.metadata?.userId;
        const goldAmountStr = order.product.metadata?.goldAmount;
        const goldAmount = goldAmountStr ? parseInt(goldAmountStr, 10) : 0;

        if (typeof userId === 'string' && goldAmount > 0) {
          console.log(`MAGIE : ${goldAmount} or pour ${userId}`);
          await this.usersService.addGoldAfterPayment(userId, goldAmount);
        }
      }
      return { received: true };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('ERREUR TECHNIQUE WEBHOOK :', msg);
      throw new BadRequestException(`Validation failed: ${msg}`);
    }
  }
}

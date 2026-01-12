import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { MailService } from '../mail/mail.service';

interface VerificationTokenPayload {
  userId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        xp: 0,
        level: 1,
        gender: 'adventurer',
        isOnboarded: false,
      },
    });

    const verificationToken = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '1d' },
    );

    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return {
      message:
        'Inscription réussie. Veuillez vérifier vos emails pour activer votre compte.',
    };
  }

  async verifyEmail(token: string) {
    try {
      const payload =
        await this.jwtService.verifyAsync<VerificationTokenPayload>(token);

      await this.prisma.user.update({
        where: { id: payload.userId },
        data: { isVerified: true },
      });

      return { success: true, message: 'Email vérifié avec succès !' };
    } catch {
      throw new BadRequestException(
        'Le lien de vérification est invalide ou a expiré.',
      );
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Veuillez vérifier votre email avant de vous connecter.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { id: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        role: user.role,
        gender: user.gender,
        isOnboarded: user.isOnboarded,
        isVerified: user.isVerified,
      },
    };
  }

  async loginSocial(dto: { email: string; name: string }) {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: null,
          xp: 0,
          level: 1,
          gender: 'adventurer',
          isOnboarded: false,
          isVerified: true,
        },
      });
    }

    return this.generateToken(user);
  }
}

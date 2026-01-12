import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendVerificationEmail(email: string, token: string) {
    const confirmLink = `${process.env.FRONT_URL}/verify?token=${token}`;

    await this.resend.emails.send({
      from: 'TodoQuest <no-reply@chuzly.app>',
      to: email,
      subject: 'Vérifiez votre compte TodoQuest 🛡️',
      html: `
        <h1>Bienvenue Aventurier ! ⚔️</h1>
        <p>Pour commencer votre quête, veuillez valider votre email en cliquant sur le lien ci-dessous :</p>
        <a href="${confirmLink}" style="padding: 10px 20px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px;">Confirmer mon email</a>
        <p>Ce lien expire dans 24 heures.</p>
      `,
    });
  }
}

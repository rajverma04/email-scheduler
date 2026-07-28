import nodemailer from "nodemailer";
import { Sender } from "@prisma/client";
import { decrypt } from "../utils/crypto";

export class SmtpService {
  private createTransport(sender: Sender) {
    const host = sender.smtpHost.trim();
    const isSecurePort = sender.smtpPort === 465;
    const isGmail = host.toLowerCase().includes("gmail");

    if (isGmail) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: sender.smtpUser.trim(),
          pass: decrypt(sender.smtpPassword),
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    return nodemailer.createTransport({
      host,
      port: sender.smtpPort,
      secure: isSecurePort, // true for 465 (SSL), false for 587/25 (STARTTLS)
      auth: {
        user: sender.smtpUser.trim(),
        pass: decrypt(sender.smtpPassword),
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async verifyConnection(sender: Sender): Promise<boolean> {
    const transporter = this.createTransport(sender);
    return transporter.verify();
  }

  async sendEmail(sender: Sender, to: string, subject: string, body: string, emailId: string) {
    const transporter = this.createTransport(sender);

    try {
      const info = await transporter.sendMail({
        from: `"${sender.senderName}" <${sender.senderEmail}>`,
        to,
        subject,
        text: body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
        html: body,
        messageId: `<${emailId}@reachinbox.local>`,
      });

      return {
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info) || null,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const smtpService = new SmtpService();


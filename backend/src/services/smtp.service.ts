import nodemailer from "nodemailer";
import dns from "dns";
import { Sender } from "@prisma/client";
import { decrypt } from "../utils/crypto";

// Force IPv4 resolution on cloud providers without IPv6 network routing
try {
  dns.setDefaultResultOrder?.("ipv4first");
} catch {
  // Ignore if unsupported
}

export class SmtpService {
  private createTransport(sender: Sender) {
    const host = sender.smtpHost.trim();
    const isSecurePort = sender.smtpPort === 465;
    const isGmail = host.toLowerCase().includes("gmail");

    if (isGmail) {
      return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: sender.smtpPort || 465,
        secure: isSecurePort,
        auth: {
          user: sender.smtpUser.trim(),
          pass: decrypt(sender.smtpPassword),
        },
        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: {
          rejectUnauthorized: false,
        },
      } as any);
    }

    return nodemailer.createTransport({
      host,
      port: sender.smtpPort,
      secure: isSecurePort, // true for 465 (SSL), false for 587/25 (STARTTLS)
      auth: {
        user: sender.smtpUser.trim(),
        pass: decrypt(sender.smtpPassword),
      },
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false,
      },
    } as any);
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
        previewUrl: nodemailer.getTestMessageUrl(info as any) || null,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const smtpService = new SmtpService();


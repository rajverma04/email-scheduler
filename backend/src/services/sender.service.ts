import { senderRepository } from "../repositories/sender.repository";
import { Prisma } from "@prisma/client";
import { encrypt } from "../utils/crypto";
import { smtpService } from "./smtp.service";

export class SenderService {
  async createSender(userId: string, data: Omit<Prisma.SenderUncheckedCreateInput, "userId">) {
    const encryptedPassword = data.smtpPassword ? encrypt(data.smtpPassword) : data.smtpPassword;
    
    // Construct temporary Sender object for verification
    const tempSender = {
      ...data,
      smtpPassword: encryptedPassword,
      userId,
      id: "temp",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    try {
      await smtpService.verifyConnection(tempSender);
    } catch (err: any) {
      const errMsg = err?.message || "Failed to verify SMTP credentials";
      if (data.smtpHost.toLowerCase().includes("gmail") && (errMsg.includes("Invalid login") || errMsg.includes("535") || errMsg.includes("Username and Password not accepted"))) {
        throw new Error("Gmail SMTP Auth failed: Please make sure you are using an App Password from your Google Account settings, not your regular Gmail password.");
      }
      throw new Error(`SMTP Connection failed: ${errMsg}`);
    }

    return senderRepository.create({
      ...data,
      smtpPassword: encryptedPassword,
      userId,
    });
  }

  async getSenders(userId: string) {
    const senders = await senderRepository.findByUserId(userId);
    return senders.map(({ smtpPassword, ...sender }) => sender);
  }

  async getSenderById(id: string, userId: string) {
    const sender = await senderRepository.findById(id);
    if (!sender || sender.userId !== userId) {
      throw new Error("Sender not found");
    }
    return sender;
  }

  async updateSender(id: string, userId: string, data: Prisma.SenderUpdateInput) {
    await this.getSenderById(id, userId); // check ownership
    const updateData = { ...data };
    if (updateData.smtpPassword && typeof updateData.smtpPassword === "string") {
      updateData.smtpPassword = encrypt(updateData.smtpPassword);
    }
    return senderRepository.update(id, updateData);
  }

  async deleteSender(id: string, userId: string) {
    await this.getSenderById(id, userId); // check ownership
    return senderRepository.delete(id);
  }
}

export const senderService = new SenderService();

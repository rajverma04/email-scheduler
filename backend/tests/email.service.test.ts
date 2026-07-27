import { EmailService } from "../src/services/email.service";
import { senderRepository } from "../src/repositories/sender.repository";

jest.mock("../src/repositories/sender.repository");
jest.mock("../src/repositories/email.repository");
jest.mock("../src/services/queue.service");

describe("EmailService Unit Tests", () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
    jest.clearAllMocks();
  });

  it("should throw an error if the sender does not exist for the user", async () => {
    (senderRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      emailService.scheduleEmails("user-123", {
        senderId: "invalid-sender-id",
        subject: "Test Subject",
        body: "Test Body",
        scheduledAt: new Date().toISOString(),
        recipients: ["test@example.com"],
      })
    ).rejects.toThrow("Sender not found");
  });
});

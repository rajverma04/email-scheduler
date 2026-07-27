import { encrypt, decrypt } from "../src/utils/crypto";

describe("Crypto Utility (AES-256)", () => {
  it("should encrypt plain text password into IV:cipher format", () => {
    const plainText = "MySuperSecretPassword123!";
    const encrypted = encrypt(plainText);

    expect(encrypted).not.toEqual(plainText);
    expect(encrypted).toContain(":");
  });

  it("should decrypt encrypted password back to original plain text", () => {
    const plainText = "MySuperSecretPassword123!";
    const encrypted = encrypt(plainText);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toEqual(plainText);
  });

  it("should return legacy plain text string gracefully if not encrypted", () => {
    const plainText = "legacy_unencrypted_password";
    const decrypted = decrypt(plainText);

    expect(decrypted).toEqual(plainText);
  });
});

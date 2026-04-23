export async function decryptFile(url: string, password: string): Promise<Uint8Array> {
  try {
    const response = await fetch(url);
    const encryptedData = await response.arrayBuffer();

    // XOR decryption
    const key = new TextEncoder().encode(password);
    const decrypted = new Uint8Array(encryptedData);

    for (let i = 0; i < decrypted.length; i++) {
      decrypted[i] ^= key[i % key.length];
    }

    return decrypted;
  } catch (error) {
    console.error("❌ Error decrypting file:", error);
    throw error;
  }
}
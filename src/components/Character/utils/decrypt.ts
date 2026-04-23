export async function decryptFile(url: string, password: string): Promise<Uint8Array> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${url}`);
    const encryptedData = await response.arrayBuffer();

    // XOR decryption
    const key = new TextEncoder().encode(password);
    const decrypted = new Uint8Array(encryptedData);

    for (let i = 0; i < decrypted.length; i++) {
      decrypted[i] ^= key[i % key.length];
    }

    // Debug: log first 8 bytes to verify decryption
    const firstBytes = Array.from(decrypted.slice(0, 8))
      .map((b) => "0x" + b.toString(16).padStart(2, "0"))
      .join(" ");
    console.log(`🔍 Decrypted first bytes: ${firstBytes}`);
    console.log(`🔍 As string: "${new TextDecoder().decode(decrypted.slice(0, 4))}"`); 

    // GLB files must start with magic bytes: 0x676C5446 ("glTF")
    const isGLB =
      decrypted[0] === 0x67 && // 'g'
      decrypted[1] === 0x6c && // 'l'
      decrypted[2] === 0x54 && // 'T'
      decrypted[3] === 0x46;   // 'F'

    if (!isGLB) {
      throw new Error(
        `Decryption produced invalid GLB. First bytes: ${firstBytes}. Check your encryption key or .enc file.`
      );
    }

    console.log("✅ GLB magic bytes verified — decryption successful!");
    return decrypted;
  } catch (error) {
    console.error("❌ Error decrypting file:", error);
    throw error;
  }
}

import { ethers } from "ethers";
const API_KEY = '7c581609293E503dE149d93f34767DFF33d32C16';
const SECRET_KEY = '0xc194c2a77814de98c486836da3ae6747769ed6e6064186f2943b33f25dba284c';


export async function createSignature(
    domain: string
  ) {

    const timestamp = Date.now();
    const publicKey = API_KEY
    const secretKey = SECRET_KEY
    // Create message to sign
    const message = `${domain}:${timestamp}:${publicKey.toLowerCase()}`;
    // Create signature using ethers
    const signer = new ethers.Wallet(secretKey);
    const signature = await signer.signMessage(message);

    return {
      signature,
      timestamp,
      domain,
      publicKey,
    };
  }
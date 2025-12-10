import { TOTP } from "otpauth";
import QRCode from "qrcode";

export interface twoFactorSecret {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export async function generateTwoFactorSecret(
  userIdentfier: string
): Promise<twoFactorSecret> {
  const totp = new TOTP({
    issuer: "Asah",
    label: userIdentfier,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });

  const secret = totp.secret.base32;
  const otpauthUrl = totp.toString();
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return { secret, otpauthUrl, qrCodeDataUrl };
}

export function verifyTwoFactorToken(token: string, secret: string): boolean {
  const totp = new TOTP({ secret });

  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}

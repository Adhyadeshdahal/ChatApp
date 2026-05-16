import jwt, { Secret, SignOptions } from "jsonwebtoken";

const secret: Secret = process.env.JWT_SECRET ?? "fallback_secret";
const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

export function signToken(userId: string): string {
  return jwt.sign({ id: userId }, secret, { expiresIn });
}

export function verifyToken(token: string): { id: string } {
  return jwt.verify(token, secret) as unknown as { id: string };
}
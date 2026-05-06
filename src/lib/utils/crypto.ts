// lib/utils/crypto.ts
import crypto from 'crypto';

export function generateLotNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LOT-${year}${month}-${random}`;
}

export function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateLotHash(medicamentId: number, lotNumber: string, fabricationDate: string): string {
  const data = `${medicamentId}-${lotNumber}-${fabricationDate}-${Date.now()}`;
  return generateHash(data);
}

export function generateMouvementHash(data: any): string {
  const content = JSON.stringify(data);
  return generateHash(content);
}

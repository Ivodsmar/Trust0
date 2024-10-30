// src/services/profileService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createProfile() {
  const profile = await prisma.profile.create({
    data: {
      name: "Trader A",
      balance: 100000,
      type: "trader",
      interests: JSON.stringify({ buy: ["Oil", "Gold"], sell: ["Silver"], finance: [] }), // Convertendo para JSON string
      loans: JSON.stringify({}), // Convertendo para JSON string
    }
  });
  return profile;
}

export async function getProfiles() {
  const profiles = await prisma.profile.findMany();
  return profiles.map((profile: { interests: string; loans: string | null; [key: string]: any }) => ({
    ...profile,
    interests: JSON.parse(profile.interests), // Parse JSON string
    loans: profile.loans ? JSON.parse(profile.loans) : {} // Parse JSON string ou usa objeto vazio
  }));
}

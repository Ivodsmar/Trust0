import { PrismaClient, Profile } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllProfiles(): Promise<Profile[]> {
  return prisma.profile.findMany();
}

export async function createProfile(data: Omit<Profile, 'id'>): Promise<Profile> {
  return prisma.profile.create({ data });
}

export async function updateProfileBalance(id: string, newBalance: number): Promise<Profile> {
  return prisma.profile.update({
    where: { id },
    data: { balance: newBalance },
  });
}

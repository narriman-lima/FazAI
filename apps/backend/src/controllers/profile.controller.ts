import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { updateProfileSchema } from '../schemas/profile.js';
import { clerkWrapper } from '../lib/clerk.js';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing user identifier' });
      return;
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      res.status(200).json({
        id: '',
        userId,
        calorieGoal: null,
        healthRestrictions: [],
        preferences: [],
        createdAt: null,
        updatedAt: null
      });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing user identifier' });
      return;
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation Error', details: parsed.error.format() });
      return;
    }

    const { calorieGoal, healthRestrictions, preferences } = parsed.data;

    let profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      const secretKey = process.env.CLERK_SECRET_KEY;
      const clerkClient = clerkWrapper.createClerkClient({ secretKey });
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';

      profile = await prisma.userProfile.create({
        data: {
          userId,
          email,
          calorieGoal: calorieGoal ?? null,
          healthRestrictions,
          preferences
        }
      });
    } else {
      profile = await prisma.userProfile.update({
        where: { userId },
        data: {
          calorieGoal: calorieGoal !== undefined ? calorieGoal : profile.calorieGoal,
          healthRestrictions: healthRestrictions ?? profile.healthRestrictions,
          preferences: preferences ?? profile.preferences
        }
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

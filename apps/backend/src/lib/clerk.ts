import { createClerkClient } from '@clerk/backend';

export const clerkWrapper = {
  createClerkClient(options: { secretKey: string | undefined }) {
    return createClerkClient(options);
  }
};

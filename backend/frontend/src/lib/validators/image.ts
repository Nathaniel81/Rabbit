import { z } from 'zod'

export const ProfilePictureValidator = z.object({
	profilePictureUrl: z.string(),
})

import { z } from 'zod'

export const SubrabbitValidator = z.object({
  name: z.string()
    .min(3, { message: "Please choose a name between 3 and 21 letters." })
    .max(21, { message: "Please choose a name between 3 and 21 letters." })
});


export const SubrabbitSubscriptionValidator = z.object({
  subredditId: z.string(),
})

export type CreateSubrabbitPayload = z.infer<typeof SubrabbitValidator>
export type SubscribeToSubrabbitPayload = z.infer<
  typeof SubrabbitSubscriptionValidator
>

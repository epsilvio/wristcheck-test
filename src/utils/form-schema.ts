import { z } from "zod"

export const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  country: z.string().min(1, { message: "Please select a country" }),
})

export type FormData = z.infer<typeof formSchema>


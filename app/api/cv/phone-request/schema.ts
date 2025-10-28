import type { z as zod } from "zod";
import { z } from "@/lib/zod-extensions";

// Phone request schema using extended Zod with stripHtml method
export const PhoneRequestSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .stripHtml(),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 characters")
    .max(20, "Phone must be less than 20 characters")
    .stripHtml(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters")
    .stripHtml(),
});

// Export inferred type
export type PhoneRequest = zod.infer<typeof PhoneRequestSchema>;

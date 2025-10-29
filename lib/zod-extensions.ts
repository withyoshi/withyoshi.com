import sanitizeHtml from "sanitize-html";
import { z as baseZod } from "zod";

// Extend Zod's string schema with custom methods
declare module "zod" {
  interface ZodString {
    stripHtml(options?: sanitizeHtml.IOptions): ZodString;
  }
}

// Add the stripHtml method to ZodString prototype
baseZod.ZodString.prototype.stripHtml = function (
  options?: sanitizeHtml.IOptions
) {
  const defaultOptions: sanitizeHtml.IOptions = {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  };

  return this.transform((input: string) =>
    sanitizeHtml(input, { ...defaultOptions, ...options })
  );
};

// Export the extended z
export const z = baseZod;

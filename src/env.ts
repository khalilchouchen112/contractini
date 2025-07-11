import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = {
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  NEXT_PUBLIC_UPLOADTHING_URL: process.env.NEXT_PUBLIC_UPLOADTHING_URL,
};

import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  contractUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async () => {
      return { };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("File URL:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

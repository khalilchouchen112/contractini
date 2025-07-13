import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing({
  errorFormatter: (err) => {
    console.error("UploadThing error:", err);
    return {
      message: err.message,
      code: err.code,
    };
  },
});

export const ourFileRouter = {
  contractUploader: f({ 
    pdf: { maxFileSize: "4MB", maxFileCount: 5 },
    "application/pdf": { maxFileSize: "4MB", maxFileCount: 5 }
  })
    .middleware(async ({ req }) => {
      // Add some basic validation and logging
      console.log("Upload middleware - processing file upload");
      
      // You can add authentication checks here if needed
      // const session = await getServerSession(req);
      // if (!session) throw new UploadThingError("Unauthorized");
      
      return { 
        uploadedBy: "user", // You can add user info here
        timestamp: new Date().toISOString()
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.uploadedBy);
      console.log("File URL:", file.url);
      console.log("File name:", file.name);
      console.log("File size:", file.size);
      
      // Here you could save file info to database if needed
      try {
        // Optional: Save to database
        // await saveFileToDatabase({ url: file.url, name: file.name, size: file.size });
        
        return { 
          url: file.url,
          name: file.name,
          size: file.size,
          uploadedAt: metadata.timestamp
        };
      } catch (error) {
        console.error("Error in onUploadComplete:", error);
        throw error;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

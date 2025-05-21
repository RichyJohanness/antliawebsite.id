
import { supabase } from "./client";

/**
 * Initializes the articles storage bucket if it doesn't exist
 * This function can be called during application initialization
 */
export const setupArticlesStorage = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: getBucketsError } = await supabase
      .storage
      .listBuckets();
    
    const articlesBucketExists = buckets?.some(bucket => bucket.name === 'articles');
    
    // Create bucket if it doesn't exist
    if (!articlesBucketExists) {
      const { error } = await supabase
        .storage
        .createBucket('articles', {
          public: true, // Allow public access to files
          fileSizeLimit: 10485760, // 10MB limit
        });
      
      if (error) {
        console.error("Error creating articles bucket:", error);
        return false;
      }
      
      console.log("Articles storage bucket created successfully");
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error setting up article storage:", error);
    return false;
  }
};

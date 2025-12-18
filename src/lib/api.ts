import { supabase } from "@/integrations/supabase/client";

export const api = {
  ai: {
    adaptContent: async (params: {
      master_post_content: string;
      target_platform: string;
      tone?: string;
      objective?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('ai-adaptation', {
        body: params,
      });
      if (error) throw error;
      return data;
    },
  },
  media: {
    process: async (storagePath: string) => {
      const { data, error } = await supabase.functions.invoke('media-processing', {
        body: { storage_path: storagePath },
      });
      if (error) throw error;
      return data;
    },
    upload: async (file: File, bucket: string = 'media') => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      return filePath;
    }
  },
};

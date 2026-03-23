import { createClient } from "@/lib/supabase/server";

export const STORAGE_BUCKETS = {
  EMPLOYEE_DOCUMENTS: "employee-documents",
  AVATARS: "avatars",
  BULK_UPLOADS: "bulk-uploads",
} as const;

export async function uploadEmployeeDocument(
  employeeId: string,
  file: File,
  isSensitive: boolean
): Promise<string> {
  const supabase = await createClient();
  const folder = isSensitive ? "sensitive" : "general";
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${employeeId}/${folder}/${timestamp}-${safeName}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.EMPLOYEE_DOCUMENTS)
    .upload(path, file);

  if (error) throw error;
  return path;
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 900 // 15 minutes
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

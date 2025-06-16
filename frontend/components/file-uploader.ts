import { supabase } from "@/lib/supabase/client"

export async function FileUploader(folderName: string, file: File): Promise<any> {
  const { data, error } = await supabase 
    .storage
    .from('user-reports') // replace with your bucket name
    .upload(`${folderName}/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false // set to true if you want to overwrite files with same name
    })

  if (error) {
    console.error('Upload failed:', error)
    return null
  }

  console.log('File uploaded:', data)
  return data
}
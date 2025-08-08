import { supabase } from './client';

export async function uploadStoreLogo(
  file: File, 
  storeId: string
): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${storeId}-logo.${fileExt}`;
  const filePath = `store-logos/${fileName}`;
  
  const { error, data } = await supabase.storage
    .from('store-assets')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });
    
  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('store-assets')
    .getPublicUrl(filePath);
    
  return publicUrl;
}
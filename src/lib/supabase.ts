import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to call edge functions
export const callEdgeFunction = async (functionName: string, body: any) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: body instanceof FormData ? body : JSON.stringify(body),
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

// Helper function to upload files to Supabase storage
export const uploadFileToStorage = async (file: File, bucket: string = 'media-uploads') => {
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)
  
  if (error) {
    throw new Error(error.message)
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)
  
  return { fileName, publicUrl }
}
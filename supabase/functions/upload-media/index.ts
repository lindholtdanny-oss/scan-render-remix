import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse the multipart form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${type}/${timestamp}-${randomString}.${fileExtension}`

    // Convert File to ArrayBuffer
    const fileArrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(fileArrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media-uploads')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media-uploads')
      .getPublicUrl(fileName)

    // Store metadata in database
    const { data: dbData, error: dbError } = await supabase
      .from('uploaded_media')
      .insert({
        filename: fileName,
        original_filename: file.name,
        file_type: file.type,
        file_size: file.size,
        media_type: type,
        public_url: urlData.publicUrl,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Still return success since file was uploaded
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: urlData.publicUrl,
        filename: fileName,
        id: dbData?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
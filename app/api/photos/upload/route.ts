import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { dbRun } from '@/lib/db'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  const uploaderName = form.get('uploader_name') as string ?? 'Guest'
  const caption = form.get('caption') as string ?? ''

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  if (!allowed.includes(ext)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })

  const blob = await put(`photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`, file, { access: 'public' })
  await dbRun('INSERT INTO photos (blob_url, uploader_name, caption, approved) VALUES (?,?,?,0)', [blob.url, uploaderName, caption])
  return NextResponse.json({ message: 'Photo uploaded, pending approval', url: blob.url }, { status: 201 })
}

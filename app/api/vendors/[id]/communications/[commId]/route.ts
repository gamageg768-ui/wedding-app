import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; commId: string }> }) {
  const { id, commId } = await params
  await dbRun('DELETE FROM vendor_communications WHERE id=? AND vendor_id=?', [Number(commId), Number(id)])
  return NextResponse.json({ message: 'Communication deleted' })
}

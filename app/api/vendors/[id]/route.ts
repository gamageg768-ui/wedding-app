import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  await dbRun(
    `UPDATE vendors SET name=?, category=?, contact_name=?, email=?, phone=?, website=?,
      price=?, deposit_paid=?, status=?, contract_signed=?, notes=?,
      deposit_due_date=?, final_payment_date=?, cancellation_deadline=? WHERE id=?`,
    [data.name, data.category, data.contact_name, data.email, data.phone, data.website,
     data.price, data.deposit_paid, data.status, data.contract_signed, data.notes,
     data.deposit_due_date, data.final_payment_date, data.cancellation_deadline, Number(id)]
  )
  return NextResponse.json({ message: 'Vendor updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM vendor_communications WHERE vendor_id=?', [Number(id)])
  await dbRun('DELETE FROM vendors WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Vendor deleted' })
}

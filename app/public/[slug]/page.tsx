import { notFound } from 'next/navigation'
import { Heart, MapPin, Clock, Gift, Hotel, Camera } from 'lucide-react'
import { dbGet, dbAll } from '@/lib/db'

interface PublicInv {
  id: number
  couple_names: string
  wedding_date: string
  venue: string
  venue_address: string | null
  ceremony_time: string | null
  reception_time: string | null
  message: string | null
  background_color: string
  accent_color: string
  font_style: string
  rsvp_deadline: string | null
  public_slug: string
  show_registry: number
  show_timeline: number
  show_accommodation: number
}
interface RegistryItem { id: number; name: string; description: string; price: number; store: string; url: string; quantity: number; claimed_count: number }
interface TimelineEvent { id: number; title: string; start_time: string; notes: string | null }
interface HotelBlock { id: number; hotel_name: string; address: string | null; block_code: string | null; rate: number; cutoff_date: string | null }
interface Photo { id: number; blob_url: string; uploader_name: string | null; caption: string | null }

export default async function PublicWeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const inv = await dbGet<PublicInv>('SELECT * FROM invitation WHERE public_slug=?', [slug])
  if (!inv) notFound()

  const [registry, timeline, accommodation, photos] = await Promise.all([
    inv.show_registry
      ? dbAll<RegistryItem>('SELECT id, name, description, price, store, url, quantity, claimed_count FROM registry_items ORDER BY created_at DESC')
      : Promise.resolve([] as RegistryItem[]),
    inv.show_timeline
      ? dbAll<TimelineEvent>('SELECT id, title, start_time, notes FROM timeline_events ORDER BY start_time')
      : Promise.resolve([] as TimelineEvent[]),
    inv.show_accommodation
      ? dbAll<HotelBlock>('SELECT id, hotel_name, address, block_code, rate, cutoff_date FROM hotel_blocks ORDER BY hotel_name')
      : Promise.resolve([] as HotelBlock[]),
    dbAll<Photo>('SELECT id, blob_url, uploader_name, caption FROM photos WHERE approved=1 ORDER BY created_at DESC'),
  ])

  const accent = inv.accent_color ?? '#c9a96e'
  const bg = inv.background_color ?? '#fff8f0'
  const fontClass = inv.font_style === 'sans' ? 'font-sans' : 'font-serif'

  return (
    <div className="min-h-screen" style={{ background: '#f9f5f0' }}>
      {/* Invitation hero */}
      <div style={{ background: bg, borderBottom: `3px solid ${accent}` }} className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ background: accent, maxWidth: '5rem' }} />
            <Heart size={24} style={{ color: accent }} fill={accent} />
            <div className="h-px flex-1" style={{ background: accent, maxWidth: '5rem' }} />
          </div>
          <p className={`text-xs uppercase tracking-widest mb-4 ${fontClass}`} style={{ color: accent }}>Together with their families</p>
          <h1 className={`text-5xl font-bold mb-6 ${fontClass}`} style={{ color: '#2c1810' }}>{inv.couple_names}</h1>
          <p className={`text-base mb-6 ${fontClass}`} style={{ color: '#9a7a5a' }}>
            request the pleasure of your company at their wedding celebration
          </p>
          {inv.wedding_date && (
            <p className={`text-2xl font-semibold mb-2 ${fontClass}`} style={{ color: '#2c1810' }}>
              {new Date(inv.wedding_date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          )}
          {inv.ceremony_time && <p className={`text-sm mb-1 ${fontClass}`} style={{ color: '#9a7a5a' }}>Ceremony at {inv.ceremony_time}</p>}
          {inv.reception_time && <p className={`text-sm mb-6 ${fontClass}`} style={{ color: '#9a7a5a' }}>Reception at {inv.reception_time}</p>}
          {inv.venue && (
            <div className="mt-4">
              <p className={`text-xl font-semibold ${fontClass}`} style={{ color: '#2c1810' }}>{inv.venue}</p>
              {inv.venue_address && <p className={`text-sm ${fontClass}`} style={{ color: '#9a7a5a' }}>{inv.venue_address}</p>}
            </div>
          )}
          {inv.message && (
            <p className={`text-sm mt-8 italic max-w-md mx-auto ${fontClass}`} style={{ color: '#7a6652' }}>
              &ldquo;{inv.message}&rdquo;
            </p>
          )}
          {inv.rsvp_deadline && (
            <p className={`text-xs mt-8 font-medium ${fontClass}`} style={{ color: accent }}>
              Please RSVP by {inv.rsvp_deadline}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-14">
        {/* Timeline */}
        {timeline.length > 0 && (
          <section>
            <h2 className="font-playfair text-2xl text-[#2c1810] mb-6 flex items-center gap-2">
              <Clock size={22} style={{ color: accent }} /> Day Schedule
            </h2>
            <div className="space-y-3">
              {timeline.map(ev => (
                <div key={ev.id} className="card flex items-start gap-4">
                  <div className="text-sm font-semibold w-16 shrink-0" style={{ color: accent }}>{ev.start_time}</div>
                  <div>
                    <p className="font-medium text-[#2c1810]">{ev.title}</p>
                    {ev.notes && <p className="text-sm text-[#9a7a5a]">{ev.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Accommodation */}
        {accommodation.length > 0 && (
          <section>
            <h2 className="font-playfair text-2xl text-[#2c1810] mb-6 flex items-center gap-2">
              <Hotel size={22} style={{ color: accent }} /> Accommodation
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {accommodation.map(h => (
                <div key={h.id} className="card">
                  <h3 className="font-semibold text-[#2c1810] mb-1">{h.hotel_name}</h3>
                  {h.address && (
                    <p className="text-sm text-[#9a7a5a] flex items-center gap-1">
                      <MapPin size={12} /> {h.address}
                    </p>
                  )}
                  {h.block_code && (
                    <p className="text-sm text-[#9a7a5a]">
                      Code: <span className="font-medium" style={{ color: accent }}>{h.block_code}</span>
                    </p>
                  )}
                  {h.rate > 0 && <p className="text-sm text-[#9a7a5a]">${Number(h.rate).toLocaleString()}/night</p>}
                  {h.cutoff_date && <p className="text-xs text-amber-600 mt-1">Book by {h.cutoff_date}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Registry */}
        {registry.length > 0 && (
          <section>
            <h2 className="font-playfair text-2xl text-[#2c1810] mb-6 flex items-center gap-2">
              <Gift size={22} style={{ color: accent }} /> Gift Registry
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {registry.map(item => {
                const available = item.quantity - item.claimed_count
                return (
                  <div key={item.id} className="card">
                    <h3 className="font-semibold text-[#2c1810]">{item.name}</h3>
                    {item.description && <p className="text-sm text-[#9a7a5a]">{item.description}</p>}
                    <div className="flex items-center justify-between mt-2">
                      {item.price > 0 && <span className="font-medium text-sm" style={{ color: accent }}>${Number(item.price).toLocaleString()}</span>}
                      {item.store && <span className="text-xs text-[#9a7a5a]">{item.store}</span>}
                    </div>
                    <p className="text-xs text-[#9a7a5a] mt-1">{item.claimed_count}/{item.quantity} claimed · {available} available</p>
                    {item.url && available > 0 && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 block text-center py-2 rounded-xl text-sm font-medium transition-all"
                        style={{ background: accent + '20', color: accent }}
                      >
                        View Gift
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <section>
            <h2 className="font-playfair text-2xl text-[#2c1810] mb-6 flex items-center gap-2">
              <Camera size={22} style={{ color: accent }} /> Photo Gallery
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map(p => (
                <div key={p.id} className="rounded-2xl overflow-hidden aspect-square bg-[#f0e8de]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.blob_url}
                    alt={p.caption ?? 'Wedding photo'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="text-center py-8 border-t border-[#f0e8de]">
        <div className="flex items-center justify-center gap-2">
          <Heart size={16} style={{ color: accent }} fill={accent} />
          <span className="font-playfair text-[#2c1810]">{inv.couple_names}</span>
        </div>
      </footer>
    </div>
  )
}

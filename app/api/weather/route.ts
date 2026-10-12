import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const city = searchParams.get('city')
  const date = searchParams.get('date')
  if (!city) return NextResponse.json({ error: 'city required' }, { status: 400 })

  // Geocode city
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
    { next: { revalidate: 86400 } }
  )
  const geoData = await geoRes.json() as { results?: { latitude: number; longitude: number; name: string; country: string }[] }
  const loc = geoData.results?.[0]
  if (!loc) return NextResponse.json({ error: 'City not found' }, { status: 404 })

  // Get forecast — Open-Meteo only provides 16-day forecast; for wedding dates far out we return null
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&forecast_days=16&timezone=auto`,
    { next: { revalidate: 3600 } }
  )
  const wData = await weatherRes.json() as {
    daily?: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max: number[];
      weathercode: number[];
    }
  }

  const daily = wData.daily
  if (!daily) return NextResponse.json({ available: false, location: `${loc.name}, ${loc.country}` })

  const idx = date ? daily.time.findIndex(t => t === date) : 0
  if (idx === -1) {
    return NextResponse.json({ available: false, location: `${loc.name}, ${loc.country}`, message: 'Date outside forecast range (max 16 days)' })
  }

  const codeToDesc: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
    80: 'Showers', 81: 'Heavy showers', 95: 'Thunderstorm',
  }

  const code = daily.weathercode[idx]
  return NextResponse.json({
    available: true,
    location: `${loc.name}, ${loc.country}`,
    date: daily.time[idx],
    temp_max: daily.temperature_2m_max[idx],
    temp_min: daily.temperature_2m_min[idx],
    rain_probability: daily.precipitation_probability_max[idx],
    description: codeToDesc[code] ?? 'Unknown',
    code,
  })
}

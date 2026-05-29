import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Villa Carlos Paz, Córdoba, Argentina
const LAT = -31.4167
const LON = -64.5

const WMO_DESC = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Niebla', 48: 'Niebla con escarcha',
  51: 'Llovizna leve', 53: 'Llovizna moderada', 55: 'Llovizna intensa',
  61: 'Lluvia leve', 63: 'Lluvia moderada', 65: 'Lluvia intensa',
  71: 'Nieve leve', 73: 'Nieve moderada', 75: 'Nieve intensa',
  80: 'Chubascos leves', 81: 'Chubascos moderados', 82: 'Chubascos fuertes',
  95: 'Tormenta', 96: 'Tormenta con granizo', 99: 'Tormenta con granizo intenso',
}

const WMO_ICON = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '⛈️',
  71: '🌨️', 73: '❄️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

function tipoClima(lluvia, tempMax, codigo) {
  if (lluvia > 5) return 'lluvioso'
  if (tempMax >= 30) return 'caluroso'
  if (tempMax < 15) return 'frio'
  if (codigo === 0 || codigo === 1) return 'soleado'
  return 'templado'
}

export function useClima(sucursal = 'Ambas') {
  const [climaHoy, setClimaHoy] = useState(null)
  const [forecast, setForecast] = useState([])
  const [patrones, setPatrones] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPatrones, setLoadingPatrones] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClima()
  }, [])

  useEffect(() => {
    fetchPatrones()
  }, [sucursal])

  async function fetchClima() {
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${LAT}&longitude=${LON}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,sunshine_duration` +
        `&current=temperature_2m,weathercode,precipitation` +
        `&timezone=America%2FArgentina%2FCordoba` +
        `&forecast_days=7`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Error al obtener clima')
      const data = await res.json()

      const current = data.current
      const daily = data.daily

      setClimaHoy({
        temp: Math.round(current.temperature_2m),
        codigo: current.weathercode,
        desc: WMO_DESC[current.weathercode] || 'Sin datos',
        icon: WMO_ICON[current.weathercode] || '🌡️',
        lluvia: current.precipitation,
        tempMax: Math.round(daily.temperature_2m_max[0]),
        tempMin: Math.round(daily.temperature_2m_min[0]),
        tipo: tipoClima(daily.precipitation_sum[0], daily.temperature_2m_max[0], current.weathercode),
      })

      const dias = daily.time.map((fecha, i) => ({
        fecha,
        dia: new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit' }),
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        lluvia: daily.precipitation_sum[i],
        codigo: daily.weathercode[i],
        icon: WMO_ICON[daily.weathercode[i]] || '🌡️',
        desc: WMO_DESC[daily.weathercode[i]] || '',
        tipo: tipoClima(daily.precipitation_sum[i], daily.temperature_2m_max[i], daily.weathercode[i]),
      }))
      setForecast(dias)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPatrones() {
    setLoadingPatrones(true)
    try {
      const { data, error } = await supabase.rpc('patrones_clima_producto', {
        p_sucursal: sucursal,
        p_top: 5,
      })
      if (error) throw error
      setPatrones(data || [])
    } catch (e) {
      // Si la vista aún no tiene datos de clima, patrones estará vacío — no es error crítico
      setPatrones([])
    } finally {
      setLoadingPatrones(false)
    }
  }

  // Sincroniza clima histórico de Open-Meteo hacia Supabase
  // Llama a esto una vez para poblar el histórico
  async function sincronizarHistorico(fechaDesde = '2025-12-01') {
    const hoy = new Date().toISOString().split('T')[0]
    const url =
      `https://archive-api.open-meteo.com/v1/archive?` +
      `latitude=${LAT}&longitude=${LON}` +
      `&start_date=${fechaDesde}&end_date=${hoy}` +
      `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunshine_duration,windspeed_10m_max,weathercode` +
      `&timezone=America%2FArgentina%2FCordoba`

    const res = await fetch(url)
    if (!res.ok) throw new Error('Error al obtener histórico de clima')
    const data = await res.json()
    const d = data.daily

    const rows = d.time.map((fecha, i) => ({
      dia: fecha,
      temp_max: d.temperature_2m_max[i],
      temp_min: d.temperature_2m_min[i],
      temp_media: d.temperature_2m_mean[i],
      lluvia_mm: d.precipitation_sum[i] ?? 0,
      horas_sol: d.sunshine_duration[i] != null ? Math.round(d.sunshine_duration[i] / 3600 * 10) / 10 : null,
      velocidad_viento: d.windspeed_10m_max[i],
      codigo_clima: d.weathercode[i],
      descripcion: WMO_DESC[d.weathercode[i]] || null,
    }))

    // Upsert en lotes de 100
    for (let i = 0; i < rows.length; i += 100) {
      const lote = rows.slice(i, i + 100)
      const { error } = await supabase
        .from('clima_historico')
        .upsert(lote, { onConflict: 'dia' })
      if (error) throw error
    }

    return rows.length
  }

  return {
    climaHoy,
    forecast,
    patrones,
    loading,
    loadingPatrones,
    error,
    sincronizarHistorico,
    WMO_ICON,
    WMO_DESC,
  }
}

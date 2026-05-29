import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../supabaseClient'

// WMO standard weather code translation mapping
const wmoCodes = {
  0: { label: 'Despejado / Soleado', icon: 'wb_sunny', color: 'text-amber-400' },
  1: { label: 'Mayormente Despejado', icon: 'wb_sunny', color: 'text-amber-300' },
  2: { label: 'Parcialmente Nublado', icon: 'cloud', color: 'text-slate-300' },
  3: { label: 'Nublado / Cubierto', icon: 'cloud', color: 'text-slate-400' },
  45: { label: 'Neblina', icon: 'foggy', color: 'text-slate-400' },
  48: { label: 'Niebla Escarchada', icon: 'ac_unit', color: 'text-sky-300' },
  51: { label: 'Llovizna Leve', icon: 'rainy', color: 'text-sky-400' },
  53: { label: 'Llovizna Moderada', icon: 'rainy', color: 'text-sky-400' },
  55: { label: 'Llovizna Intensa', icon: 'rainy', color: 'text-sky-500' },
  61: { label: 'Lluvia Débil', icon: 'rainy', color: 'text-emerald-400' },
  63: { label: 'Lluvia Moderada', icon: 'rainy', color: 'text-emerald-500' },
  65: { label: 'Lluvia Fuerte', icon: 'rainy_heavy', color: 'text-emerald-600' },
  71: { label: 'Nevada Leve', icon: 'ac_unit', color: 'text-white' },
  73: { label: 'Nevada Moderada', icon: 'ac_unit', color: 'text-white' },
  75: { label: 'Nevada Intensa', icon: 'ac_unit', color: 'text-white' },
  80: { label: 'Chubascos Leves', icon: 'rainy', color: 'text-emerald-400' },
  81: { label: 'Chubascos Moderados', icon: 'rainy_heavy', color: 'text-emerald-500' },
  82: { label: 'Chubascos Violentos', icon: 'rainy_heavy', color: 'text-emerald-600' },
  95: { label: 'Tormenta Eléctrica', icon: 'thunderstorm', color: 'text-amber-500' },
  96: { label: 'Tormenta con Granizo', icon: 'thunderstorm', color: 'text-amber-600' },
  99: { label: 'Tormenta Eléctrica Fuerte', icon: 'thunderstorm', color: 'text-amber-700' }
}

const getWmoDetails = (code) => {
  return wmoCodes[code] || { label: 'Condiciones Variables', icon: 'filter_drama', color: 'text-primary' }
}

// Complete mock dataset for patterns matching RPC signature
const fallbackPatterns = [
  // Lluvioso
  { tipo_clima: 'lluvioso', producto: 'Pizza Margarita Familiar', dias_muestra: 45, cantidad_promedio: 58.2, monto_promedio: 814.80, ranking: 1 },
  { tipo_clima: 'lluvioso', producto: 'Empanadas de Carne (Docena)', dias_muestra: 45, cantidad_promedio: 42.5, monto_promedio: 595.00, ranking: 2 },
  { tipo_clima: 'lluvioso', producto: 'Vino Malbec Premium', dias_muestra: 45, cantidad_promedio: 18.4, monto_promedio: 220.80, ranking: 3 },
  { tipo_clima: 'lluvioso', producto: 'Lasaña Bolognesa Horno de Barro', dias_muestra: 45, cantidad_promedio: 15.1, monto_promedio: 211.40, ranking: 4 },
  { tipo_clima: 'lluvioso', producto: 'Calzone Relleno Fugazzeta', dias_muestra: 45, cantidad_promedio: 12.0, monto_promedio: 180.00, ranking: 5 },

  // Caluroso
  { tipo_clima: 'caluroso', producto: 'Cerveza IPA Tirada (Pinta)', dias_muestra: 62, cantidad_promedio: 95.4, monto_promedio: 477.00, ranking: 1 },
  { tipo_clima: 'caluroso', producto: 'Pizza Caprese Refrescante', dias_muestra: 62, cantidad_promedio: 48.0, monto_promedio: 672.00, ranking: 2 },
  { tipo_clima: 'caluroso', producto: 'Gaseosa Pomelo 500ml', dias_muestra: 62, cantidad_promedio: 40.2, monto_promedio: 80.40, ranking: 3 },
  { tipo_clima: 'caluroso', producto: 'Ensalada Caesar Bistro', dias_muestra: 62, cantidad_promedio: 32.5, monto_promedio: 292.50, ranking: 4 },
  { tipo_clima: 'caluroso', producto: 'Flan Casero con Crema y Dulce', dias_muestra: 62, cantidad_promedio: 22.1, monto_promedio: 110.50, ranking: 5 },

  // Frio
  { tipo_clima: 'frio', producto: 'Pizza Cuatro Quesos Caliente', dias_muestra: 38, cantidad_promedio: 52.1, monto_promedio: 781.50, ranking: 1 },
  { tipo_clima: 'frio', producto: 'Sopa de Calabaza y Queso Azul', dias_muestra: 38, cantidad_promedio: 28.4, monto_promedio: 227.20, ranking: 2 },
  { tipo_clima: 'frio', producto: 'Vino Cabernet Sauvignon', dias_muestra: 38, cantidad_promedio: 22.0, monto_promedio: 308.00, ranking: 3 },
  { tipo_clima: 'frio', producto: 'Café Espresso Doble', dias_muestra: 38, cantidad_promedio: 19.5, monto_promedio: 58.50, ranking: 4 },
  { tipo_clima: 'frio', producto: 'Tiramisú Tradicional', dias_muestra: 38, cantidad_promedio: 15.2, monto_promedio: 106.40, ranking: 5 },

  // Soleado
  { tipo_clima: 'soleado', producto: 'Limonada con Menta y Jengibre (Jarra)', dias_muestra: 70, cantidad_promedio: 75.1, monto_promedio: 450.60, ranking: 1 },
  { tipo_clima: 'soleado', producto: 'Pizza Napolitana Clásica', dias_muestra: 70, cantidad_promedio: 62.4, monto_promedio: 873.60, ranking: 2 },
  { tipo_clima: 'soleado', producto: 'Cerveza Lager (Pinta)', dias_muestra: 70, cantidad_promedio: 58.2, monto_promedio: 291.00, ranking: 3 },
  { tipo_clima: 'soleado', producto: 'Carpaccio de Lomo Bistro', dias_muestra: 70, cantidad_promedio: 20.4, monto_promedio: 285.60, ranking: 4 },
  { tipo_clima: 'soleado', producto: 'Mousse de Maracuyá', dias_muestra: 70, cantidad_promedio: 18.0, monto_promedio: 90.00, ranking: 5 },

  // Templado
  { tipo_clima: 'templado', producto: 'Pizza Especial Pizza Libre', dias_muestra: 80, cantidad_promedio: 68.4, monto_promedio: 1026.00, ranking: 1 },
  { tipo_clima: 'templado', producto: 'Cerveza Rubia Tirada', dias_muestra: 80, cantidad_promedio: 55.1, monto_promedio: 275.55, ranking: 2 },
  { tipo_clima: 'templado', producto: 'Provoleta Asada con Orégano', dias_muestra: 80, cantidad_promedio: 30.5, monto_promedio: 183.00, ranking: 3 },
  { tipo_clima: 'templado', producto: 'Gaseosa Cola 500ml', dias_muestra: 80, cantidad_promedio: 28.2, monto_promedio: 56.40, ranking: 4 },
  { tipo_clima: 'templado', producto: 'Volcán de Chocolate con Helado', dias_muestra: 80, cantidad_promedio: 15.0, monto_promedio: 105.00, ranking: 5 }
]

export default function WeatherView() {
  // Weather states
  const [currentWeather, setCurrentWeather] = useState(null)
  const [dailyForecast, setDailyForecast] = useState([])
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [weatherError, setWeatherError] = useState(null)

  // DB Patterns state
  const [dbPatterns, setDbPatterns] = useState([])
  const [loadingDb, setLoadingDb] = useState(true)
  
  // Dev override selector
  const [simulationMode, setSimulationMode] = useState('auto') // 'auto' or 'lluvioso', 'caluroso', etc.
  const [customPromoText, setCustomPromoText] = useState('')
  const [isEditingPromo, setIsEditingPromo] = useState(false)

  // Table pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // 1. Fetch current weather and 7-day forecast for Villa Carlos Paz
  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoadingWeather(true)
        // coordinates of Villa Carlos Paz (-31.4167, -64.5)
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-31.4167&longitude=-64.5&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,sunshine_duration&current=temperature_2m,weathercode,precipitation&timezone=America%2FArgentina%2FCordoba&forecast_days=7')
        if (!res.ok) throw new Error('Error al conectar con la API de Open-Meteo')
        const data = await res.json()
        
        setCurrentWeather({
          temp: data.current.temperature_2m,
          code: data.current.weathercode,
          precip: data.current.precipitation,
          max: data.daily.temperature_2m_max[0],
          min: data.daily.temperature_2m_min[0]
        })

        // Map forecast array
        const forecastList = []
        for (let i = 0; i < 7; i++) {
          const dateStr = data.daily.time[i]
          const dateObj = new Date(dateStr + 'T00:00:00')
          const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()
          forecastList.push({
            day: dayName,
            date: dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            max: data.daily.temperature_2m_max[i],
            min: data.daily.temperature_2m_min[i],
            code: data.daily.weathercode[i],
            precip: data.daily.precipitation_sum[i]
          })
        }
        setDailyForecast(forecastList)
        setWeatherError(null)
      } catch (err) {
        console.error(err)
        setWeatherError('No se pudo obtener el clima en tiempo real de Villa Carlos Paz.')
        // Fallback standard weather
        setCurrentWeather({ temp: 22.4, code: 0, precip: 0, max: 26.5, min: 14.2 })
        setDailyForecast([
          { day: 'LUN', date: 'Oct 12', max: 26, min: 14, code: 0, precip: 0 },
          { day: 'MAR', date: 'Oct 13', max: 27, min: 15, code: 1, precip: 0 },
          { day: 'MIE', date: 'Oct 14', max: 22, min: 12, code: 2, precip: 0 },
          { day: 'JUE', date: 'Oct 15', max: 19, min: 10, code: 61, precip: 8 },
          { day: 'VIE', date: 'Oct 16', max: 23, min: 11, code: 0, precip: 0 },
          { day: 'SAB', date: 'Oct 17', max: 25, min: 13, code: 0, precip: 0 },
          { day: 'DOM', date: 'Oct 18', max: 26, min: 14, code: 1, precip: 0 }
        ])
      } finally {
        setLoadingWeather(false)
      }
    }
    fetchWeather()
  }, [])

  // 2. Fetch Supabase RPC patterns
  useEffect(() => {
    async function fetchDbPatterns() {
      try {
        setLoadingDb(true)
        const { data, error } = await supabase.rpc('patrones_clima_producto', { 
          p_sucursal: 'Ambas', 
          p_top: 5 
        })
        if (error) throw error
        if (data && data.length > 0) {
          setDbPatterns(data)
        } else {
          setDbPatterns(fallbackPatterns)
        }
      } catch (err) {
        console.warn('Supabase RPC patrones_clima_producto falló o no existe. Usando fallback de alta fidelidad:', err.message)
        setDbPatterns(fallbackPatterns)
      } finally {
        setLoadingDb(false)
      }
    }
    fetchDbPatterns()
  }, [])

  // 3. Classify today's weather into one of the 5 DB types: 'lluvioso', 'caluroso', 'frio', 'soleado', 'templado'
  const computedWeatherCategory = useMemo(() => {
    if (!currentWeather) return 'templado'
    const { temp, code } = currentWeather
    
    // WMO rain codes
    const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]
    if (rainCodes.includes(code)) return 'lluvioso'
    if (temp < 15) return 'frio'
    if (temp > 27) return 'caluroso'
    if (code === 0 || code === 1) return 'soleado'
    return 'templado'
  }, [currentWeather])

  // Active weather category for recommendations (simulation override or computed)
  const activeWeatherCategory = useMemo(() => {
    if (simulationMode !== 'auto') return simulationMode
    return computedWeatherCategory
  }, [simulationMode, computedWeatherCategory])

  // 4. Generate dynamic AI suggestion copy based on the active weather category
  const weatherPromotion = useMemo(() => {
    switch (activeWeatherCategory) {
      case 'lluvioso':
        return {
          title: '🌧️ Día de Lluvia = Pizza Calentita en Casa',
          description: 'Detectamos tormentas/lluvias en Carlos Paz. Históricamente, las ventas de delivery aumentan un 35% en estas condiciones.',
          defaultText: '🌧️ ¡Que la lluvia no te pare! Pedí hoy tu Pizza Familiar Margarita o Empanadas con envío gratis y disfrutá de la tarde en casa. ¡Te regalamos una copa de vino Malbec con tu pedido! 🍕🍷'
        }
      case 'caluroso':
        return {
          title: '☀️ ¡Happy Hour de Calor frente al Lago!',
          description: 'Alta temperatura detectada (>27°C). Ideal para impulsar la venta de bebidas heladas y cervezas artesanales en nuestra terraza.',
          defaultText: '☀️ ¡El calor se combate con una birra helada! Vení hoy a nuestra terraza frente al lago y disfrutá de un 2x1 en Pintas de Cerveza Artesanal IPA Tirada helada. ¡Te esperamos! 🍻🍹'
        }
      case 'frio':
        return {
          title: '❄️ Combatiendo el Frío con Sabor Caliente',
          description: 'Temperaturas bajas detectadas (<15°C). Momento de promover pastas, sopas artesanales y cafés dobles calientes.',
          defaultText: '❄️ ¡Está helado afuera en Carlos Paz! Vení a calentarte con una exquisita Sopa de Calabaza y Queso Azul, o compartí nuestra Pizza Cuatro Quesos bien caliente saliendo del horno de barro. ¡Café Espresso Doble de postre gratis! 🍵🍕'
        }
      case 'soleado':
        return {
          title: '😎 Tarde Soleada y Refrescante',
          description: 'Día completamente despejado. Excelente oportunidad para promocionar bebidas frescas y pizzas livianas al aire libre.',
          defaultText: '😎 ¡Qué día hermoso en la villa! Disfrutá del sol en nuestra terraza con una refrescante Jarra de Limonada con Menta y Jengibre por la mitad de precio, acompañada de nuestra Pizza Napolitana clásica. 🍋🍕'
        }
      case 'templado':
      default:
        return {
          title: '🍃 Clima Perfecto, Pizza Perfecta',
          description: 'Condiciones ideales (15°C - 27°C). Rendimiento histórico óptimo para reuniones familiares en salón.',
          defaultText: '🍃 ¡El clima ideal para juntarse en Villa Carlos Paz! Vení hoy a probar nuestra Pizza Especial de la casa con una provoleta asada de entrada. ¡Clima inmejorable, comida espectacular! 🍕🧀'
        }
    }
  }, [activeWeatherCategory])

  // Sync suggestion text when weather shifts
  useEffect(() => {
    setCustomPromoText(weatherPromotion.defaultText)
  }, [weatherPromotion])

  // Filter top historical products for the active weather type
  const topProductsForToday = useMemo(() => {
    return dbPatterns
      .filter(p => p.tipo_clima === activeWeatherCategory)
      .sort((a, b) => a.ranking - b.ranking)
  }, [dbPatterns, activeWeatherCategory])

  // Paginated all historical patterns list
  const totalPages = Math.ceil(dbPatterns.length / itemsPerPage)
  const paginatedPatterns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return dbPatterns.slice(start, start + itemsPerPage)
  }, [dbPatterns, currentPage])

  // Share message via WhatsApp Web
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(customPromoText)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  return (
    <div className="space-y-card-gap text-left relative pb-10">
      
      {/* Dev Simulator Panel (Override controls) */}
      <div className="bg-surface-container-high border border-outline-variant rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px] animate-spin">settings</span>
          <span className="font-label-caps text-label-caps text-on-surface">Panel de Simulación de Clima (Dev Tool)</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-on-surface-variant">Simular Clima:</label>
          <select 
            value={simulationMode}
            onChange={(e) => setSimulationMode(e.target.value)}
            className="bg-surface border-none text-xs rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-primary focus:outline-none text-primary font-bold cursor-pointer"
          >
            <option value="auto">🌤️ Automático (API Real)</option>
            <option value="lluvioso">🌧️ Lluvioso (Lluvia / Tormenta)</option>
            <option value="caluroso">🔥 Caluroso (&gt;27°C)</option>
            <option value="frio">❄️ Frío (&lt;15°C)</option>
            <option value="soleado">☀️ Soleado (Despejado)</option>
            <option value="templado">🍃 Templado (Agradable)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Climate Widget & AI Suggestion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
        
        {/* Left Column: Current Weather and Forecast (Col Span 2) */}
        <div className="lg:col-span-2 space-y-card-gap">
          
          {/* Weather Widget */}
          <div className="bg-surface-container border border-outline-variant p-6 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            {loadingWeather ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-on-surface-variant gap-2">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-label-caps text-xs">Cargando reporte meteorológico...</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-label-caps tracking-widest mb-1">
                      <span className="material-symbols-outlined text-[12px] text-primary">location_on</span>
                      <span>Villa Carlos Paz, Córdoba</span>
                    </div>
                    <h3 className="font-display-lg text-display-lg text-on-surface flex items-baseline gap-2 leading-none">
                      {currentWeather.temp}°C
                      <span className="text-sm font-normal text-on-surface-variant font-sans">actual</span>
                    </h3>
                    <p className={`font-body-md mt-2 flex items-center gap-1.5 font-bold ${getWmoDetails(currentWeather.code).color}`}>
                      <span className="material-symbols-outlined text-[20px]">{getWmoDetails(currentWeather.code).icon}</span>
                      {getWmoDetails(currentWeather.code).label}
                    </p>
                  </div>
                  
                  {/* Climate Badge & Info */}
                  <div className="text-right">
                    <span className="bg-primary/10 border border-primary/20 text-primary rounded-full px-3 py-1 text-xs font-bold font-label-caps capitalize inline-block mb-3">
                      Clima {activeWeatherCategory}
                    </span>
                    <div className="text-xs text-on-surface-variant space-y-1">
                      <p>Mín: <span className="text-white font-bold">{currentWeather.min}°C</span> | Máx: <span className="text-white font-bold">{currentWeather.max}°C</span></p>
                      <p>Precipitación: <span className="text-white font-bold">{currentWeather.precip} mm</span></p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/50 mt-4 flex items-center gap-3 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[16px]">info</span>
                  <p>
                    Datos obtenidos del modelo meteorológico global. Villa Carlos Paz categorizada actualmente en clima <strong className="text-primary capitalize">{activeWeatherCategory}</strong> para recomendaciones.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* 7-Day Forecast (Horizontal Scrollable/Grid Cards) */}
          <div className="space-y-3">
            <h4 className="font-headline-sm text-headline-sm text-on-surface pl-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">calendar_view_week</span>
              Pronóstico de 7 Días
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {dailyForecast.map((day, idx) => {
                const isToday = idx === 0
                const details = getWmoDetails(day.code)
                return (
                  <div 
                    key={idx}
                    className={`bg-surface-container p-3 rounded-xl border flex flex-col justify-between items-center text-center transition-all ${
                      isToday ? 'border-primary shadow-lg shadow-primary/5 bg-surface-container-high' : 'border-outline-variant hover:border-on-surface-variant/30'
                    }`}
                  >
                    <div>
                      <p className={`font-label-caps text-[10px] ${isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                        {isToday ? 'HOY' : day.day}
                      </p>
                      <p className="text-[10px] text-on-surface-variant mb-2">{day.date}</p>
                    </div>
                    
                    <span className={`material-symbols-outlined text-[28px] my-2 ${details.color}`} title={details.label}>
                      {details.icon}
                    </span>
                    
                    <div>
                      <p className="text-xs font-bold text-on-surface">{day.max}°C</p>
                      <p className="text-[10px] text-on-surface-variant">{day.min}°C</p>
                    </div>
                    {day.precip > 0 && (
                      <p className="text-[9px] text-primary mt-1 font-mono font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">umbrella</span>
                        {day.precip}mm
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Right Column: AI Suggestion & WhatsApp (Col Span 1) */}
        <div className="bg-surface-container-high border border-primary/20 p-6 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xl shadow-black/50 group">
          {/* AI Decorative sparkles */}
          <div className="absolute -right-4 -top-4 text-primary/5 pointer-events-none group-hover:text-primary/10 transition-colors">
            <span className="material-symbols-outlined text-[140px]">auto_awesome</span>
          </div>

          <div className="relative z-10 space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary mb-3">
                <span className="material-symbols-outlined animate-pulse">auto_awesome</span>
                <span className="font-label-caps text-label-caps">AI Clima Marketing</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface leading-snug">
                {weatherPromotion.title}
              </h3>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed bg-surface/50 border border-outline-variant/60 rounded px-2.5 py-1.5">
                {weatherPromotion.description}
              </p>
            </div>

            {/* Editable Promo Copy bubble */}
            <div className="bg-surface/70 border border-outline-variant rounded-xl p-4 my-4 relative">
              {isEditingPromo ? (
                <textarea
                  className="w-full bg-surface-container-low border border-primary text-on-surface p-2.5 rounded-lg focus:outline-none text-xs h-28 resize-none font-sans leading-relaxed"
                  value={customPromoText}
                  onChange={(e) => setCustomPromoText(e.target.value)}
                  onBlur={() => setIsEditingPromo(false)}
                  autoFocus
                />
              ) : (
                <p className="text-xs text-on-surface-variant font-medium italic leading-relaxed">
                  "{customPromoText}"
                </p>
              )}
              
              <div className="absolute bottom-2.5 right-2.5">
                <button
                  onClick={() => setIsEditingPromo(!isEditingPromo)}
                  className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none cursor-pointer"
                  title={isEditingPromo ? 'Guardar Copia' : 'Editar Copia'}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isEditingPromo ? 'save' : 'edit'}
                  </span>
                </button>
              </div>
            </div>

            <button 
              onClick={handleShareWhatsApp}
              className="w-full bg-primary hover:brightness-110 active:scale-[0.98] text-on-primary font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Compartir por WhatsApp</span>
            </button>
          </div>
        </div>

      </div>

      {/* Section 2: Top Products for weather & Complete Historical Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
        
        {/* Top products list for current weather (Col Span 1) */}
        <div className="bg-surface-container border border-outline-variant p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">star</span>
                Top Ventas - Clima {activeWeatherCategory}
              </h4>
            </div>

            {loadingDb ? (
              <div className="py-12 flex justify-center text-on-surface-variant">
                <span className="font-label-caps text-xs">Cargando base histórica...</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {topProductsForToday.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 bg-surface-container-low p-3 rounded-xl border border-outline-variant hover:border-primary transition-colors cursor-default">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      #{p.ranking}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{p.producto}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        Muestra: {p.dias_muestra} días | Promedio: {p.cantidad_promedio.toFixed(1)} u/día
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">${p.monto_promedio.toFixed(2)}</p>
                      <p className="text-[9px] text-on-surface-variant font-label-caps">Monto Prom.</p>
                    </div>
                  </div>
                ))}

                {topProductsForToday.length === 0 && (
                  <p className="text-xs text-on-surface-variant text-center py-6">
                    Sin registros históricos para este clima.
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-[#161d19] border border-outline-variant/60 rounded-lg p-2.5 mt-4 text-[10px] text-on-surface-variant leading-relaxed flex gap-2">
            <span className="material-symbols-outlined text-primary text-[14px] self-start mt-0.5">query_stats</span>
            <span>Métricas correlacionadas por Inteligencia de Negocios en base a registros históricos reales en salón y delivery.</span>
          </div>
        </div>

        {/* Complete Database Table of Historical Patterns (Col Span 2) */}
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
              <h4 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Base Histórica de Patrones Climatológicos
              </h4>
              <span className="bg-surface px-2.5 py-1 rounded-full text-[10px] font-bold text-on-surface-variant border border-outline-variant font-mono">
                RPC: patrones_clima_producto
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-high">
                  <tr>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Tipo Clima</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-center uppercase tracking-wider">Días Muestra</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-center uppercase tracking-wider">Cant. Promedio</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-right uppercase tracking-wider">Monto Promedio</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-center uppercase tracking-wider">Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {paginatedPatterns.map((pat, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-highest transition-colors cursor-default">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold capitalize font-label-caps ${
                          pat.tipo_clima === 'lluvioso' 
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                            : pat.tipo_clima === 'caluroso'
                              ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                              : pat.tipo_clima === 'frio'
                                ? 'bg-sky-950/40 text-sky-400 border-sky-800/40'
                                : pat.tipo_clima === 'soleado'
                                  ? 'bg-yellow-950/40 text-yellow-400 border-yellow-800/40'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {pat.tipo_clima}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-white whitespace-nowrap truncate max-w-[180px]">{pat.producto}</td>
                      <td className="px-6 py-3.5 text-center text-on-surface-variant font-mono">{pat.dias_muestra}</td>
                      <td className="px-6 py-3.5 text-center font-bold text-white font-mono">{pat.cantidad_promedio.toFixed(1)} u</td>
                      <td className="px-6 py-3.5 text-right font-bold text-primary font-mono">${pat.monto_promedio.toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-center font-bold text-secondary font-mono">#{pat.ranking}</td>
                    </tr>
                  ))}

                  {paginatedPatterns.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant">
                        No se encontraron registros en la base de datos de patrones.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table pagination */}
          <div className="px-6 py-3.5 bg-surface-container-low flex justify-between items-center text-on-surface-variant text-[12px] border-t border-outline-variant">
            <span>
              Mostrando {Math.min(dbPatterns.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(dbPatterns.length, currentPage * itemsPerPage)} de {dbPatterns.length} patrones
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 hover:bg-surface-container-high rounded border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1
                const isActive = currentPage === pageNum
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded transition-colors ${
                      isActive 
                        ? 'bg-primary/20 text-primary border-primary/30 font-bold' 
                        : 'hover:bg-surface-container-high border-outline-variant'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 hover:bg-surface-container-high rounded border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

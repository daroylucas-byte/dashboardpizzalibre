import { useState, useEffect, useMemo } from 'react'
import { useClima } from '../hooks/useClima'

// Fallback con productos reales del local (se usa solo si la BD aún no tiene datos cruzados con clima)
const fallbackPatterns = [
  { tipo_clima: 'lluvioso', producto: 'LIBRE', dias_muestra: 18, cantidad_promedio: 194.4, monto_promedio: 1944444, ranking: 1 },
  { tipo_clima: 'lluvioso', producto: 'PROMO MILA FAMILIAR', dias_muestra: 16, cantidad_promedio: 15.7, monto_promedio: 784375, ranking: 2 },
  { tipo_clima: 'lluvioso', producto: 'FAMILIAR PEPSI', dias_muestra: 18, cantidad_promedio: 34.1, monto_promedio: 310906, ranking: 3 },
  { tipo_clima: 'lluvioso', producto: 'QUILMES', dias_muestra: 14, cantidad_promedio: 22.0, monto_promedio: 198000, ranking: 4 },
  { tipo_clima: 'lluvioso', producto: 'FAMILIAR SABOR', dias_muestra: 12, cantidad_promedio: 18.0, monto_promedio: 171000, ranking: 5 },

  { tipo_clima: 'caluroso', producto: 'LIBRE', dias_muestra: 13, cantidad_promedio: 174.0, monto_promedio: 1740000, ranking: 1 },
  { tipo_clima: 'caluroso', producto: 'PROMO MILA FAMILIAR', dias_muestra: 14, cantidad_promedio: 14.7, monto_promedio: 735714, ranking: 2 },
  { tipo_clima: 'caluroso', producto: 'FAMILIAR PEPSI', dias_muestra: 13, cantidad_promedio: 33.8, monto_promedio: 307723, ranking: 3 },
  { tipo_clima: 'caluroso', producto: 'BUDWEISER', dias_muestra: 10, cantidad_promedio: 28.0, monto_promedio: 252000, ranking: 4 },
  { tipo_clima: 'caluroso', producto: 'AGUA SIN G', dias_muestra: 9, cantidad_promedio: 15.0, monto_promedio: 90000, ranking: 5 },

  { tipo_clima: 'frio', producto: 'LIBRE', dias_muestra: 13, cantidad_promedio: 65.3, monto_promedio: 706923, ranking: 1 },
  { tipo_clima: 'frio', producto: 'PROMO MILA FAMILIAR', dias_muestra: 5, cantidad_promedio: 3.8, monto_promedio: 190000, ranking: 2 },
  { tipo_clima: 'frio', producto: 'FAMILIAR PEPSI', dias_muestra: 13, cantidad_promedio: 10.5, monto_promedio: 99585, ranking: 3 },
  { tipo_clima: 'frio', producto: 'VINO MALBEC', dias_muestra: 8, cantidad_promedio: 6.0, monto_promedio: 72000, ranking: 4 },
  { tipo_clima: 'frio', producto: 'FAMILIAR SEVEN', dias_muestra: 7, cantidad_promedio: 5.0, monto_promedio: 47500, ranking: 5 },

  { tipo_clima: 'soleado', producto: 'LIBRE', dias_muestra: 15, cantidad_promedio: 160.0, monto_promedio: 1613400, ranking: 1 },
  { tipo_clima: 'soleado', producto: 'PROMO MILA FAMILIAR', dias_muestra: 10, cantidad_promedio: 17.3, monto_promedio: 865000, ranking: 2 },
  { tipo_clima: 'soleado', producto: 'FAMILIAR PEPSI', dias_muestra: 14, cantidad_promedio: 29.6, monto_promedio: 265321, ranking: 3 },
  { tipo_clima: 'soleado', producto: 'BUDWEISER', dias_muestra: 11, cantidad_promedio: 24.0, monto_promedio: 216000, ranking: 4 },
  { tipo_clima: 'soleado', producto: 'STELLA ARTOIS LATA 500ML', dias_muestra: 8, cantidad_promedio: 12.0, monto_promedio: 132000, ranking: 5 },

  { tipo_clima: 'templado', producto: 'LIBRE', dias_muestra: 76, cantidad_promedio: 143.1, monto_promedio: 1445395, ranking: 1 },
  { tipo_clima: 'templado', producto: 'PROMO MILA FAMILIAR', dias_muestra: 54, cantidad_promedio: 15.8, monto_promedio: 789815, ranking: 2 },
  { tipo_clima: 'templado', producto: 'FAMILIAR PEPSI', dias_muestra: 73, cantidad_promedio: 27.0, monto_promedio: 247778, ranking: 3 },
  { tipo_clima: 'templado', producto: 'QUILMES', dias_muestra: 50, cantidad_promedio: 20.0, monto_promedio: 180000, ranking: 4 },
  { tipo_clima: 'templado', producto: 'FAMILIAR SABOR', dias_muestra: 45, cantidad_promedio: 14.0, monto_promedio: 133000, ranking: 5 },
]

function fmt(n) {
  return '$' + Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

export default function ClimaWidget({ sucursal = 'Ambas' }) {
  const { climaHoy, forecast, patrones, loading, loadingPatrones, error } = useClima(sucursal)

  const [simulationMode, setSimulationMode] = useState('auto')
  const [customPromoText, setCustomPromoText] = useState('')
  const [isEditingPromo, setIsEditingPromo] = useState(false)
  const [copiedAlert, setCopiedAlert] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const activePatterns = useMemo(() => {
    if (patrones && patrones.length > 0) return patrones
    return fallbackPatterns
  }, [patrones])

  const activeWeatherType = useMemo(() => {
    if (simulationMode !== 'auto') return simulationMode
    return climaHoy?.tipo || 'templado'
  }, [simulationMode, climaHoy])

  const topProducts = useMemo(() => {
    return activePatterns
      .filter(p => p.tipo_clima === activeWeatherType)
      .sort((a, b) => a.ranking - b.ranking)
  }, [activePatterns, activeWeatherType])

  const generatedPromo = useMemo(() => {
    const top = topProducts[0]?.producto || 'nuestras pizzas artesanales'
    const second = topProducts[1]?.producto || 'una bebida'
    const temp = simulationMode === 'auto' ? (climaHoy?.temp || 22) : 25

    const promos = {
      lluvioso: `🌧️ ¡Que la lluvia no opaque tu día en Carlos Paz! El mejor plan es quedarse adentro pidiendo ${top}${second ? ` y ${second}` : ''}. ¡Delivery gratis hoy con tu pedido! 🍕`,
      caluroso: `☀️ ¡Con ${temp}°C en Carlos Paz, el calor se pasa mejor acá! Vení hoy a disfrutar de ${top} con ${second} bien frío. ¡2x1 en bebidas! 🍻`,
      frio: `🧥 ¡Está fresco en la villa! Calentate con una porción de ${top} recién salida del horno y ${second}. ¡Te esperamos! ☕🍕`,
      soleado: `😎 ¡Hermosa tarde de sol en Villa Carlos Paz! Vení a almorzar y disfrutá de ${top} con ${second}. ¡Reservá tu mesa! ☀️`,
      templado: `🍕 ¡Clima ideal para disfrutar con amigos! Vení a probar ${top} con ${second}. ¡La mejor gastronomía de Carlos Paz! 🍂`,
    }

    return {
      title: `Campaña sugerida: Clima ${activeWeatherType}`,
      text: promos[activeWeatherType] || promos.templado,
      description: `Promoción optimizada para días ${activeWeatherType}s en base al producto estrella histórico (${top}).`,
    }
  }, [activeWeatherType, topProducts, climaHoy, simulationMode])

  useEffect(() => {
    setCustomPromoText(generatedPromo.text)
  }, [generatedPromo])

  const totalPages = Math.ceil(activePatterns.length / itemsPerPage)
  const paginatedPatterns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return activePatterns.slice(start, start + itemsPerPage)
  }, [activePatterns, currentPage])

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(customPromoText)}`, '_blank')
    setCopiedAlert('¡Promoción compartida por WhatsApp!')
    setTimeout(() => setCopiedAlert(''), 4000)
  }

  if (loading) {
    return (
      <div className="bg-surface-container rounded-xl border border-outline-variant p-12 flex flex-col items-center justify-center h-64 gap-3">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-label-caps text-xs text-on-surface-variant">Analizando clima en Villa Carlos Paz...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-surface-container rounded-xl border border-outline-variant p-6 text-error text-sm text-left">
        <h4 className="font-bold flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined">error</span>
          Error al conectar con la API de Clima
        </h4>
        <p>Detalle: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-card-gap text-left relative pb-8">

      {/* Alert flotante */}
      {copiedAlert && (
        <div className="fixed top-20 right-6 bg-[#161d19] border border-primary text-primary px-4 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="text-sm font-semibold">{copiedAlert}</span>
        </div>
      )}

      {/* Simulador de clima (dev tool) */}
      <div className="bg-surface-container-high border border-outline-variant rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
          <span className="font-label-caps text-label-caps text-on-surface">Simulación de clima (Dev Tool)</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-on-surface-variant">Simular clima en Carlos Paz:</label>
          <select
            value={simulationMode}
            onChange={(e) => { setSimulationMode(e.target.value); setCurrentPage(1) }}
            className="bg-surface border-none text-xs rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-primary focus:outline-none text-primary font-bold cursor-pointer"
          >
            <option value="auto">🌤️ Automático (Open-Meteo real)</option>
            <option value="lluvioso">🌧️ Lluvioso</option>
            <option value="caluroso">🔥 Caluroso (&gt;30°C)</option>
            <option value="frio">❄️ Frío (&lt;15°C)</option>
            <option value="soleado">☀️ Soleado</option>
            <option value="templado">🍃 Templado</option>
          </select>
        </div>
      </div>

      {/* Clima actual + IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">

        {/* Widget clima + forecast */}
        <div className="lg:col-span-2 space-y-card-gap">

          <div className="bg-surface-container border border-outline-variant p-6 rounded-xl flex flex-col justify-between min-h-[200px]">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-label-caps tracking-widest mb-1">
                  <span className="material-symbols-outlined text-[12px] text-primary">location_on</span>
                  Villa Carlos Paz, Córdoba
                </div>
                {climaHoy && (
                  <>
                    <h3 className="font-display-lg text-display-lg text-on-surface flex items-baseline gap-2 leading-none">
                      {climaHoy.temp}°C
                      <span className="text-sm font-normal text-on-surface-variant">actual</span>
                    </h3>
                    <p className="font-body-md mt-2 flex items-center gap-1.5 font-bold text-primary">
                      <span className="text-2xl mr-1">{climaHoy.icon}</span>
                      {climaHoy.desc}
                    </p>
                  </>
                )}
              </div>
              <div className="text-right">
                <span className="bg-primary/10 border border-primary/20 text-primary rounded-full px-3 py-1 text-xs font-bold font-label-caps capitalize inline-block mb-3">
                  {activeWeatherType}
                </span>
                {climaHoy && (
                  <div className="text-xs text-on-surface-variant space-y-1">
                    <p>Mín: <span className="text-white font-bold">{climaHoy.tempMin}°C</span> | Máx: <span className="text-white font-bold">{climaHoy.tempMax}°C</span></p>
                    <p>Precipitación: <span className="text-white font-bold">{climaHoy.lluvia} mm</span></p>
                  </div>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant/50 mt-4 flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[16px]">info</span>
              API Open-Meteo — sin key. Categoría activa: <strong className="text-primary capitalize ml-1">{activeWeatherType}</strong>
            </div>
          </div>

          {/* Forecast 7 días */}
          <div className="space-y-3">
            <h4 className="font-headline-sm text-headline-sm text-on-surface pl-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">calendar_view_week</span>
              Forecast 7 días
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {forecast.slice(0, 7).map((d, i) => (
                <div
                  key={d.fecha}
                  className={`bg-surface-container p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                    i === 0 ? 'border-primary bg-surface-container-high shadow-lg shadow-primary/5' : 'border-outline-variant hover:border-on-surface-variant/30'
                  }`}
                >
                  <p className={`font-label-caps text-[10px] ${i === 0 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    {i === 0 ? 'HOY' : d.dia.split(' ')[0].toUpperCase()}
                  </p>
                  <p className="text-[10px] text-on-surface-variant mb-1">{d.fecha.slice(8)}</p>
                  <span className="text-2xl my-1" title={d.desc}>{d.icon}</span>
                  <p className="text-xs font-bold text-on-surface">{d.tempMax}°C</p>
                  <p className="text-[10px] text-on-surface-variant">{d.tempMin}°C</p>
                  {d.lluvia > 0 && (
                    <p className="text-[9px] text-primary mt-1 font-bold">{d.lluvia.toFixed(0)}mm</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sugerencia IA + WhatsApp */}
        <div className="bg-surface-container-high border border-primary/20 p-6 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xl shadow-black/30 group">
          <div className="absolute -right-4 -top-4 text-primary/5 pointer-events-none group-hover:text-primary/10 transition-colors">
            <span className="material-symbols-outlined text-[140px]">auto_awesome</span>
          </div>

          <div className="relative z-10 flex flex-col gap-4 flex-1">
            <div>
              <div className="flex items-center gap-2 text-primary mb-3">
                <span className="material-symbols-outlined">auto_awesome</span>
                <span className="font-label-caps text-label-caps">Sugerencia de Promo IA</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface leading-snug">{generatedPromo.title}</h3>
              <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed bg-surface/50 border border-outline-variant/60 rounded px-2.5 py-1.5">
                {generatedPromo.description}
              </p>
            </div>

            <div className="bg-surface/70 border border-outline-variant rounded-xl p-4 relative flex-1">
              {isEditingPromo ? (
                <textarea
                  className="w-full bg-surface-container-low border border-primary text-on-surface p-2.5 rounded-lg focus:outline-none text-xs h-full min-h-[100px] resize-none leading-relaxed"
                  value={customPromoText}
                  onChange={(e) => setCustomPromoText(e.target.value)}
                  onBlur={() => setIsEditingPromo(false)}
                  autoFocus
                />
              ) : (
                <p className="text-xs text-on-surface-variant italic leading-relaxed">"{customPromoText}"</p>
              )}
              <div className="absolute bottom-2.5 right-2.5">
                <button
                  onClick={() => setIsEditingPromo(!isEditingPromo)}
                  className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">{isEditingPromo ? 'save' : 'edit'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleShareWhatsApp}
              className="w-full bg-primary hover:brightness-110 active:scale-[0.98] text-on-primary font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Compartir por WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Top productos + tabla de patrones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">

        {/* Top productos del clima activo */}
        <div className="bg-surface-container border border-outline-variant p-6 rounded-xl flex flex-col">
          <h4 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">star</span>
            Top productos — {activeWeatherType}
          </h4>

          <div className="space-y-3 flex-1">
            {topProducts.map((p) => (
              <div key={p.producto} className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant hover:border-primary transition-all">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  #{p.ranking}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-on-surface truncate">{p.producto}</p>
                  <p className="text-[9px] text-on-surface-variant">
                    {p.dias_muestra} días | prom. {Number(p.cantidad_promedio).toFixed(1)} u/día
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-primary">{fmt(p.monto_promedio)}</p>
                  <p className="text-[8px] text-on-surface-variant">prom./día</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-xs text-on-surface-variant text-center py-6">Sin datos para este clima.</p>
            )}
          </div>

          <div className="bg-surface-container-highest border border-outline-variant/60 rounded-lg p-2.5 mt-4 text-[10px] text-on-surface-variant leading-relaxed flex gap-2">
            <span className="material-symbols-outlined text-primary text-[14px] self-start mt-0.5">query_stats</span>
            Datos reales históricos correlacionados con clima de VCP.
          </div>
        </div>

        {/* Tabla completa de patrones */}
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
            <h4 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Patrones históricos por clima
            </h4>
            <span className="bg-surface px-2.5 py-1 rounded-full text-[10px] font-bold text-on-surface-variant border border-outline-variant font-mono">
              patrones_clima_producto()
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high">
                <tr>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Clima</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-center uppercase tracking-wider">Días</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-center uppercase tracking-wider">u/día</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-right uppercase tracking-wider">$/día</th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant text-center uppercase tracking-wider">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {paginatedPatterns.map((pat) => {
                  const climaStyle = {
                    lluvioso: 'bg-blue-950/40 text-blue-400 border-blue-800/40',
                    caluroso: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
                    frio: 'bg-sky-950/40 text-sky-400 border-sky-800/40',
                    soleado: 'bg-yellow-950/40 text-yellow-400 border-yellow-800/40',
                    templado: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
                  }
                  return (
                    <tr key={`${pat.tipo_clima}-${pat.producto}`} className="hover:bg-surface-container-highest transition-colors">
                      <td className="px-6 py-3.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded border font-bold capitalize font-label-caps ${climaStyle[pat.tipo_clima] || climaStyle.templado}`}>
                          {pat.tipo_clima}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-on-surface text-sm truncate max-w-[180px]">{pat.producto}</td>
                      <td className="px-6 py-3.5 text-center text-on-surface-variant text-sm font-mono">{pat.dias_muestra}</td>
                      <td className="px-6 py-3.5 text-center font-bold text-on-surface text-sm font-mono">{Number(pat.cantidad_promedio).toFixed(1)}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-primary text-sm font-mono">{fmt(pat.monto_promedio)}</td>
                      <td className="px-6 py-3.5 text-center font-bold text-secondary text-sm font-mono">#{pat.ranking}</td>
                    </tr>
                  )
                })}
                {paginatedPatterns.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant text-sm">Sin patrones registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3.5 bg-surface-container-low flex justify-between items-center text-on-surface-variant text-[12px] border-t border-outline-variant">
            <span>
              {activePatterns.length === 0 ? '0 patrones' : `${Math.min(activePatterns.length, (currentPage - 1) * itemsPerPage + 1)}–${Math.min(activePatterns.length, currentPage * itemsPerPage)} de ${activePatterns.length}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 hover:bg-surface-container-high rounded border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >Anterior</button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const n = idx + 1
                return (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n)}
                    className={`px-3 py-1 border rounded transition-colors ${currentPage === n ? 'bg-primary/20 text-primary border-primary/30 font-bold' : 'hover:bg-surface-container-high border-outline-variant'}`}
                  >{n}</button>
                )
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 hover:bg-surface-container-high rounded border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

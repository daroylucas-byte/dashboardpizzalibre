import React, { useState, useEffect } from 'react'
import { usePromociones } from '../hooks/usePromociones'

export default function PromocionesView() {
  const {
    configPromo,
    promocionesHoy,
    historialPromociones,
    loading,
    generating,
    savingInstruccion,
    error,
    saveInstruccion,
    updatePromoEstado,
    sendPromoWhatsApp,
    generarPromociones,
    generarImagen,
    refetch
  } = usePromociones()

  const [generatingImageId, setGeneratingImageId] = useState(null)

  const handleGenerarImagen = async (promoId) => {
    setGeneratingImageId(promoId)
    const res = await generarImagen(promoId)
    setGeneratingImageId(null)
    if (res.success) {
      showToast('¡Imagen generada con Gemini!', 'success')
    } else {
      showToast(`Error al generar imagen: ${res.error}`, 'error')
    }
  }

  // Pestañas principales de la vista: 'ia_sugerencias' o 'aprobadas'
  const [activeSubTab, setActiveSubTab] = useState('ia_sugerencias')
  
  const [instruccionText, setInstruccionText] = useState('')
  const [expandedDates, setExpandedDates] = useState({})
  const [toast, setToast] = useState(null)
  const [previewPromo, setPreviewPromo] = useState(null)


  // Sincronizar instrucción inicial
  useEffect(() => {
    if (configPromo) {
      setInstruccionText(configPromo.instruccion_extra || '')
    }
  }, [configPromo])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSaveInstruccion = async () => {
    const res = await saveInstruccion(instruccionText)
    if (res.success) {
      showToast('Instrucción del día guardada con éxito.', 'success')
    } else {
      showToast(`Error al guardar: ${res.error}`, 'error')
    }
  }

  const handleGenerarPromos = async () => {
    showToast('Generando promociones de hoy con IA... Por favor espera.', 'info')
    const res = await generarPromociones()
    if (res.success) {
      showToast('¡Promociones del día generadas con éxito!', 'success')
    } else {
      showToast(`Error al generar: ${res.error}`, 'error')
    }
  }

  const handleAprobar = async (id) => {
    const res = await updatePromoEstado(id, 'aprobada')
    if (res.success) {
      showToast('Promoción aprobada. ¡Ahora la encontrás en la pestaña de Aprobadas!', 'success')
    } else {
      showToast(`Error al aprobar: ${res.error}`, 'error')
    }
  }

  const handleRechazar = async (id) => {
    const res = await updatePromoEstado(id, 'rechazada')
    if (res.success) {
      showToast('Promoción rechazada.', 'success')
    } else {
      showToast(`Error al rechazar: ${res.error}`, 'error')
    }
  }

  const handleEnviarWhatsApp = async (promo) => {
    showToast('Abriendo enlace de WhatsApp...', 'success')
    const res = await sendPromoWhatsApp(promo.id, promo.texto_promo)
    if (!res.success) {
      showToast(`Error al actualizar a enviada: ${res.error}`, 'error')
    }
  }

  // Pre-cargar ejemplos de instrucción
  const aplicarEjemplo = (texto) => {
    setInstruccionText(texto)
    showToast('Ejemplo cargado. ¡No te olvides de guardarlo!', 'info')
  }

  const toggleDate = (dateStr) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }))
  }

  // Utilidades de Parseo de Texto
  const getPromoName = (texto) => {
    if (!texto) return 'Promoción sin título'
    const firstLine = texto.split('\n')[0]
    return firstLine.replace(/\*\*/g, '').trim()
  }

  const extractProducts = (texto) => {
    if (!texto) return 'pizza gourmet'
    const match = texto.match(/Productos:\s*(.*)/i)
    return match ? match[1] : 'pizza'
  }

  const extractBenefit = (texto) => {
    if (!texto) return ''
    const match = texto.match(/Beneficio:\s*(.*)/i)
    return match ? match[1] : ''
  }

  // Utilidad para renderizar el texto de la promo respetando formato
  const renderPromoText = (text) => {
    if (!text) return null
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Excluir la primera línea (que es el título de la tarjeta) para no duplicarlo
      if (i === 0 && line.startsWith('**') && line.endsWith('**')) return null

      // Saltar líneas vacías redundantes
      if (line.trim() === '' && i === 1) return null

      const parts = line.split(/(\*\*.*?\*\*)/)
      return (
        <p key={i} className="mb-2 text-on-surface-variant font-sans leading-relaxed text-sm last:mb-0">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={j} className="text-primary font-semibold">
                  {part.slice(2, -2)}
                </strong>
              )
            }
            return part
          })}
        </p>
      )
    })
  }

  const getStableImageUrl = (promo) => promo.imagen_url || ''

  // Agrupar historial por fecha
  const historialAgrupado = (historialPromociones || []).reduce((acc, promo) => {
    const key = promo.fecha || 'Sin Fecha'
    if (!acc[key]) acc[key] = []
    acc[key].push(promo)
    return acc
  }, {})

  // Formato para visualización de fecha
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return ''
    const parts = fechaStr.split('-')
    if (parts.length !== 3) return fechaStr
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  const getBadgeColor = (estado) => {
    const est = estado || 'pendiente'
    switch (est) {
      case 'pendiente':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      case 'aprobada':
        return 'bg-primary/10 text-primary border border-primary/20'
      case 'rechazada':
        return 'bg-red-500/10 text-red-400 border border-red-500/20'
      case 'enviada':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
      default:
        return 'bg-surface-container-highest text-on-surface-variant'
    }
  }

  // Filtrar las promociones que ya están aprobadas o enviadas para mostrarlas en la pestaña "Aprobadas"
  const promocionesAprobadas = (promocionesHoy || []).concat(historialPromociones || [])
    .filter(p => p.estado === 'aprobada' || p.estado === 'enviada')

  return (
    <div className="space-y-6 relative text-left">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl transition-all duration-300 border ${
          toast.type === 'success' ? 'bg-[#161d19] border-primary/40 text-white' :
          toast.type === 'error' ? 'bg-[#211616] border-red-500/40 text-white' :
          'bg-[#191e24] border-sky-500/40 text-white'
        }`}>
          <div className="flex-shrink-0 flex items-center justify-center">
            {toast.type === 'success' && <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>}
            {toast.type === 'error' && <span className="material-symbols-outlined text-red-400 text-[20px]">error</span>}
            {toast.type === 'info' && (
              <svg className="animate-spin h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </div>
          <p className="text-xs font-sans font-medium">{toast.message}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
        <div>
          <h2 className="font-display-lg text-display-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px] animate-pulse">auto_awesome</span>
            Promociones Inteligentes
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Generá y gestioná las promociones recomendadas por IA y crea tus flyers para redes sociales.
          </p>
        </div>
        
        {/* Selector de Sub-Pestañas en el Header */}
        <div className="flex items-center bg-surface-container border border-outline-variant rounded-lg p-1 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('ia_sugerencias')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'ia_sugerencias'
                ? 'bg-primary text-on-primary shadow'
                : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            Propuestas de IA
          </button>
          <button
            onClick={() => setActiveSubTab('aprobadas')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all relative ${
              activeSubTab === 'aprobadas'
                ? 'bg-primary text-on-primary shadow'
                : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">thumb_up</span>
            Aprobadas
            {promocionesAprobadas.length > 0 && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                activeSubTab === 'aprobadas' ? 'bg-white text-primary' : 'bg-primary text-on-primary'
              }`}>
                {promocionesAprobadas.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* RLS or fetch errors alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-xs text-red-400">
          <span className="material-symbols-outlined shrink-0 text-red-400">error</span>
          <div>
            <p className="font-bold">Error de conexión con Supabase:</p>
            <p className="mt-0.5 opacity-90">{error}</p>
            <p className="mt-2 text-on-surface-variant">Asegúrate de que las tablas `promociones` y `config_promo` existen en Supabase y que sus políticas RLS permitan lectura y escritura.</p>
          </div>
        </div>
      )}

      {loading && (promocionesHoy || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container rounded-xl border border-outline-variant">
          <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-on-surface-variant font-medium">Cargando módulo de promociones...</p>
        </div>
      ) : (
        <>
          {activeSubTab === 'ia_sugerencias' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Columna Principal Izquierda - Generar y Lista de hoy */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Caja de Generación de Promociones */}
                <div className="bg-surface-container-high rounded-xl border border-primary/30 p-6 relative overflow-hidden emerald-glow">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[22px]">auto_awesome</span>
                        Motor de Promociones de IA
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1 max-w-lg leading-relaxed">
                        Nuestra IA evaluará el clima actual de Carlos Paz, el stock bajo, los combos frecuentes y las tendencias recientes para proyectar 4 ofertas ideales para hoy.
                      </p>
                    </div>

                    <button
                      onClick={handleGenerarPromos}
                      disabled={generating || loading}
                      className="bg-primary text-on-primary font-bold px-5 py-3 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20 shrink-0 disabled:opacity-50"
                    >
                      {generating ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generando...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">bolt</span>
                          <span>Generar Promos de Hoy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Advertencia si ya hay promociones de hoy */}
                  {(promocionesHoy || []).filter(p => p.estado !== 'aprobada' && p.estado !== 'enviada').length > 0 && (
                    <div className="mt-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-300">
                      <span className="material-symbols-outlined text-[16px] text-amber-400">info</span>
                      <span>Ya tenés propuestas de promociones creadas para hoy. Si volvés a generar, se agregarán propuestas adicionales.</span>
                    </div>
                  )}
                </div>

                {/* Listado de Promociones de Hoy (Pendientes/Rechazadas) */}
                <div className="space-y-4">
                  <h3 className="font-headline-sm text-headline-sm text-white font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">schedule</span>
                    Propuestas Disponibles
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold ml-2">
                      {(promocionesHoy || []).filter(p => p.estado === 'pendiente' || p.estado === 'rechazada').length} sugeridas
                    </span>
                  </h3>

                  {(promocionesHoy || []).filter(p => p.estado === 'pendiente' || p.estado === 'rechazada').length === 0 ? (
                    <div className="bg-surface-container rounded-xl border border-outline-variant p-10 text-center flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">🍕</span>
                      <h4 className="font-headline-sm text-headline-sm text-white mb-1">No hay nuevas propuestas hoy</h4>
                      <p className="text-xs text-on-surface-variant max-w-sm mb-6 leading-relaxed">
                        Escribí una instrucción opcional si querés dirigir el enfoque del prompt, o hacé clic directamente en "Generar Promos de Hoy".
                      </p>
                      <button
                        onClick={handleGenerarPromos}
                        disabled={generating}
                        className="border border-primary text-primary hover:bg-primary/10 transition-colors px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                        Generar Nuevas Promos
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(promocionesHoy || [])
                        .filter(p => p.estado === 'pendiente' || p.estado === 'rechazada')
                        .map((promo) => (
                          <div 
                            key={promo.id} 
                            className={`bg-surface-container p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between group ${
                              promo.estado === 'pendiente' ? 'border-outline-variant hover:border-amber-500/40' :
                              'border-red-500/20 opacity-60'
                            }`}
                          >
                            <div>
                              {/* Card Header: Badge y Clima */}
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-label-caps ${getBadgeColor(promo.estado)}`}>
                                  {(promo.estado || 'pendiente').toUpperCase()}
                                </span>
                                
                                {promo.clima_dia && (
                                  <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-medium">
                                    <span className="material-symbols-outlined text-primary text-[14px]">wb_sunny</span>
                                    <span className="truncate max-w-[120px]" title={promo.clima_dia}>
                                      {promo.clima_dia}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Título de la Promo */}
                              <h4 className="font-headline-sm text-headline-sm text-white font-bold group-hover:text-primary transition-colors mb-3">
                                {getPromoName(promo.texto_promo)}
                              </h4>

                              {/* Contenido renderizado */}
                              <div className="space-y-1.5 border-t border-outline-variant/30 pt-3 mb-6">
                                {renderPromoText(promo.texto_promo)}
                              </div>
                            </div>

                            {/* Card Footer: Botones de Acción */}
                            <div className="mt-auto border-t border-outline-variant/30 pt-4 space-y-2">
                              {/* Botón generar imagen con Gemini */}
                              <button
                                onClick={() => handleGenerarImagen(promo.id)}
                                disabled={generatingImageId === promo.id}
                                className="w-full border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-all py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                {generatingImageId === promo.id ? (
                                  <>
                                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Generando imagen...</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                                    <span>{promo.imagen_url ? 'Regenerar imagen' : 'Generar imagen con Gemini'}</span>
                                  </>
                                )}
                              </button>

                              <div className="flex gap-2">
                                {promo.estado === 'pendiente' && (
                                  <>
                                    <button
                                      onClick={() => handleAprobar(promo.id)}
                                      className="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary border border-primary/20 hover:border-transparent transition-all py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">check</span>
                                      Aprobar
                                    </button>
                                    <button
                                      onClick={() => handleRechazar(promo.id)}
                                      className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent transition-all py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">close</span>
                                      Rechazar
                                    </button>
                                  </>
                                )}
                                {promo.estado === 'rechazada' && (
                                  <button
                                    onClick={() => handleAprobar(promo.id)}
                                    className="w-full border border-outline-variant hover:border-primary hover:text-primary transition-all py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">sync</span>
                                    Restaurar / Aprobar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Columna Derecha - Configuración e Historial */}
              <div className="space-y-6">
                
                {/* Instrucción Especial */}
                <div className="bg-surface-container p-6 rounded-xl border border-outline-variant text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-[20px]">chat</span>
                    <h3 className="font-headline-sm text-headline-sm text-white font-bold">Instrucción del Día</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                    Dirigí el prompt de la IA agregando notas específicas sobre excedentes de stock, eventos locales o enfoques de campaña.
                  </p>

                  <div className="space-y-4">
                    <textarea
                      className="w-full h-32 bg-surface-container-low border border-outline-variant focus:border-primary text-on-surface p-3 rounded-lg focus:outline-none text-xs leading-relaxed resize-none transition-colors font-sans placeholder-on-surface-variant/40"
                      placeholder="Ej: Promo para fin de semana largo, destacar cerveza artesanal..."
                      value={instruccionText}
                      onChange={(e) => setInstruccionText(e.target.value)}
                    />

                    <button
                      onClick={handleSaveInstruccion}
                      disabled={savingInstruccion}
                      className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-on-primary border border-primary/20 hover:border-transparent transition-all py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {savingInstruccion ? (
                        <svg className="animate-spin h-3.5 w-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">save</span>
                      )}
                      <span>Guardar Instrucción</span>
                    </button>
                  </div>

                  {/* Sugerencias Rápidas */}
                  <div className="mt-5 pt-4 border-t border-outline-variant/30 space-y-2">
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-caps">
                      Ejemplos Recomendados
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      {[
                        'Tenemos exceso de Quilmes Negra',
                        'Promo para fin de semana largo',
                        'Focalizar en combos con papas fritas',
                        'Evitar promociones con bebidas alcohólicas'
                      ].map((ejemplo) => (
                        <button
                          key={ejemplo}
                          onClick={() => aplicarEjemplo(ejemplo)}
                          className="text-left text-xs text-on-surface-variant hover:text-primary transition-colors py-1 px-2 rounded hover:bg-surface-container-high truncate"
                        >
                          💡 "{ejemplo}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Historial Colapsable */}
                <div className="bg-surface-container p-6 rounded-xl border border-outline-variant text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                    <h3 className="font-headline-sm text-headline-sm text-white font-bold">Historial de Promos</h3>
                  </div>

                  {Object.keys(historialAgrupado).length === 0 ? (
                    <p className="text-xs text-on-surface-variant text-center py-6">
                      No hay promociones registradas de días anteriores.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                      {Object.keys(historialAgrupado).sort().reverse().map((fecha) => {
                        const isOpen = expandedDates[fecha]
                        const promos = historialAgrupado[fecha]
                        return (
                          <div key={fecha} className="border border-outline-variant/50 rounded-lg overflow-hidden bg-surface-container-low">
                            <button
                              onClick={() => toggleDate(fecha)}
                              className="w-full flex items-center justify-between p-3 text-xs font-semibold text-white bg-surface-container-high/40 hover:bg-surface-container-high transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-[10px] bg-outline-variant text-on-surface-variant px-2 py-0.5 rounded font-label-caps">
                                  {promos.length} promos
                                </span>
                                <span>{formatFecha(fecha)}</span>
                              </span>
                              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                                {isOpen ? 'expand_less' : 'expand_more'}
                              </span>
                            </button>

                            {isOpen && (
                              <div className="divide-y divide-outline-variant/30 p-2 space-y-1.5">
                                {promos.map((p) => (
                                  <div key={p.id} className="py-2 px-1 flex items-start justify-between gap-3 text-xs">
                                    <div className="min-w-0">
                                      <p className="font-semibold text-white truncate" title={getPromoName(p.texto_promo)}>
                                        {getPromoName(p.texto_promo)}
                                      </p>
                                    </div>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border font-label-caps shrink-0 mt-0.5 ${getBadgeColor(p.estado)}`}>
                                      {p.estado || 'pendiente'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : (
            
            /* Pestaña: Promociones Aprobadas (Integración con Generador de Flyers) */
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-white font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">thumb_up</span>
                  Promociones Aprobadas y Listas para Redes
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold ml-2">
                    {promocionesAprobadas.length} listas
                  </span>
                </h3>
              </div>

              {promocionesAprobadas.length === 0 ? (
                <div className="bg-surface-container rounded-xl border border-outline-variant p-16 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
                  <span className="text-5xl mb-4">👍</span>
                  <h4 className="font-headline-md text-headline-md text-white mb-2">Aún no hay promociones aprobadas</h4>
                  <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
                    Dirigite a la pestaña de **"Propuestas de IA"**, revisá las ofertas generadas para hoy y hacé clic en **"Aprobar"** en aquellas que quieras publicar en tus redes o enviar a tus clientes.
                  </p>
                  <button
                    onClick={() => setActiveSubTab('ia_sugerencias')}
                    className="bg-primary text-on-primary font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-all text-xs flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    Ver Propuestas de IA
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promocionesAprobadas.map((promo) => {
                    const stableImg = getStableImageUrl(promo)
                    return (
                      <div 
                        key={promo.id} 
                        className={`bg-surface-container rounded-xl border flex flex-col justify-between group transition-all duration-300 overflow-hidden ${
                          promo.estado === 'enviada' 
                            ? 'border-sky-500/30 bg-surface-container-low' 
                            : 'border-primary/20 hover:border-primary/50'
                        }`}
                      >
                        {/* Cabecera Visual Gastronómica Determinista */}
                        <div className="h-40 w-full overflow-hidden relative bg-[#0e1511] border-b border-outline-variant/30 select-none">
                          <img
                            src={stableImg}
                            alt={getPromoName(promo.texto_promo)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop'
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>

                          {/* Badge de Clima */}
                          {promo.clima_dia && (
                            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-primary border border-primary/20 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">wb_sunny</span>
                              <span className="max-w-[120px] truncate">{promo.clima_dia}</span>
                            </div>
                          )}

                          {/* Botones sobre la imagen — solo si tiene imagen de Gemini */}
                          {promo.imagen_url && (
                            <div className="absolute top-2 right-2 flex gap-1.5">
                              {/* Ver imagen a pantalla completa */}
                              <button
                                className="bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white p-1.5 rounded-lg transition-all"
                                title="Ver imagen"
                                onClick={(e) => { e.stopPropagation(); setPreviewPromo(promo) }}
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </button>
                              {/* Descargar */}
                              <a
                                href={promo.imagen_url}
                                download={`promo_${promo.id}.jpg`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white p-1.5 rounded-lg transition-all"
                                title="Descargar imagen"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                              </a>
                              {/* Compartir por WhatsApp */}
                              <a
                                href={`https://wa.me/?text=${encodeURIComponent(`🍕 *${getPromoName(promo.texto_promo)}*\n\n${promo.imagen_url}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366]/80 hover:bg-[#25D366] backdrop-blur-sm text-white p-1.5 rounded-lg transition-all"
                                title="Compartir por WhatsApp"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Contenido con Padding */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            {/* Header Interno: Fecha y Badge */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                {formatFecha(promo.fecha)}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border font-label-caps ${getBadgeColor(promo.estado)}`}>
                                {promo.estado.toUpperCase()}
                              </span>
                            </div>

                            {/* Título de la Promo */}
                            <h4 className="font-headline-sm text-headline-sm text-white font-bold group-hover:text-primary transition-colors mb-3">
                              {getPromoName(promo.texto_promo)}
                            </h4>

                            {/* Cuerpo renderizado */}
                            <div className="space-y-1.5 border-t border-outline-variant/30 pt-3 mb-6">
                              {renderPromoText(promo.texto_promo)}
                            </div>
                          </div>

                          {/* Footer Acciones de Diseño y Envío */}
                          <div className="border-t border-outline-variant/30 pt-4 space-y-2">

                            {/* Botón Generar imagen con Gemini */}
                            <button
                              onClick={() => handleGenerarImagen(promo.id)}
                              disabled={generatingImageId === promo.id}
                              className="w-full border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-all py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {generatingImageId === promo.id ? (
                                <>
                                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Generando con Gemini...</span>
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                                  <span>{promo.imagen_url ? '🔄 Regenerar imagen' : '✨ Generar imagen con Gemini'}</span>
                                </>
                              )}
                            </button>

                            {/* Botones de WhatsApp */}
                            {promo.estado === 'aprobada' ? (
                              <button
                                onClick={() => handleEnviarWhatsApp(promo)}
                                className="w-full border border-primary/30 hover:bg-primary hover:text-on-primary transition-all py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">send</span>
                                Enviar por WhatsApp
                              </button>
                            ) : (
                              <div className="w-full space-y-2">
                                <div className="text-[10px] text-sky-400 flex items-center justify-center gap-1 bg-sky-500/5 py-1 rounded border border-sky-500/10">
                                  <span className="material-symbols-outlined text-[12px] text-sky-400">check</span>
                                  Enviada por WhatsApp 
                                  {promo.enviada_at && (
                                    <span className="text-[9px] opacity-75 font-sans ml-1">
                                      ({new Date(promo.enviada_at).toLocaleDateString('es-AR')} {new Date(promo.enviada_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })})
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleEnviarWhatsApp(promo)}
                                  className="w-full border border-sky-500/20 hover:bg-sky-500/10 text-sky-400 transition-all py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                  Re-enviar promo
                                </button>
                              </div>
                            )}
                            
                            <button
                              onClick={() => handleRechazar(promo.id)}
                              className="w-full hover:bg-red-500/10 text-on-surface-variant hover:text-red-400 transition-all py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[12px]">delete</span>
                              Quitar de aprobadas
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}
        </>
      )}

      {/* Modal de previsualización de imagen */}
      {previewPromo !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setPreviewPromo(null)}
        >
          {/* Botón cerrar */}
          <button
            className="absolute top-4 right-4 text-white bg-black/60 hover:bg-black/90 p-2 rounded-full transition-all z-10"
            onClick={() => setPreviewPromo(null)}
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>

          {/* Imagen */}
          <img
            src={previewPromo.imagen_url}
            alt={getPromoName(previewPromo.texto_promo)}
            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Botón descargar */}
          <a
            href={previewPromo.imagen_url}
            download={`promo_${previewPromo.id}.jpg`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center gap-2 bg-primary text-on-primary font-bold px-6 py-2.5 rounded-lg hover:opacity-90 transition-all text-sm shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Descargar
          </a>
        </div>
      )}

    </div>
  )
}

import React from 'react'

const getHoy = () => new Date().toISOString().split('T')[0]

const getOffset = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const RANGOS = [
  {
    label: 'Hoy',
    desde: () => getHoy(),
    hasta: () => getHoy(),
  },
  {
    label: 'Esta semana',
    desde: () => {
      const d = new Date()
      d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1))
      return d.toISOString().split('T')[0]
    },
    hasta: () => getHoy(),
  },
  {
    label: 'Este mes',
    desde: () => {
      const d = new Date()
      return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
    },
    hasta: () => getHoy(),
  },
  {
    label: 'Mes anterior',
    desde: () => {
      const d = new Date()
      return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().split('T')[0]
    },
    hasta: () => {
      const d = new Date()
      return new Date(d.getFullYear(), d.getMonth(), 0).toISOString().split('T')[0]
    },
  },
]

export default function DateRangePicker({ fechaDesde, fechaHasta, setFechaDesde, setFechaHasta, compact = false }) {
  const isActive = (rango) =>
    fechaDesde === rango.desde() && fechaHasta === rango.hasta()

  const aplicar = (rango) => {
    setFechaDesde(rango.desde())
    setFechaHasta(rango.hasta())
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {/* Rangos rápidos */}
        <div className="flex items-center gap-1">
          {RANGOS.map((r) => (
            <button
              key={r.label}
              onClick={() => aplicar(r)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                isActive(r)
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary/10 border border-outline-variant'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Separador */}
        <span className="text-outline-variant text-xs">|</span>

        {/* Inputs manuales */}
        <div className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant rounded-lg px-2.5 py-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">date_range</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
            className="bg-transparent text-xs text-on-surface focus:outline-none w-28"
          />
          <span className="text-on-surface-variant text-xs">→</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
            className="bg-transparent text-xs text-on-surface focus:outline-none w-28"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Rangos rápidos */}
      <div className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant rounded-xl p-1">
        {RANGOS.map((r) => (
          <button
            key={r.label}
            onClick={() => aplicar(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isActive(r)
                ? 'bg-primary text-on-primary shadow'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Inputs manuales */}
      <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2">
        <span className="material-symbols-outlined text-[20px] text-primary">date_range</span>
        <input
          type="date"
          value={fechaDesde}
          onChange={e => setFechaDesde(e.target.value)}
          className="bg-transparent text-sm text-on-surface focus:outline-none w-32"
        />
        <span className="text-on-surface-variant">→</span>
        <input
          type="date"
          value={fechaHasta}
          onChange={e => setFechaHasta(e.target.value)}
          className="bg-transparent text-sm text-on-surface focus:outline-none w-32"
        />
      </div>
    </div>
  )
}

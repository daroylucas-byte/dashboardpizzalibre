import { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useSales } from '../hooks/useSales'
import DateRangePicker from './DateRangePicker'

function fmt(n) {
  if (!n) return '$0'
  return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtShort(n) {
  const num = Number(n)
  if (num >= 1_000_000) return '$' + (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return '$' + (num / 1_000).toFixed(0) + 'K'
  return '$' + num.toFixed(0)
}

function fmtDateTime(fechaStr) {
  if (!fechaStr) return '—'
  const d = new Date(fechaStr)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(fechaStr) {
  if (!fechaStr) return '—'
  const d = new Date(fechaStr)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

const FORMA_PAGO_ICON = {
  'Efectivo': 'payments',
  'Transf/Crédito/QR': 'account_balance',
}

export default function SalesView() {
  const {
    fechaDesde, setFechaDesde,
    fechaHasta, setFechaHasta,
    sucursal, setSucursal,
    formaPago, setFormaPago,
    currentPage, setCurrentPage,
    totalPages,
    transacciones,
    chartData,
    kpis,
    totalCount,
    loading,
    error,
  } = useSales()

  const [selectedRowId, setSelectedRowId] = useState(null)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [aiSuccessMessage, setAiSuccessMessage] = useState('')

  const handleApplyCampaign = () => {
    setAiSuccessMessage('¡Campaña de Happy Hour Extendido aplicada con éxito!')
    setTimeout(() => setAiSuccessMessage(''), 4000)
    setIsAiOpen(false)
  }

  const handleClearFilters = () => {
    const hoy = new Date()
    setFechaDesde(new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0])
    setFechaHasta(hoy.toISOString().split('T')[0])
    setSucursal('Ambas')
    setFormaPago('Todos')
    setCurrentPage(1)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#161d19] border border-outline-variant rounded-lg p-3 shadow-xl">
          <p className="font-label-caps text-xs text-primary mb-2">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} className="text-xs text-on-surface flex items-center gap-2 my-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="font-medium">{entry.name}:</span>
              <span className="font-bold text-white">{fmtShort(entry.value)}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-card-gap text-left relative pb-10">

      {/* Alert */}
      {aiSuccessMessage && (
        <div className="fixed top-20 right-6 bg-[#161d19] border border-primary text-primary px-4 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="text-sm font-semibold">{aiSuccessMessage}</span>
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex text-on-surface-variant text-[10px] gap-2 mb-2 font-label-caps">
            <span>ANALYTICS</span>
            <span>/</span>
            <span className="text-primary">VENTAS DETALLADAS</span>
          </nav>
          <h2 className="font-display-lg text-display-lg text-on-surface">Ventas Detalladas</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Análisis profundo de transacciones y rendimiento entre sucursales.</p>
        </div>

        {/* Date range picker */}
        <DateRangePicker
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          setFechaDesde={setFechaDesde}
          setFechaHasta={setFechaHasta}
        />
      </section>

      {/* Filters */}
      <div className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label className="font-label-caps text-[10px] text-on-surface-variant">LOCAL</label>
          <select
            className="bg-surface-container-high border-none text-body-md rounded-lg focus:ring-1 focus:ring-primary py-2 px-3 focus:outline-none cursor-pointer"
            value={sucursal}
            onChange={e => setSucursal(e.target.value)}
          >
            <option value="Ambas">Todos los Locales</option>
            <option value="Local 1">Local 1</option>
            <option value="Local 2">Local 2</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label className="font-label-caps text-[10px] text-on-surface-variant">FORMA DE PAGO</label>
          <select
            className="bg-surface-container-high border-none text-body-md rounded-lg focus:ring-1 focus:ring-primary py-2 px-3 focus:outline-none cursor-pointer"
            value={formaPago}
            onChange={e => setFormaPago(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transf/Crédito/QR">Transf/Crédito/QR</option>
          </select>
        </div>

        <button
          onClick={handleClearFilters}
          className="mt-auto mb-1 ml-auto text-on-surface-variant font-label-caps text-label-caps hover:text-on-surface focus:outline-none cursor-pointer transition-colors"
        >
          Limpiar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-card-gap">

        <div className="bg-surface-container border border-outline-variant p-6 rounded-xl emerald-glow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Ventas Totales</span>
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-data-metric text-data-metric text-on-surface">{loading ? '—' : fmt(kpis.totalVentas)}</h3>
          </div>
          <div className="mt-4 h-[40px] w-full">
            <svg className="w-full h-full stroke-primary fill-none stroke-2" viewBox="0 0 100 40">
              <path d="M0,35 Q10,10 20,30 T40,15 T60,25 T80,5 T100,20"></path>
            </svg>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant p-6 rounded-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Promedio Diario</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">receipt</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-data-metric text-data-metric text-on-surface">{loading ? '—' : fmt(kpis.ticketPromedio)}</h3>
          </div>
          <div className="mt-4 h-[40px] w-full">
            <svg className="w-full h-full stroke-primary/60 fill-none stroke-2" viewBox="0 0 100 40">
              <path d="M0,20 Q20,25 40,20 T80,22 T100,18"></path>
            </svg>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant p-6 rounded-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Total Transacciones</span>
            <div className="w-8 h-8 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-data-metric text-data-metric text-on-surface">{loading ? '—' : totalCount.toLocaleString('es-AR')}</h3>
          </div>
          <div className="mt-4 h-[40px] w-full">
            <svg className="w-full h-full stroke-tertiary fill-none stroke-2" viewBox="0 0 100 40">
              <path d="M0,5 Q20,15 40,35 T80,10 T100,15"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Chart */}
      <section className="bg-surface-container border border-outline-variant rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Ventas por Día</h4>
            <p className="text-on-surface-variant text-[12px]">Local 1 vs Local 2 en el período seleccionado</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span className="font-label-caps text-[10px]">LOCAL 1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary"></span>
              <span className="font-label-caps text-[10px]">LOCAL 2</span>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradLocal1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4edea3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4edea3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLocal2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b7c8e1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#b7c8e1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#242c27" vertical={false} />
                <XAxis dataKey="dia" stroke="#86948a" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" interval="preserveStartEnd" />
                <YAxis stroke="#86948a" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" tickFormatter={fmtShort} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2f3632', opacity: 0.1 }} />
                <Area type="monotone" dataKey="Local 1" stroke="#4edea3" fillOpacity={1} fill="url(#gradLocal1)" strokeWidth={3} />
                <Area type="monotone" dataKey="Local 2" stroke="#b7c8e1" fillOpacity={1} fill="url(#gradLocal2)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Transactions Table */}
      <section className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Transacciones Recientes</h4>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors" title="Descargar">
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Hora</th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Local</th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Mozo</th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Forma de Pago</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <svg className="animate-spin h-5 w-5 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-error text-sm">{error}</td>
                </tr>
              ) : transacciones.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-on-surface-variant">
                    No se encontraron transacciones con los filtros seleccionados.
                  </td>
                </tr>
              ) : transacciones.map((trx) => {
                const isSelected = selectedRowId === trx.id
                const icon = FORMA_PAGO_ICON[trx.formaPago] || 'credit_card'
                return (
                  <tr
                    key={trx.id}
                    onClick={() => setSelectedRowId(isSelected ? null : trx.id)}
                    className={`hover:bg-surface-container-highest transition-colors cursor-pointer group ${isSelected ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{fmtDate(trx.fecha)}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{fmtDateTime(trx.fecha)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        trx.sucursal === 'Local 1'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-secondary/10 text-secondary border-secondary/20'
                      }`}>
                        {trx.sucursal.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface text-sm">{trx.mozo || '—'}</td>
                    <td className="px-6 py-4 font-bold text-primary">{fmt(trx.monto)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                        <span>{trx.formaPago || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                        more_vert
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center text-on-surface-variant text-[12px]">
          <span>
            {totalCount === 0 ? '0 transacciones' : `Página ${currentPage} de ${totalPages} — ${totalCount.toLocaleString('es-AR')} transacciones`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 hover:bg-surface-container-high rounded border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }).map((_, idx) => {
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
            {totalPages > 7 && <span className="text-on-surface-variant">…{totalPages}</span>}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 hover:bg-surface-container-high rounded border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* AI Floating Assistant */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
        <div className={`w-[320px] bg-surface-container-high border border-primary/30 rounded-2xl p-5 shadow-2xl transition-all duration-300 transform mb-4 ${
          isAiOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
            <h5 className="font-headline-sm text-[14px] text-primary">AI Recommendation</h5>
          </div>
          <p className="text-[12px] text-on-surface-variant leading-relaxed">
            Las ventas en <span className="text-primary font-bold">Local 1</span> han crecido un 15% los martes por la tarde. Sugerimos activar la promoción de "Happy Hour Extendido" para capitalizar esta tendencia.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleApplyCampaign}
              className="bg-primary text-on-primary hover:brightness-110 active:scale-95 px-3 py-2 text-[11px] font-bold rounded-lg w-full transition-all duration-150 cursor-pointer shadow-md shadow-primary/10"
            >
              Apply Campaign
            </button>
            <button
              onClick={() => setIsAiOpen(false)}
              className="bg-surface-container-highest hover:bg-surface-variant hover:text-white px-3 py-2 text-[11px] font-bold rounded-lg w-full transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className={`w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg emerald-glow flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none ${isAiOpen ? 'rotate-45' : ''}`}
          title="AI Assistant Suggestions"
        >
          <span className="material-symbols-outlined">
            {isAiOpen ? 'close' : 'auto_awesome'}
          </span>
        </button>
      </div>
    </div>
  )
}

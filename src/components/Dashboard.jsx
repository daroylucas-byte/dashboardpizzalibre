import React, { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import SalesView from './SalesView'
import ClimaWidget from './ClimaWidget'
import PromocionesView from './PromocionesView'
import DateRangePicker from './DateRangePicker'
import { useDashboard } from '../hooks/useDashboard'

const PIE_COLORS = ['#4edea3', '#b7c8e1', '#f4a261', '#e76f51']

function fmt(n) {
  if (n === null || n === undefined) return '$0'
  return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtShort(n) {
  const num = Number(n)
  if (num >= 1_000_000) return '$' + (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return '$' + (num / 1_000).toFixed(0) + 'K'
  return '$' + num.toFixed(0)
}

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [promoText, setPromoText] = useState('¡Aprovecha nuestro Happy Hour hoy! 2x1 en margaritas hasta las 8 PM.')
  const [isEditingPromo, setIsEditingPromo] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const {
    fechaDesde, setFechaDesde,
    fechaHasta, setFechaHasta,
    sucursal, setSucursal,
    kpis,
    ventasDiarias,
    topProductos,
    ventasPorMozo,
    formaPago,
    borradosPorProducto,
    loading,
    error,
  } = useDashboard()

  // Activo para el selector de sucursal en topbar
  const activeStore = sucursal === 'Local 1' ? 'local1' : sucursal === 'Local 2' ? 'local2' : 'comparison'

  const handleStoreChange = (store) => {
    if (store === 'local1') setSucursal('Local 1')
    else if (store === 'local2') setSucursal('Local 2')
    else setSucursal('Ambas')
  }

  const handleSharePromo = () => {
    const text = encodeURIComponent(promoText)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  const getUserName = () => {
    if (user && user.fullName) return user.fullName
    if (user && user.email) return user.email.split('@')[0]
    return 'Administrator'
  }

  // Suma KPIs de todas las sucursales filtradas
  const totalVentas = kpis.reduce((a, r) => a + Number(r.total_ventas || 0), 0)
  const totalEfectivo = kpis.reduce((a, r) => a + Number(r.total_efectivo || 0), 0)
  const totalTarjeta = kpis.reduce((a, r) => a + Number(r.total_tarjeta || 0), 0)
  const totalEliminados = kpis.reduce((a, r) => a + Number(r.total_eliminados || 0), 0)
  const cantEliminados = kpis.reduce((a, r) => a + Number(r.cant_eliminados || 0), 0)
  const diasTrabajados = kpis.reduce((a, r) => a + Number(r.dias_trabajados || 0), 0)
  const promedioDiario = diasTrabajados > 0 ? totalVentas / diasTrabajados : 0
  const pctEliminados = totalVentas > 0 ? ((totalEliminados / totalVentas) * 100).toFixed(2) : '0.00'

  // Datos del gráfico de ventas diarias: agrupa por día sumando ambos locales si es "Ambas"
  const chartVentas = (() => {
    const byDay = {}
    for (const row of ventasDiarias) {
      if (!byDay[row.dia]) byDay[row.dia] = { dia: row.dia, 'Local 1': 0, 'Local 2': 0 }
      byDay[row.dia][row.sucursal] = (byDay[row.dia][row.sucursal] || 0) + Number(row.monto_ventas)
    }
    return Object.values(byDay)
      .sort((a, b) => a.dia.localeCompare(b.dia))
      .map(r => ({
        ...r,
        dia: r.dia.slice(5), // "05-15" para abreviar
      }))
  })()

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
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen relative flex overflow-x-hidden">

      {/* Backdrop overlay for mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* SideNavBar */}
      <aside className={`bg-surface-container border-r border-outline-variant h-screen w-64 fixed left-0 top-0 flex flex-col py-6 z-50 text-left transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="px-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">RestoManager Pro</h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">Multi-unit Admin</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-on-surface-variant hover:text-white rounded-lg"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { name: 'Dashboard', icon: 'dashboard' },
            { name: 'Sales', icon: 'analytics' },
            { name: 'Promociones', icon: 'campaign' },
            { name: 'Marketing & Clima', icon: 'auto_awesome' },
            { name: 'Bookings', icon: 'table_restaurant' },
            { name: 'Settings', icon: 'settings' },
          ].map((tab) => {
            const isActive = activeTab === tab.name
            return (
              <a
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name)
                  setIsSidebarOpen(false)
                }}
                className={`flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 ${
                  isActive
                    ? 'text-primary font-bold border-r-4 border-primary bg-secondary-container/20'
                    : 'text-on-surface-variant font-medium hover:bg-surface-container-highest scale-95 active:scale-90'
                }`}
              >
                <span className="material-symbols-outlined mr-3">{tab.icon}</span>
                <span className="font-label-caps text-label-caps">{tab.name}</span>
              </a>
            )
          })}
        </nav>

        <div className="mt-auto px-6 space-y-2">
          <button className="w-full bg-primary text-on-primary py-2 rounded font-label-caps text-label-caps hover:opacity-90 transition-opacity">
            Support
          </button>
          <div className="pt-4 border-t border-outline-variant space-y-1">
            <a className="flex items-center text-on-surface-variant font-medium hover:text-primary py-2 text-sm cursor-pointer">
              <span className="material-symbols-outlined mr-3">help</span>
              Help
            </a>
            <a
              onClick={onLogout}
              className="flex items-center text-on-surface-variant font-medium hover:text-error py-2 text-sm cursor-pointer"
            >
              <span className="material-symbols-outlined mr-3">logout</span>
              Logout
            </a>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-64 pl-0 flex flex-col min-w-0">

        {/* TopNavBar */}
        <header className="bg-surface border-b border-outline-variant top-0 sticky z-40 flex justify-between items-center w-full px-4 md:px-6 h-16 overflow-hidden shrink-0">
          <div className="flex items-center space-x-3 md:space-x-8 min-w-0">
            {/* Hamburger Button for Mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-on-surface hover:bg-surface-container-high rounded-lg flex items-center justify-center shrink-0"
              title="Abrir menú"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate hidden sm:block">RestoManager Dashboard</h2>
            
            <div className="flex items-center space-x-3 md:space-x-6 overflow-x-auto scrollbar-none py-1">
              {[
                { key: 'local1', label: 'Local 1' },
                { key: 'local2', label: 'Local 2' },
                { key: 'comparison', label: 'Comparison Mode' },
              ].map(({ key, label }) => (
                <a
                  key={key}
                  onClick={() => handleStoreChange(key)}
                  className={`font-label-caps text-xs md:text-label-caps cursor-pointer pb-1 transition-all shrink-0 ${
                    activeStore === key
                      ? 'text-primary border-b-2 border-primary font-bold'
                      : 'text-on-secondary-fixed-variant hover:text-primary'
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
            {/* Filtro de fechas - Oculto en pantallas ultra pequeñas */}
            <div className="hidden sm:block">
              <DateRangePicker
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                setFechaDesde={setFechaDesde}
                setFechaHasta={setFechaHasta}
                compact={true}
              />
            </div>
            <div className="relative group cursor-pointer p-1">
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors hidden md:block">apps</span>
            <div className="flex items-center space-x-2 md:space-x-3 ml-2 border-l border-outline-variant pl-2 md:pl-4">
              <button className="bg-primary text-on-primary font-label-caps text-xs md:text-label-caps px-3 py-1.5 rounded-lg hover:opacity-90 transition-all active:scale-95 whitespace-nowrap hidden md:block">
                New Reservation
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-outline bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {getUserName().charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-on-surface-variant hidden lg:inline max-w-[100px] truncate">{getUserName()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6 lg:p-8 space-y-card-gap flex-1 overflow-y-auto">

          {activeTab === 'Sales' ? (
            <SalesView />
          ) : activeTab === 'Promociones' ? (
            <PromocionesView />
          ) : activeTab === 'Marketing' || activeTab === 'Marketing & Clima' ? (
            <ClimaWidget sucursal={sucursal} />
          ) : activeTab !== 'Dashboard' ? (
            <div className="h-[500px] bg-surface-container rounded-xl border border-outline-variant flex flex-col items-center justify-center text-center p-8">
              <span className="material-symbols-outlined text-primary text-[64px] mb-4">construction</span>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{activeTab} Module</h3>
              <p className="text-on-surface-variant max-w-md">
                This administrative module is ready to be hooked up to your Supabase tables.
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-64">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="bg-error/10 border border-error/30 text-error rounded-xl p-6 text-sm">
              Error cargando datos: {error}
            </div>
          ) : (
            <>
              {/* Premium Clima Banner Alert */}
              <div 
                onClick={() => setActiveTab('Marketing & Clima')}
                className="bg-surface-container-high border border-primary/30 rounded-xl p-4 mb-4 flex items-center justify-between hover:border-primary transition-all duration-300 cursor-pointer shadow-lg shadow-primary/5 hover:scale-[1.01] text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl animate-bounce">🌦️</span>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      Inteligencia de Clima Activa — Villa Carlos Paz
                      <span className="bg-primary/20 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full font-label-caps">PRO</span>
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed font-sans">
                      El clima actual influye directamente en la demanda de tu restaurante. Hacé clic acá para ver el reporte de ventas proyectadas y las sugerencias de promociones de IA de hoy.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-primary text-xs font-bold font-label-caps group-hover:translate-x-1 transition-transform">
                  <span>Abrir Clima</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </div>
              </div>

              {/* KPI Row — 4 cards principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-card-gap">

                {/* Ventas Totales */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:border-primary transition-all duration-300 hover:scale-[1.02] cursor-default text-left">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">Ventas Totales</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-primary bg-primary/10">
                      {diasTrabajados} días
                    </span>
                  </div>
                  <div className="font-data-metric text-data-metric text-on-surface">{fmt(totalVentas)}</div>
                  <div className="h-12 w-full mt-4">
                    <svg className="w-full h-full stroke-primary stroke-2 fill-none" viewBox="0 0 100 30">
                      <path d="M0 25 L10 22 L20 28 L30 15 L40 18 L50 5 L60 12 L70 8 L80 15 L90 5 L100 10"></path>
                    </svg>
                  </div>
                  <p className="font-data-sub text-data-sub text-on-surface-variant mt-2">Promedio diario: {fmt(promedioDiario)}</p>
                </div>

                {/* Efectivo vs Transferencia */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:border-primary transition-all duration-300 hover:scale-[1.02] cursor-default text-left">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">Caja Período</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-primary bg-primary/10">
                      {totalTarjeta > 0 ? 'Mixto' : 'Efectivo'}
                    </span>
                  </div>
                  <div className="font-data-metric text-data-metric text-on-surface">{fmt(totalEfectivo + totalTarjeta)}</div>
                  <div className="flex gap-3 mt-3">
                    <div className="flex-1">
                      <p className="text-[10px] text-on-surface-variant mb-1">Efectivo</p>
                      <div className="w-full bg-outline-variant h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all duration-500"
                          style={{ width: `${totalEfectivo + totalTarjeta > 0 ? (totalEfectivo / (totalEfectivo + totalTarjeta)) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-primary mt-1">{fmt(totalEfectivo)}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-on-surface-variant mb-1">Transf/QR</p>
                      <div className="w-full bg-outline-variant h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-secondary h-full transition-all duration-500"
                          style={{ width: `${totalEfectivo + totalTarjeta > 0 ? (totalTarjeta / (totalEfectivo + totalTarjeta)) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-secondary mt-1">{fmt(totalTarjeta)}</p>
                    </div>
                  </div>
                </div>

                {/* Eliminados */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:border-error transition-all duration-300 hover:scale-[1.02] cursor-default text-left">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">Eliminados</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      Number(pctEliminados) > 3 ? 'text-error bg-error/10' : 'text-primary bg-primary/10'
                    }`}>
                      {pctEliminados}%
                    </span>
                  </div>
                  <div className="font-data-metric text-data-metric text-on-surface">{fmt(totalEliminados)}</div>
                  <div className="h-12 w-full mt-4">
                    <svg className="w-full h-full stroke-error stroke-2 fill-none" viewBox="0 0 100 30">
                      <path d="M0 5 L20 15 L40 10 L60 25 L80 18 L100 28"></path>
                    </svg>
                  </div>
                  <p className="font-data-sub text-data-sub text-on-surface-variant mt-2">{cantEliminados} ítems eliminados</p>
                </div>

                {/* Días trabajados / Ocupación */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:border-primary transition-all duration-300 hover:scale-[1.02] cursor-default text-left">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">Días Trabajados</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-[10px] font-bold">
                      {sucursal === 'Ambas' ? 'Ambos locales' : sucursal}
                    </span>
                  </div>
                  <div className="font-data-metric text-data-metric text-on-surface">{diasTrabajados}</div>
                  <div className="space-y-2 mt-4">
                    {kpis.map(r => (
                      <div key={r.sucursal} className="flex items-center gap-2">
                        <span className="text-[10px] text-on-surface-variant w-14 shrink-0">{r.sucursal}</span>
                        <div className="flex-1 bg-outline-variant h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${r.sucursal === 'Local 1' ? 'bg-primary' : 'bg-secondary'}`}
                            style={{ width: `${Math.min((Number(r.dias_trabajados) / 31) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-on-surface-variant w-5">{r.dias_trabajados}</span>
                      </div>
                    ))}
                  </div>
                  <p className="font-data-sub text-data-sub text-on-surface-variant mt-2">en el período seleccionado</p>
                </div>
              </div>

              {/* Ventas diarias + Forma de pago */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">

                {/* Gráfico ventas diarias */}
                <div className="lg:col-span-2 bg-surface-container p-6 rounded-xl border border-outline-variant flex flex-col h-[400px] text-left">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Ventas por Día</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
                        <span className="font-label-caps text-[10px] text-on-surface-variant">Local 1</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-secondary rounded-full mr-2"></span>
                        <span className="font-label-caps text-[10px] text-on-surface-variant">Local 2</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartVentas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#242c27" vertical={false} />
                        <XAxis dataKey="dia" stroke="#86948a" fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" interval="preserveStartEnd" />
                        <YAxis stroke="#86948a" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" tickFormatter={fmtShort} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2f3632', opacity: 0.2 }} />
                        <Bar dataKey="Local 1" fill="#4edea3" radius={[4, 4, 0, 0]} maxBarSize={20} />
                        <Bar dataKey="Local 2" fill="#b7c8e1" radius={[4, 4, 0, 0]} maxBarSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Forma de pago — Pie */}
                <div className="bg-surface-container p-6 rounded-xl border border-outline-variant flex flex-col h-[400px] text-left">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Forma de Pago</h3>
                  {formaPago.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">Sin datos</div>
                  ) : (
                    <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={formaPago}
                            dataKey="total_monto"
                            nameKey="forma_pago"
                            cx="50%"
                            cy="45%"
                            outerRadius={90}
                            innerRadius={50}
                            paddingAngle={3}
                          >
                            {formaPago.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [fmt(value), 'Monto']}
                            contentStyle={{ background: '#161d19', border: '1px solid #2f3632', borderRadius: 8 }}
                            labelStyle={{ color: '#4edea3' }}
                            itemStyle={{ color: '#e0e3e0' }}
                          />
                          <Legend
                            formatter={(value) => <span style={{ fontSize: 10, color: '#86948a' }}>{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Productos + Ventas por Mozo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-card-gap">

                {/* Top 10 productos */}
                <div className="bg-surface-container p-6 rounded-xl border border-outline-variant text-left">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Top 10 Productos</h3>
                  {topProductos.length === 0 ? (
                    <p className="text-on-surface-variant text-sm">Sin datos</p>
                  ) : (
                    <div className="space-y-3">
                      {topProductos.map((p, i) => {
                        const max = topProductos[0].total_monto
                        const pct = max > 0 ? (p.total_monto / max) * 100 : 0
                        return (
                          <div key={p.producto}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-on-surface truncate max-w-[200px]" title={p.producto}>
                                <span className="text-primary font-bold mr-2">#{i + 1}</span>
                                {p.producto}
                              </span>
                              <span className="text-xs font-bold text-primary ml-2 shrink-0">{fmt(p.total_monto)}</span>
                            </div>
                            <div className="w-full bg-outline-variant h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-primary h-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Ventas por mozo */}
                <div className="bg-surface-container p-6 rounded-xl border border-outline-variant text-left">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Ventas por Mozo</h3>
                  {ventasPorMozo.length === 0 ? (
                    <p className="text-on-surface-variant text-sm">Sin datos</p>
                  ) : (
                    <div className="space-y-3">
                      {ventasPorMozo.map((m, i) => {
                        const max = ventasPorMozo[0].total_monto
                        const pct = max > 0 ? (m.total_monto / max) * 100 : 0
                        return (
                          <div key={m.mozo}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-on-surface truncate max-w-[200px]">
                                <span className="text-secondary font-bold mr-2">#{i + 1}</span>
                                {m.mozo || '—'}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-on-surface-variant">{m.cant_transacciones} cobros</span>
                                <span className="text-xs font-bold text-secondary">{fmt(m.total_monto)}</span>
                              </div>
                            </div>
                            <div className="w-full bg-outline-variant h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-secondary h-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Borrados + AI Marketing */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">

                {/* Top borrados */}
                <div className="lg:col-span-2 bg-surface-container rounded-xl border border-outline-variant overflow-hidden text-left">
                  <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Productos más Eliminados</h3>
                    <span className="text-[10px] text-error font-label-caps">{fmt(totalEliminados)} total</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-surface-container-highest">
                        <tr>
                          <th className="px-6 py-3 text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">#</th>
                          <th className="px-6 py-3 text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Producto</th>
                          <th className="px-6 py-3 text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Cantidad</th>
                          <th className="px-6 py-3 text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {borradosPorProducto.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant text-sm">Sin datos en el período</td>
                          </tr>
                        ) : borradosPorProducto.map((b, i) => (
                          <tr key={b.producto} className="hover:bg-surface-container-highest transition-colors">
                            <td className="px-6 py-3 text-on-surface-variant text-sm">{i + 1}</td>
                            <td className="px-6 py-3 text-on-surface text-sm">{b.producto}</td>
                            <td className="px-6 py-3 text-on-surface-variant text-sm">{b.total_cantidad}</td>
                            <td className="px-6 py-3 text-error font-bold text-sm">{fmt(b.total_monto)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Marketing */}
                <div className="bg-surface-container-high p-6 rounded-xl border border-primary/30 ai-glow flex flex-col relative overflow-hidden group text-left">
                  <div className="absolute -right-4 -top-4 text-primary/10 group-hover:text-primary/20 transition-colors pointer-events-none z-0">
                    <span className="material-symbols-outlined text-[120px]">auto_awesome</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-4 relative z-10">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Sugerencias de IA</h3>
                  </div>
                  <div className="flex-1 bg-surface/50 border border-outline-variant rounded-lg p-4 mb-6 relative z-10">
                    {isEditingPromo ? (
                      <textarea
                        className="w-full bg-surface-container-low border border-primary text-on-surface p-2 rounded focus:outline-none text-body-md h-full resize-none font-body-md"
                        value={promoText}
                        onChange={(e) => setPromoText(e.target.value)}
                        onBlur={() => setIsEditingPromo(false)}
                        autoFocus
                      />
                    ) : (
                      <p className="font-body-md text-body-md text-on-surface-variant italic leading-relaxed">
                        "{promoText}"
                      </p>
                    )}
                    <div className="absolute bottom-2 right-2 z-20">
                      <button
                        onClick={() => setIsEditingPromo(!isEditingPromo)}
                        className="text-on-surface-variant hover:text-primary cursor-pointer focus:outline-none transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isEditingPromo ? 'save' : 'edit'}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Detectamos baja demanda proyectada para las 19:00h en Local 1. Esta promoción podría aumentar la ocupación en un 15%.
                    </p>
                    <button
                      onClick={handleSharePromo}
                      className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20"
                    >
                      <span className="material-symbols-outlined">send</span>
                      <span>Compartir por WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

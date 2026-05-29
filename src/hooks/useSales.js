import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const hoy = new Date()
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
const hoyStr = hoy.toISOString().split('T')[0]

export function useSales() {
  const [fechaDesde, setFechaDesde] = useState(primerDiaMes)
  const [fechaHasta, setFechaHasta] = useState(hoyStr)
  const [sucursal, setSucursal] = useState('Ambas')
  const [formaPago, setFormaPago] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [transacciones, setTransacciones] = useState([])
  const [chartData, setChartData] = useState([])
  const [kpis, setKpis] = useState({ totalVentas: 0, ticketPromedio: 0, cantTransacciones: 0 })
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [fechaDesde, fechaHasta, sucursal, formaPago])

  useEffect(() => {
    fetchAll()
  }, [fechaDesde, fechaHasta, sucursal, formaPago, currentPage])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([fetchTransacciones(), fetchChart(), fetchKpis()])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function buildCajaQuery(table, local) {
    let q = supabase
      .from(table)
      .select('id, fecha, "formaPago", monto, mozo', { count: 'exact' })
      .gte('fecha', fechaDesde)
      .lte('fecha', fechaHasta + 'T23:59:59')
      .order('fecha', { ascending: false })
    if (formaPago !== 'Todos') q = q.eq('"formaPago"', formaPago)
    return q
  }

  async function fetchTransacciones() {
    const from = (currentPage - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const queries = []
    if (sucursal === 'Ambas' || sucursal === 'Local 1') {
      queries.push(
        supabase
          .from('Caja')
          .select('id, fecha, "formaPago", monto, mozo')
          .gte('fecha', fechaDesde)
          .lte('fecha', fechaHasta + 'T23:59:59')
          .order('fecha', { ascending: false })
          .then(r => (r.data || []).map(row => ({ ...row, sucursal: 'Local 1' })))
      )
    }
    if (sucursal === 'Ambas' || sucursal === 'Local 2') {
      queries.push(
        supabase
          .from('Caja2')
          .select('id, fecha, "formaPago", monto, mozo')
          .gte('fecha', fechaDesde)
          .lte('fecha', fechaHasta + 'T23:59:59')
          .order('fecha', { ascending: false })
          .then(r => (r.data || []).map(row => ({ ...row, sucursal: 'Local 2' })))
      )
    }

    const results = await Promise.all(queries)
    let all = results.flat()

    if (formaPago !== 'Todos') {
      all = all.filter(r => r.formaPago === formaPago)
    }

    // Sort merged results
    all.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    setTotalCount(all.length)
    setTransacciones(all.slice(from, to + 1))
  }

  async function fetchChart() {
    const queries = []
    if (sucursal === 'Ambas' || sucursal === 'Local 1') {
      queries.push(
        supabase
          .from('v_cierre_consolidado')
          .select('dia, monto_ventas, sucursal')
          .eq('sucursal', 'Local 1')
          .gte('dia', fechaDesde)
          .lte('dia', fechaHasta)
          .order('dia', { ascending: true })
          .then(r => r.data || [])
      )
    }
    if (sucursal === 'Ambas' || sucursal === 'Local 2') {
      queries.push(
        supabase
          .from('v_cierre_consolidado')
          .select('dia, monto_ventas, sucursal')
          .eq('sucursal', 'Local 2')
          .gte('dia', fechaDesde)
          .lte('dia', fechaHasta)
          .order('dia', { ascending: true })
          .then(r => r.data || [])
      )
    }

    const results = await Promise.all(queries)
    const byDay = {}
    for (const rows of results) {
      for (const row of rows) {
        if (!byDay[row.dia]) byDay[row.dia] = { dia: row.dia.slice(5), 'Local 1': 0, 'Local 2': 0 }
        byDay[row.dia][row.sucursal] = Number(row.monto_ventas)
      }
    }
    setChartData(Object.values(byDay))
  }

  async function fetchKpis() {
    const { data, error } = await supabase.rpc('resumen_periodo', {
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      p_sucursal: sucursal,
    })
    if (error) throw error
    const rows = data || []
    const totalVentas = rows.reduce((a, r) => a + Number(r.total_ventas || 0), 0)
    const diasTrabajados = rows.reduce((a, r) => a + Number(r.dias_trabajados || 0), 0)
    setKpis({
      totalVentas,
      ticketPromedio: diasTrabajados > 0 ? totalVentas / diasTrabajados : 0,
      cantTransacciones: totalCount,
    })
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage))

  return {
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
  }
}

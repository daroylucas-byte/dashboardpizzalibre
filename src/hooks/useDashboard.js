import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const hoy = new Date()
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
const hoyStr = hoy.toISOString().split('T')[0]

export function useDashboard() {
  const [fechaDesde, setFechaDesde] = useState(primerDiaMes)
  const [fechaHasta, setFechaHasta] = useState(hoyStr)
  const [sucursal, setSucursal] = useState('Ambas')

  const [kpis, setKpis] = useState([])
  const [ventasDiarias, setVentasDiarias] = useState([])
  const [topProductos, setTopProductos] = useState([])
  const [ventasPorMozo, setVentasPorMozo] = useState([])
  const [formaPago, setFormaPago] = useState([])
  const [borradosPorProducto, setBorradosPorProducto] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [fechaDesde, fechaHasta, sucursal])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchKpis(),
        fetchVentasDiarias(),
        fetchTopProductos(),
        fetchVentasPorMozo(),
        fetchFormaPago(),
        fetchBorradosPorProducto(),
      ])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchKpis() {
    const { data, error } = await supabase.rpc('resumen_periodo', {
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      p_sucursal: sucursal,
    })
    if (error) throw error
    setKpis(data || [])
  }

  async function fetchVentasDiarias() {
    let query = supabase
      .from('v_cierre_consolidado')
      .select('dia, monto_ventas, monto_efectivo, monto_tarjeta, sucursal')
      .gte('dia', fechaDesde)
      .lte('dia', fechaHasta)
      .order('dia', { ascending: true })

    if (sucursal !== 'Ambas') query = query.eq('sucursal', sucursal)

    const { data, error } = await query
    if (error) throw error
    setVentasDiarias(data || [])
  }

  async function fetchTopProductos() {
    let query = supabase
      .from('v_ventas_diarias')
      .select('producto, total_cantidad, total_monto, sucursal')
      .gte('dia', fechaDesde)
      .lte('dia', fechaHasta)

    if (sucursal !== 'Ambas') query = query.eq('sucursal', sucursal)

    const { data, error } = await query
    if (error) throw error

    // Agrupa por producto en el cliente
    const agrupado = {}
    for (const row of data || []) {
      if (!agrupado[row.producto]) {
        agrupado[row.producto] = { producto: row.producto, total_cantidad: 0, total_monto: 0 }
      }
      agrupado[row.producto].total_cantidad += Number(row.total_cantidad)
      agrupado[row.producto].total_monto += Number(row.total_monto)
    }
    const ordenado = Object.values(agrupado)
      .sort((a, b) => b.total_monto - a.total_monto)
      .slice(0, 10)
    setTopProductos(ordenado)
  }

  async function fetchVentasPorMozo() {
    let query = supabase
      .from('v_caja_diaria')
      .select('mozo, total_monto, cant_transacciones, sucursal')
      .gte('dia', fechaDesde)
      .lte('dia', fechaHasta)

    if (sucursal !== 'Ambas') query = query.eq('sucursal', sucursal)

    const { data, error } = await query
    if (error) throw error

    // Agrupa por mozo
    const agrupado = {}
    for (const row of data || []) {
      if (!agrupado[row.mozo]) {
        agrupado[row.mozo] = { mozo: row.mozo, total_monto: 0, cant_transacciones: 0 }
      }
      agrupado[row.mozo].total_monto += Number(row.total_monto)
      agrupado[row.mozo].cant_transacciones += Number(row.cant_transacciones)
    }
    const ordenado = Object.values(agrupado).sort((a, b) => b.total_monto - a.total_monto)
    setVentasPorMozo(ordenado)
  }

  async function fetchFormaPago() {
    let query = supabase
      .from('v_caja_diaria')
      .select('forma_pago, total_monto, sucursal')
      .gte('dia', fechaDesde)
      .lte('dia', fechaHasta)

    if (sucursal !== 'Ambas') query = query.eq('sucursal', sucursal)

    const { data, error } = await query
    if (error) throw error

    const agrupado = {}
    for (const row of data || []) {
      const key = row.forma_pago || 'Sin datos'
      if (!agrupado[key]) agrupado[key] = { forma_pago: key, total_monto: 0 }
      agrupado[key].total_monto += Number(row.total_monto)
    }
    setFormaPago(Object.values(agrupado))
  }

  async function fetchBorradosPorProducto() {
    let query = supabase
      .from('v_borrados_por_producto')
      .select('producto, total_cantidad, total_monto')
      .gte('dia', fechaDesde)
      .lte('dia', fechaHasta)

    const { data, error } = await query
    if (error) throw error

    const agrupado = {}
    for (const row of data || []) {
      if (!agrupado[row.producto]) {
        agrupado[row.producto] = { producto: row.producto, total_cantidad: 0, total_monto: 0 }
      }
      agrupado[row.producto].total_cantidad += Number(row.total_cantidad)
      agrupado[row.producto].total_monto += Number(row.total_monto)
    }
    const ordenado = Object.values(agrupado)
      .sort((a, b) => b.total_monto - a.total_monto)
      .slice(0, 10)
    setBorradosPorProducto(ordenado)
  }

  return {
    // filtros
    fechaDesde, setFechaDesde,
    fechaHasta, setFechaHasta,
    sucursal, setSucursal,
    // datos
    kpis,
    ventasDiarias,
    topProductos,
    ventasPorMozo,
    formaPago,
    borradosPorProducto,
    loading,
    error,
    refetch: fetchAll,
  }
}

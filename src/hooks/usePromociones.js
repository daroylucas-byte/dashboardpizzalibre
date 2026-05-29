import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function usePromociones() {
  const [configPromo, setConfigPromo] = useState(null)
  const [promociones, setPromociones] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [savingInstruccion, setSavingInstruccion] = useState(false)
  const [error, setError] = useState(null)

  // Obtener fecha de hoy en formato local YYYY-MM-DD
  const getHoyStr = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchConfig(),
        fetchPromociones()
      ])
    } catch (e) {
      console.error('Error fetching data:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('config_promo')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error) throw error
    
    // Si no existe la fila 1 por alguna razón, la creamos para evitar fallos
    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('config_promo')
        .insert({ id: 1, instruccion_extra: '' })
        .select()
        .single()
      
      if (insertError) throw insertError
      setConfigPromo(inserted)
    } else {
      setConfigPromo(data)
    }
  }

  const fetchPromociones = async () => {
    const { data, error } = await supabase
      .from('promociones')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    setPromociones(data || [])
  }

  const saveInstruccion = async (instruccionExtra) => {
    setSavingInstruccion(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('config_promo')
        .update({ 
          instruccion_extra: instruccionExtra, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', 1)
        .select()
        .single()

      if (error) throw error
      setConfigPromo(data)
      return { success: true }
    } catch (e) {
      console.error('Error updating instruccion:', e)
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setSavingInstruccion(false)
    }
  }

  const updatePromoEstado = async (id, nuevoEstado) => {
    setError(null)
    try {
      const { error } = await supabase
        .from('promociones')
        .update({ estado: nuevoEstado })
        .eq('id', id)

      if (error) throw error
      
      // Actualizar estado localmente
      setPromociones(prev => 
        prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p)
      )
      return { success: true }
    } catch (e) {
      console.error('Error updating promo state:', e)
      setError(e.message)
      return { success: false, error: e.message }
    }
  }

  const sendPromoWhatsApp = async (id, textoPromo) => {
    setError(null)
    try {
      const timestamp = new Date().toISOString()
      const { error } = await supabase
        .from('promociones')
        .update({ 
          estado: 'enviada',
          canal_envio: 'whatsapp',
          enviada_at: timestamp
        })
        .eq('id', id)

      if (error) throw error
      
      // Actualizar estado localmente
      setPromociones(prev => 
        prev.map(p => p.id === id ? { 
          ...p, 
          estado: 'enviada',
          canal_envio: 'whatsapp',
          enviada_at: timestamp
        } : p)
      )

      // Abrir WhatsApp Link
      const text = encodeURIComponent(textoPromo)
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
      
      return { success: true }
    } catch (e) {
      console.error('Error sending promo via WhatsApp:', e)
      setError(e.message)
      return { success: false, error: e.message }
    }
  }

  const generarImagen = async (promoId) => {
    try {
      const response = await fetch('https://n8n.srv1055314.hstgr.cloud/webhook/generar-imagen-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo_id: promoId })
      })
      if (!response.ok) throw new Error(`Error n8n: ${response.status}`)
      const result = await response.json()
      const imagenUrl = result.imagen_url
      setPromociones(prev =>
        prev.map(p => p.id === promoId ? { ...p, imagen_url: imagenUrl } : p)
      )
      return { success: true, imagen_url: imagenUrl }
    } catch (e) {
      console.error('Error generando imagen:', e)
      return { success: false, error: e.message }
    }
  }

  const generarPromociones = async () => {
    setGenerating(true)
    setError(null)
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      if (!webhookUrl) {
        throw new Error('VITE_N8N_WEBHOOK_URL no está configurada en las variables de entorno.')
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error en el servidor de n8n: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      // Recargar la lista de promociones para traer las recién generadas
      await fetchPromociones()
      
      return { success: true, message: result.mensaje || 'Promociones generadas con éxito.' }
    } catch (e) {
      console.error('Error generating promotions:', e)
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setGenerating(false)
    }
  }

  // Filtrar promociones
  const hoyStr = getHoyStr()
  const promocionesHoy = promociones.filter(p => p.fecha === hoyStr)
  const historialPromociones = promociones.filter(p => p.fecha !== hoyStr)

  return {
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
    refetch: fetchAll
  }
}

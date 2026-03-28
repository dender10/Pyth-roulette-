import { useState, useEffect, useRef, useCallback } from 'react'
import { BTC_USD_FEED_ID, HERMES_URL } from '../config/pyth'

interface PriceData {
  price: string
  expo: number
  publishTime: number
}

export function useBtcPrice() {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [connected, setConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const url = `${HERMES_URL}/v2/updates/price/stream?ids[]=${BTC_USD_FEED_ID}&parsed=true&allow_unordered=true&benchmarks_only=false`
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.onopen = () => setConnected(true)

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const parsed = data.parsed?.[0]
        if (parsed) {
          setPriceData({
            price: parsed.price.price,
            expo: parsed.price.expo,
            publishTime: parsed.price.publish_time,
          })
        }
      } catch {
        // skip malformed messages
      }
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
      // Reconnect after 2 seconds
      setTimeout(connect, 2000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      eventSourceRef.current?.close()
    }
  }, [connect])

  // Fetch current price on demand (for reveal moment)
  const fetchCurrentPrice = useCallback(async (): Promise<PriceData> => {
    const url = `${HERMES_URL}/v2/updates/price/latest?ids[]=${BTC_USD_FEED_ID}&parsed=true`
    const resp = await fetch(url)
    const data = await resp.json()
    const parsed = data.parsed[0]
    return {
      price: parsed.price.price,
      expo: parsed.price.expo,
      publishTime: parsed.price.publish_time,
    }
  }, [])

  return { priceData, connected, fetchCurrentPrice }
}

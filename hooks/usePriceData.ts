"use client"

import { useState, useEffect, useCallback } from "react"

interface PriceData {
  price: number
  marketCap: number
  volume24h: number
  priceChange24h: number
  liquidity: number
}

interface TokenPriceMap {
  [mintAddress: string]: PriceData
}

export const usePriceData = (tokenMints: string[], onPriceUpdate?: (mint: string, priceData: PriceData) => void) => {
  const [priceData, setPriceData] = useState<TokenPriceMap>({})
  const [isLoading, setIsLoading] = useState(false)

  const fetchTokenPrice = useCallback(
    async (mintAddress: string): Promise<PriceData | null> => {
      try {
        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Try DexScreener API first with proper error handling
        try {
          const dexScreenerResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          })

          if (dexScreenerResponse.ok) {
            const dexData = await dexScreenerResponse.json()
            if (dexData.pairs && dexData.pairs.length > 0) {
              const pair = dexData.pairs[0]
              const priceInfo = {
                price: Number.parseFloat(pair.priceUsd) || 0,
                marketCap: Number.parseFloat(pair.fdv) || 0,
                volume24h: Number.parseFloat(pair.volume?.h24) || 0,
                priceChange24h: Number.parseFloat(pair.priceChange?.h24) || 0,
                liquidity: Number.parseFloat(pair.liquidity?.usd) || 0,
              }

              // Call the callback to update token categories
              if (onPriceUpdate) {
                onPriceUpdate(mintAddress, priceInfo)
              }

              return priceInfo
            }
          }
        } catch (dexError) {
          console.log(`DexScreener API failed for ${mintAddress}:`, dexError)
        }

        // Try Jupiter API as fallback
        try {
          const jupiterResponse = await fetch(`https://price.jup.ag/v4/price?ids=${mintAddress}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          })

          if (jupiterResponse.ok) {
            const jupiterData = await jupiterResponse.json()
            if (jupiterData.data && jupiterData.data[mintAddress]) {
              const tokenData = jupiterData.data[mintAddress]
              const priceInfo = {
                price: tokenData.price || 0,
                marketCap: 0, // Jupiter doesn't provide market cap
                volume24h: 0,
                priceChange24h: 0,
                liquidity: 0,
              }

              if (onPriceUpdate) {
                onPriceUpdate(mintAddress, priceInfo)
              }

              return priceInfo
            }
          }
        } catch (jupiterError) {
          console.log(`Jupiter API failed for ${mintAddress}:`, jupiterError)
        }

        // If both APIs fail, return null instead of throwing
        console.log(`No price data available for token: ${mintAddress}`)
        return null
      } catch (error) {
        console.log(`Error fetching price for ${mintAddress}:`, error)
        return null
      }
    },
    [onPriceUpdate],
  )

  const fetchAllPrices = useCallback(async () => {
    if (tokenMints.length === 0) return

    setIsLoading(true)
    const newPriceData: TokenPriceMap = {}

    // Fetch prices in smaller batches to avoid overwhelming APIs
    const batchSize = 3
    for (let i = 0; i < tokenMints.length; i += batchSize) {
      const batch = tokenMints.slice(i, i + batchSize)

      // Process each token in the batch
      for (const mint of batch) {
        try {
          const price = await fetchTokenPrice(mint)
          if (price) {
            newPriceData[mint] = price
          }
        } catch (error) {
          console.log(`Skipping price fetch for ${mint} due to error:`, error)
        }
      }

      // Longer delay between batches to respect rate limits
      if (i + batchSize < tokenMints.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    setPriceData((prev) => ({ ...prev, ...newPriceData }))
    setIsLoading(false)
  }, [tokenMints, fetchTokenPrice])

  // Fetch prices when token list changes
  useEffect(() => {
    fetchAllPrices()
  }, [fetchAllPrices])

  // Set up periodic price updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllPrices()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchAllPrices])

  return { priceData, isLoading, refetch: fetchAllPrices }
}

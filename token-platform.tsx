"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Plus, Info, Clock, RefreshCw } from "lucide-react"
import { useWebSocket, type TokenData } from "./hooks/useWebSocket"
import { usePriceData } from "./hooks/usePriceData"
import { ConnectionStatus } from "./components/ConnectionStatus"
import { SocialLinks } from "./components/SocialLinks"
import { PriceDisplay } from "./components/PriceDisplay"

const TokenCard = ({
  token,
  priceData,
  isLoadingPrice,
}: {
  token: TokenData
  priceData?: any
  isLoadingPrice: boolean
}) => {
  const timeAgo = () => {
    const now = Date.now()
    const diff = now - token.created_timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const truncateAddress = (address: string) => {
    if (address.length <= 8) return address
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case "bonding":
        return (
          <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
            BONDING
          </Badge>
        )
      case "graduated":
        return (
          <Badge variant="secondary" className="bg-green-600 text-white text-xs">
            GRADUATED
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-slate-600 text-white text-xs">
            NEW
          </Badge>
        )
    }
  }

  const getBorderColor = (category?: string) => {
    switch (category) {
      case "bonding":
        return "border-l-blue-400"
      case "graduated":
        return "border-l-green-400"
      default:
        return "border-l-slate-400"
    }
  }

  return (
    <Card
      className={`bg-slate-900/50 border-slate-800 border-l-4 ${getBorderColor(token.category)} hover:bg-slate-900/70 transition-colors`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold overflow-hidden">
              {token.image && token.image !== "/placeholder.svg?height=48&width=48" ? (
                <img
                  src={token.image || "/placeholder.svg"}
                  alt={token.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `<span class="text-white font-semibold">${getInitials(token.name)}</span>`
                    }
                  }}
                />
              ) : (
                <span className="text-white font-semibold">{getInitials(token.name)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-sm truncate" title={token.name}>
                {token.name}
              </h3>
              <p className="text-slate-400 text-xs">{token.symbol}</p>
              {token.description && (
                <p className="text-slate-500 text-xs mt-1 line-clamp-2" title={token.description}>
                  {token.description}
                </p>
              )}
              <p className="text-slate-600 text-xs mt-1" title={token.mint}>
                {truncateAddress(token.mint)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Clock className="w-3 h-3" />
              {timeAgo()}
            </div>
            {getCategoryBadge(token.category)}
          </div>
        </div>

        {/* Real-time Price Data */}
        <div className="mb-3">
          <PriceDisplay
            price={priceData?.price || 0}
            marketCap={priceData?.marketCap || token.market_cap_value || 0}
            liquidity={priceData?.liquidity || 0}
            priceChange24h={priceData?.priceChange24h || 0}
            volume24h={priceData?.volume24h || 0}
            isLoading={isLoadingPrice}
          />
        </div>

        {/* Creator Info */}
        <div className="mb-3 pb-2 border-b border-slate-800">
          <p className="text-slate-500 text-xs">Creator</p>
          <p className="text-slate-300 text-xs font-mono" title={token.creator}>
            {truncateAddress(token.creator)}
          </p>
        </div>

        {/* Social Links with Emojis */}
        <SocialLinks twitter={token.twitter} telegram={token.telegram} website={token.website} />
      </CardContent>
    </Card>
  )
}

const WalletConnectDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-transparent border-slate-600 text-white hover:bg-slate-800">
          <Wallet className="w-4 h-4 mr-2" />
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 border border-slate-600">
            <div className="w-6 h-6 bg-orange-500 rounded mr-3"></div>
            MetaMask
          </Button>
          <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 border border-slate-600">
            <div className="w-6 h-6 bg-blue-500 rounded mr-3"></div>
            WalletConnect
          </Button>
          <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 border border-slate-600">
            <div className="w-6 h-6 bg-purple-500 rounded mr-3"></div>
            Phantom
          </Button>
          <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 border border-slate-600">
            <div className="w-6 h-6 bg-green-500 rounded mr-3"></div>
            Create New Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function TokenPlatform() {
  const [activeTab, setActiveTab] = useState<"new" | "bonding" | "graduated">("new")
  const {
    allTokens,
    newTokens,
    bondingTokens,
    graduatedTokens,
    isConnected,
    error,
    rawMessages,
    updateTokenWithPriceData,
  } = useWebSocket()

  // Get mint addresses for price fetching
  const tokenMints = useMemo(() => allTokens.map((token) => token.mint), [allTokens])
  const {
    priceData,
    isLoading: isLoadingPrices,
    refetch: refetchPrices,
  } = usePriceData(tokenMints, updateTokenWithPriceData)

  // Get tokens for current tab
  const getDisplayTokens = () => {
    switch (activeTab) {
      case "bonding":
        return bondingTokens
      case "graduated":
        return graduatedTokens
      default:
        return newTokens
    }
  }

  const displayTokens = getDisplayTokens()

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case "bonding":
        return "Tokens with market cap between $10K - $50K"
      case "graduated":
        return "Tokens that crossed bonding curve (>$50K market cap)"
      default:
        return "Recently created tokens (<$10K market cap)"
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">TokenPlatform</h1>
            <ConnectionStatus isConnected={isConnected} error={error} rawMessages={rawMessages} />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={refetchPrices}
              variant="outline"
              size="sm"
              className="bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800"
              disabled={isLoadingPrices}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isLoadingPrices ? "animate-spin" : ""}`} />
              {isLoadingPrices ? "Loading..." : "Refresh Prices"}
            </Button>
            {Object.keys(priceData).length > 0 && (
              <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                {Object.keys(priceData).length} prices loaded
              </Badge>
            )}
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Token
            </Button>
            <WalletConnectDialog />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Headers */}
        <div className="flex gap-8 mb-8">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === "new" ? "border-slate-400 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <div className="w-3 h-6 bg-slate-400 rounded-sm"></div>
            <span className="text-lg font-semibold">New Tokens</span>
            <Badge variant="secondary" className="bg-slate-600 text-white text-xs">
              {newTokens.length}
            </Badge>
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab("bonding")}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === "bonding"
                ? "border-blue-400 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <div className="w-3 h-6 bg-blue-400 rounded-sm"></div>
            <span className="text-lg font-semibold">Bonding Tokens</span>
            <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
              {bondingTokens.length}
            </Badge>
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab("graduated")}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === "graduated"
                ? "border-green-400 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <div className="w-3 h-6 bg-green-400 rounded-sm"></div>
            <span className="text-lg font-semibold">Graduated Tokens</span>
            <Badge variant="secondary" className="bg-green-600 text-white text-xs">
              {graduatedTokens.length}
            </Badge>
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Description */}
        <div className="mb-6">
          <p className="text-slate-400 text-sm">{getTabDescription(activeTab)}</p>
        </div>

        {/* Token Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTokens.length > 0 ? (
            displayTokens.map((token) => (
              <TokenCard
                key={token.mint}
                token={token}
                priceData={priceData[token.mint]}
                isLoadingPrice={isLoadingPrices}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400 text-lg">
                {isConnected ? `No ${activeTab} tokens available yet...` : "Connecting to live feed..."}
              </p>
              <p className="text-slate-500 text-sm mt-2">{getTabDescription(activeTab)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

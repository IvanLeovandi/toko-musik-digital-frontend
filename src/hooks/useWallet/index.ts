'use client'

import { useState, useEffect, useCallback } from 'react'

declare global {
  interface Window {
    ethereum?: any
  }
}

export default function useWallet() {
  const [account, setAccount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isMetaMaskInstalled = () =>
    typeof window !== 'undefined' &&
    typeof window.ethereum !== 'undefined' &&
    window.ethereum.isMetaMask

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask to continue')
      return
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      if (accounts.length > 0) {
        setAccount(accounts[0])
        setError(null)
      }
    } catch (err) {
      console.error('MetaMask connection error:', err)
      setError('Failed to connect wallet')
    }
  }, [])

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!account || !window.ethereum) {
        throw new Error('Wallet not connected')
      }

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      })

      return signature
    },
    [account]
  )

  // Detect wallet on initial load
  useEffect(() => {
    const detectWallet = async () => {
      if (!isMetaMaskInstalled()) {
        setIsLoading(false)
        return
      }

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        })
        if (accounts.length > 0) {
          setAccount(accounts[0])
        } else {
          setAccount(null)
        }
      } catch (err) {
        console.error('Failed to detect wallet:', err)
        setError('Error detecting wallet')
      } finally {
        setIsLoading(false)
      }
    }

    detectWallet()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null)
      } else {
        setAccount(accounts[0])
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [])

  return {
    account,
    isConnected: !!account,
    connectWallet,
    signMessage,
    isLoading,
    error,
  }
}

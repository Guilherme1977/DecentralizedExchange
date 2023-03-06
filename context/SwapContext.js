import React, { useState, useEffect } from "react"
import { ethers, BigNumber } from "ethers"
import Web3Modal from "web3modal"

import {
  isWalletConnected,
  connectWallet,
  connectToken1,
  connectToken2,
  SingleSwapToken,
  connectSwapMultiHop,
  connectIWETH,
  connectDAI,
} from "../utils/appFeatures"

import { IWETHABI } from "./Constants"
import ERC20 from "./ERC20.json"

export const SwapTokenContext = React.createContext()

export const SwapTokenContextProvider = ({ children }) => {
  // States - Wallet and Networks
  const [account, setAccount] = useState("")
  const [ether, setEther] = useState("")
  const [connectedNetwork, setConnectedNetwork] = useState("")

  // States - Token
  const [weth, setWeth9] = useState("")
  const [dai, setDai] = useState("")

  const [tokenData, setTokenData] = useState([])

  const addToken = [
    "0xB468647B04bF657C9ee2de65252037d781eABafD",
    "0x47c05BCCA7d57c87083EB4e586007530eE4539e9",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  ]

  // Fetching user token data

  const fetchData = async () => {
    try {
      const userAccount = await isWalletConnected()

      // Setting setAccount to userAccount
      setAccount(userAccount)

      // Creating provider

      const web3modal = new Web3Modal()
      const connection = await web3modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)

      // *** Checking ETH balance ***
      const balance = await provider.getBalance(userAccount)

      // Converting the BigNumber to more readable format
      const convertedBalance = BigNumber.from(balance).toString()

      // Converting the string to proper eth value using ethers utils
      const ethValue = ethers.utils.formatEther(convertedBalance)
      setEther(ethValue)

      // *** Getting All token balance ***
      addToken.map(async (el, i) => {
        // Getting contract instances
        const contract = new ethers.Contract(el, ERC20, provider)
        // Getting the balances for the tokens
        const userBalance = await contract.balanceOf(userAccount)

        // Getting Token 1 balance
        const tokenOne = BigNumber.from(userBalance).toString()
        const tokenOneBalance = ethers.utils.formatEther(tokenOne)

        console.log(`Token one balance ${tokenOneBalance} `)
      })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])
  return (
    <SwapTokenContext.Provider value={{}}>{children}</SwapTokenContext.Provider>
  )
}

import React, { useState, useEffect } from "react"
import { ethers, BigNumber } from "ethers"
import Web3Modal from "web3modal"

import {
  isWalletConnected,
  connectWallet,
  connectToken1,
  connectToken2,
  connectSingleSwapToken,
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
    "0xE7FF84Df24A9a252B6E8A5BB093aC52B1d8bEEdf", // Token 1
    "0x6D712CB50297b97b79dE784d10F487C00d7f8c2C", // Token 2
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

      // Get name of the network
      const network = await provider.getNetwork()
      setConnectedNetwork(network.name)

      // *** Getting All token balance ***
      addToken.map(async (el, i) => {
        // Getting contract instances
        const contract = new ethers.Contract(el, ERC20, provider)
        // Getting the balances for the tokens
        const userBalance = await contract.balanceOf(userAccount)

        // Getting Token 1 balance
        const tokens = BigNumber.from(userBalance).toString()
        const tokensBalance = ethers.utils.formatEther(tokens)

        //console.log(`Token  balance ${tokensBalance} `)

        // Getting tokens name and symbol
        const name = await contract.name()
        const symbol = await contract.symbol()

        tokenData.push({
          name: name,
          symbol: symbol,
          balance: tokensBalance,
        })

        //console.log(tokenData)

        // Set WETH user balance
        const weth = await connectIWETH()
        const wethBal = await weth.balanceOf(userAccount)
        const wethBalance = BigNumber.from(wethBal).toString()
        const convertWethBalance = ethers.utils.formatEther(wethBalance)
        setWeth9(convertWethBalance)

        // Set DAI user balance
        const dai = await connectDAI()
        const daiBal = await dai.balanceOf(userAccount)
        const daiBalance = BigNumber.from(daiBal).toString()
        const convertdaiBalance = ethers.utils.formatEther(daiBalance)
        setDai(convertdaiBalance)
      })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Creating an instance of connection to SingleSwap contract

  const singleSwapToken = async () => {
    try {
      let singleSwapToken
      let weth
      let dai

      singleSwapToken = await connectSingleSwapToken()
      weth = await connectIWETH()
      dai = await connectDAI()

      const amountIn = 10n ** 18n

      await weth.deposit({ value: amountIn })
      await weth.approve(singleSwapToken.address, amountIn)

      // Performing the actual swap here
      await singleSwapToken.swapExactInputSingle(amountIn, {
        gasLimit: 300000,
      })

      const balance = await dai.balanceOf(account)
      const transferAmount = BigNumber.from(balance).toString()
      const ethValue = ethers.utils.formatEther(transferAmount)
      setDai(ethValue)
      console.log("Dai Balance", ethValue)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <SwapTokenContext.Provider
      value={{
        account,
        weth,
        dai,
        connectedNetwork,
        ether,
        connectWallet,
        tokenData,
        singleSwapToken,
      }}
    >
      {children}
    </SwapTokenContext.Provider>
  )
}

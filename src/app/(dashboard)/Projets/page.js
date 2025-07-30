'use client'
import React, { useEffect } from 'react'
import { APIURL } from '@/configs/api'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const Page = () => {
  // state Management
  const { token } = useAuth()
  const router = useRouter()
  
  // fetch data from API
  const fetchData = async () => {
    const accessToken = token || localStorage.getItem("accessToken")
    // Redirect if no token
    if (!accessToken) {
      router.push('/login') 
      return
    }

    try {
      const response = await axios.get(`${APIURL.PROJETS}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      console.log("Data fetched successfully:", response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching data:", error)
      return null
    }
  }
// Re-fetch when token changes
  useEffect(() => {
    fetchData()
  }, [token]) 

  return (
    <div>
      {/* Your page content will go here */}
    </div>
  )
}

export default Page
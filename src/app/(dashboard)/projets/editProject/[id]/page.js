'use client'
import React, { useEffect, useState } from 'react'
import { MultiStepForm } from '@/components/projects/addProject/MultiStepForm'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { APIURL } from '@/configs/api'
import { useAuth } from '@/context/AuthContext'
import LoadingSpin from '@/components/LoadingSpin'

import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';

const EditProjectPage = () => {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const [projectData, setProjectData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`${APIURL.PROJETS}/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setProjectData(response.data)
        console.log("Project data fetched successfully:", response.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load project")
        console.error("Error fetching project:", err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id, token])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpin />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <button
          onClick={() => router.push('/projets')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Back to Projects
        </button>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="p-4">
        <p>Project not found</p>
        <button
          onClick={() => router.push('/projets')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Back to Projects
        </button>
      </div>
    )
  }

  return (
    <div className="">
      <div className="mb-4">
        <BreadCrumb
          onRoot={{ href: '/projets' }}
          items={[{ label: projectData?.projet?.nom || 'Projet' }, { label: 'Modifier' }]}
        />
      </div>
      <MultiStepForm
        editMode={true}
        initialData={projectData}
        projetId={params.id}
      />
    </div>
  )
}

export default EditProjectPage
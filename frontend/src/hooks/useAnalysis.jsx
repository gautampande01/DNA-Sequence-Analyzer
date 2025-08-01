import { useState } from 'react'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconAlertCircle } from '@tabler/icons-react'
import { dnaAnalysisApi } from '../services/api'

export const useAnalysis = () => {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [orfs, setOrfs] = useState(null)
  const [literatureResults, setLiteratureResults] = useState(null)
  const [blastResults, setBlastResults] = useState([])
  const [mutationResults, setMutationResults] = useState(null)

  const analyzeSequence = async (values) => {
    setLoading(true)
    
    try {
      const data = await dnaAnalysisApi.analyzeSequence(values.sequence, values.primer_length)
      setResults(data)
      
      notifications.show({
        title: 'Analysis Complete! 🧬',
        message: 'DNA sequence analyzed successfully',
        color: 'green',
        icon: <IconCheck size="1rem" />,
      })
      
      return data
    } catch (error) {
      notifications.show({
        title: 'Analysis Failed',
        message: error.response?.data?.detail || 'An error occurred during analysis',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const analyzeMutation = async (values) => {
    try {
      const data = await dnaAnalysisApi.analyzeMutation(values)
      setMutationResults(data)
      
      notifications.show({
        title: 'Mutation Analysis Complete! 🔬',
        message: 'Mutation effects calculated successfully',
        color: 'blue',
      })
      
      return data
    } catch (error) {
      notifications.show({
        title: 'Mutation Analysis Failed',
        message: error.response?.data?.detail || 'An error occurred',
        color: 'red',
      })
      throw error
    }
  }

  const findORFs = async (sequence) => {
    if (!sequence?.trim()) return
    
    try {
      const data = await dnaAnalysisApi.findORFs(sequence)
      setOrfs(data)
      
      notifications.show({
        title: `Found ${data.orfs_found} ORFs! 🧬`,
        message: 'Open Reading Frames analysis complete',
        color: 'cyan',
      })
      
      return data
    } catch (error) {
      notifications.show({
        title: 'ORF Analysis Failed',
        message: error.response?.data?.detail || 'An error occurred',
        color: 'red',
      })
      throw error
    }
  }

  const searchLiterature = async (sequence) => {
    if (!sequence?.trim()) return
    
    try {
      const data = await dnaAnalysisApi.searchLiterature(sequence)
      setLiteratureResults(data)
      
      notifications.show({
        title: 'Literature Search Complete! 📚',
        message: 'PubMed search results retrieved',
        color: 'violet',
      })
      
      return data
    } catch (error) {
      notifications.show({
        title: 'Literature Search Failed',
        message: error.response?.data?.detail || 'An error occurred',
        color: 'red',
      })
      throw error
    }
  }

  const blastPrimer = async (primerSeq) => {
    try {
      const data = await dnaAnalysisApi.blastSequence(primerSeq)
      setBlastResults(prev => [...prev, { ...data, sequence: primerSeq }])
      
      notifications.show({
        title: 'BLAST Submitted! 🎯',
        message: 'Check the results link when ready',
        color: 'orange',
      })
      
      return data
    } catch (error) {
      notifications.show({
        title: 'BLAST Failed',
        message: error.response?.data?.detail || 'An error occurred',
        color: 'red',
      })
      throw error
    }
  }

  return {
    // State
    results,
    loading,
    orfs,
    literatureResults,
    blastResults,
    mutationResults,
    
    // Actions
    analyzeSequence,
    analyzeMutation,
    findORFs,
    searchLiterature,
    blastPrimer,
    
    // Setters for external updates
    setResults,
    setOrfs,
    setLiteratureResults,
    setBlastResults,
    setMutationResults
  }
}
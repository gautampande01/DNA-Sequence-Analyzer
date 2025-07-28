import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export const dnaAnalysisApi = {
  analyzeSequence: async (sequence, primerLength) => {
    const response = await api.get('/analyze', {
      params: {
        sequence,
        primer_length: primerLength
      }
    })
    return response.data
  },

  analyzeMutation: async (mutationData) => {
    const response = await api.post('/mutation', mutationData)
    return response.data
  },

  findORFs: async (sequence) => {
    const response = await api.get('/orfs', {
      params: { sequence }
    })
    return response.data
  },

  searchLiterature: async (sequence) => {
    const response = await api.get('/literature', {
      params: { sequence }
    })
    return response.data
  },

  blastSequence: async (sequence) => {
    const response = await api.get('/blast', {
      params: { sequence }
    })
    return response.data
  }
}

export default api
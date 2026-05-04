import { useState, useEffect } from 'react'
import api, { jobsAPI, exportAPI } from '../utils/api'
import { MagnifyingGlassIcon, ArrowDownTrayIcon, MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useSocketStore } from '../store/socketStore'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    skills: '',
    minSalary: '',
    company: ''
  })
  const [selectedJobs, setSelectedJobs] = useState([])
  const [showMatched, setShowMatched] = useState(false)
  const [scraperStatus, setScraperStatus] = useState(null)
  const [isScraperRunning, setIsScraperRunning] = useState(false)
  const socket = useSocketStore(state => state.socket)

  // Debug: Log jobs state whenever it changes
  console.log('🎨 Rendering Jobs component. Jobs state:', jobs, 'Loading:', loading)

  useEffect(() => {
    loadJobs()
  }, [showMatched])

  useEffect(() => {
    if (!socket) return

    // Listen for scraper status updates
    socket.on('scraper:status', (data) => {
      setScraperStatus(data)
      
      if (data.status === 'completed' && data.site === 'indeed') {
        // Scraping finished, reload jobs after 2 seconds
        setTimeout(() => {
          loadJobs()
          setIsScraperRunning(false)
        }, 2000)
      }
    })

    // Listen for job updates
    socket.on('jobs:update', (data) => {
      toast.success(data.message)
      loadJobs()
    })

    return () => {
      socket.off('scraper:status')
      socket.off('jobs:update')
    }
  }, [socket])

  const calculateSemanticMatch = (job, searchQuery) => {
    if (!searchQuery || showMatched) return null
    
    const query = searchQuery.toLowerCase().trim()
    if (!query) return null
    
    const searchTerms = query.split(/\s+/)
    const jobText = [
      job.title?.toLowerCase() || '',
      job.company?.toLowerCase() || '',
      job.description?.toLowerCase() || '',
      ...(job.skills || []).map(s => s.toLowerCase())
    ].join(' ')
    
    const matchedTerms = searchTerms.filter(term => 
      term.length > 2 && jobText.includes(term)
    )
    
    const matchPercentage = Math.round((matchedTerms.length / searchTerms.length) * 100)
    return matchPercentage > 0 ? matchPercentage : null
  }

  const loadJobs = async () => {
    setLoading(true)
    try {
      console.log('🔍 Loading jobs with filters:', filters)
      const res = showMatched 
        ? await jobsAPI.getMatched()
        : await jobsAPI.getJobs(filters)
      console.log('📦 API Response:', res)
      console.log('📊 Response data:', res.data)
      console.log('💼 Jobs array:', res.data?.jobs)
      console.log('📈 Jobs count:', res.data?.jobs?.length || 0)
      
      // Add semantic match scores for search queries
      const jobsWithMatch = res.data.jobs?.map(job => ({
        ...job,
        semanticMatch: calculateSemanticMatch(job, filters.search)
      })) || []
      
      setJobs(jobsWithMatch)
      console.log('✅ Jobs state updated')
    } catch (error) {
      console.error('❌ Error loading jobs:', error)
      console.error('Error response:', error.response)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadJobs()
  }

  const handleFindNewJobs = async () => {
    try {
      setIsScraperRunning(true)
      setScraperStatus({ status: 'started', message: 'Initializing job scraper...' })
      
      await api.post('/scraper/run')
      toast.success('Job scraper started! Watch for updates...')
    } catch (error) {
      console.error('Scraper error:', error)
      toast.error(`Failed to start scraper: ${error.response?.data?.message || error.message}`)
      setIsScraperRunning(false)
      setScraperStatus(null)
    }
  }

  const handleExport = async (format) => {
    try {
      const res = format === 'excel'
        ? await exportAPI.exportExcel(selectedJobs.length > 0 ? selectedJobs : null)
        : await exportAPI.exportCSV(selectedJobs.length > 0 ? selectedJobs : null)

      const blob = new Blob([res.data], {
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `jobs-${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`
      a.click()
      
      toast.success(`Downloaded ${format.toUpperCase()} file`)
    } catch (error) {
      toast.error('Export failed')
    }
  }

  const toggleSelectJob = (jobId) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Scraper Status Banner */}
      {scraperStatus && isScraperRunning && (
        <div className={`p-4 rounded-lg border-2 ${
          scraperStatus.status === 'scraping' 
            ? 'bg-blue-50 border-blue-300' 
            : scraperStatus.status === 'completed'
            ? 'bg-green-50 border-green-300'
            : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-center gap-3">
            {scraperStatus.status === 'scraping' && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{scraperStatus.message}</p>
              {scraperStatus.count !== undefined && (
                <p className="text-sm text-gray-600">Found {scraperStatus.count} jobs from {scraperStatus.site}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMatched(!showMatched)}
            className={`btn ${showMatched ? 'btn-primary' : 'btn-secondary'}`}
          >
            {showMatched ? '✨ Showing Matched Jobs' : 'Show Matched Jobs'}
          </button>
          
          <button
            onClick={handleFindNewJobs}
            disabled={isScraperRunning}
            className={`btn ${isScraperRunning ? 'btn-secondary opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            <MagnifyingGlassCircleIcon className="w-5 h-5" />
            {isScraperRunning ? 'Searching...' : 'Find New Jobs'}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('excel')} className="btn btn-secondary">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Excel
          </button>
          <button onClick={() => handleExport('csv')} className="btn btn-secondary">
            <ArrowDownTrayIcon className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input"
          />
          <input
            type="text"
            placeholder="Skills (React, Node...)"
            value={filters.skills}
            onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
            className="input"
          />
          <input
            type="text"
            placeholder="Company"
            value={filters.company}
            onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            className="input"
          />
          <button onClick={handleSearch} className="btn btn-primary">
            <MagnifyingGlassIcon className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {jobs.length} jobs found {selectedJobs.length > 0 && `(${selectedJobs.length} selected)`}
          </p>
          
          {jobs.map((job) => (
            <div key={job._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedJobs.includes(job._id)}
                  onChange={() => toggleSelectJob(job._id)}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                      <p className="text-lg text-primary-600 font-semibold">{job.company}</p>
                    </div>
                    
                    {(job.matchScore || job.semanticMatch) && (
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">
                          {job.matchScore || job.semanticMatch}%
                        </p>
                        <p className="text-xs text-gray-600">
                          {job.matchScore ? 'skill match' : 'search match'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <span>📍 {job.location?.city}</span>
                    {job.experience && (job.experience.min || job.experience.max) && (
                      <span>💼 {job.experience.min || 0}-{job.experience.max || job.experience.min || 0} yrs</span>
                    )}
                    {job.salary?.min && job.salary?.max && (
                      <span>💰 ₹{(job.salary.min/100000).toFixed(1)}-{(job.salary.max/100000).toFixed(1)}L</span>
                    )}
                    <span>📅 {format(new Date(job.postedDate), 'MMM dd, yyyy')}</span>
                    <span>🔗 {job.source}</span>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills.slice(0, 8).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {job.sourceUrl && (
                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        View Job →
                      </a>
                    )}
                    <button className="btn btn-secondary">Save</button>
                    <button className="btn btn-secondary">Track Application</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

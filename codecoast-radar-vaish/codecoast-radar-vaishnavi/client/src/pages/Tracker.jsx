import { useState, useEffect } from 'react'
import { trackerAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Tracker() {
  const [applications, setApplications] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedApps, setSelectedApps] = useState([])

  useEffect(() => {
    loadData()
  }, [selectedStatus])

  const loadData = async () => {
    try {
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {}
      const [appsRes, analyticsRes, followUpsRes] = await Promise.all([
        trackerAPI.getApplications(params),
        trackerAPI.getAnalytics(),
        trackerAPI.getFollowUps()
      ])
      
      setApplications(appsRes.data.applications)
      setAnalytics(analyticsRes.data.analytics)
      setFollowUps(followUpsRes.data.applications)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await trackerAPI.updateStatus(appId, { status: newStatus })
      toast.success('Status updated')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update')
    }
  }

  const handleBulkAction = async (action, status) => {
    if (selectedApps.length === 0) {
      toast.error('No applications selected')
      return
    }

    try {
      await trackerAPI.bulkUpdate({
        applicationIds: selectedApps,
        action,
        status
      })
      toast.success(`${selectedApps.length} applications updated`)
      setSelectedApps([])
      loadData()
    } catch (error) {
      toast.error('Bulk action failed')
    }
  }

  const toggleSelect = (appId) => {
    setSelectedApps(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Applications</p>
          <p className="text-3xl font-bold text-primary-600">{analytics?.totalApplications || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Response Rate</p>
          <p className="text-3xl font-bold text-green-600">{analytics?.responseRate || 0}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Avg Response Time</p>
          <p className="text-3xl font-bold text-blue-600">{analytics?.avgResponseTime || 0} days</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Need Follow-up</p>
          <p className="text-3xl font-bold text-orange-600">{analytics?.followUpNeeded || 0}</p>
        </div>
      </div>

      {/* Follow-ups Alert */}
      {followUps.length > 0 && (
        <div className="card bg-orange-50 border-2 border-orange-300">
          <h3 className="text-lg font-bold text-orange-900 mb-3">
            ⚠️ {followUps.length} Application{followUps.length > 1 ? 's' : ''} Need Follow-up
          </h3>
          <div className="space-y-2">
            {followUps.slice(0, 3).map((app) => (
              <div key={app._id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-semibold">{app.job?.title || app.manualEntry.title}</p>
                  <p className="text-sm text-gray-600">
                    {app.job?.company || app.manualEntry.company} • {app.daysSinceUpdate} days ago
                  </p>
                </div>
                <button className="btn btn-primary btn-sm">Send Follow-up</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {['all', 'applied', 'shortlisted', 'interview', 'offer', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  selectedStatus === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {selectedApps.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('updateStatus', 'withdrawn')}
                className="btn btn-secondary"
              >
                Withdraw Selected ({selectedApps.length})
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {applications.map((app) => (
          <div key={app._id} className="card">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={selectedApps.includes(app._id)}
                onChange={() => toggleSelect(app._id)}
                className="mt-1"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {app.job?.title || app.manualEntry.title}
                    </h3>
                    <p className="text-lg text-primary-600">
                      {app.job?.company || app.manualEntry.company}
                    </p>
                    <p className="text-sm text-gray-600">
                      Applied {format(new Date(app.appliedDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <StatusBadge status={app.status} />
                    <p className="text-xs text-gray-600 mt-1">
                      {app.daysSinceApplied} days ago
                    </p>
                  </div>
                </div>

                {app.notes && (
                  <p className="text-sm text-gray-600 mb-3">{app.notes}</p>
                )}

                <div className="flex gap-2">
                  <select
                    onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                    value={app.status}
                    className="input text-sm"
                  >
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                  
                  {app.needsFollowUp && (
                    <button className="btn bg-orange-500 text-white text-sm">
                      Follow-up Needed
                    </button>
                  )}
                </div>

                {app.statusHistory && app.statusHistory.length > 1 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600 font-semibold mb-1">History:</p>
                    <div className="flex gap-2">
                      {app.statusHistory.map((history, idx) => (
                        <span key={idx} className="text-xs text-gray-500">
                          {history.status} ({format(new Date(history.date), 'MMM dd')})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500">No applications found</p>
            <p className="text-sm text-gray-400 mt-2">Start tracking your job applications</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    applied: 'bg-blue-100 text-blue-700',
    shortlisted: 'bg-green-100 text-green-700',
    interview: 'bg-purple-100 text-purple-700',
    offer: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-700'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${colors[status]}`}>
      {status}
    </span>
  )
}

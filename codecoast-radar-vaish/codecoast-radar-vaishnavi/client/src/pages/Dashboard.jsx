import { useState, useEffect } from 'react'
import { jobsAPI, alertsAPI, trackerAPI } from '../utils/api'
import { 
  BriefcaseIcon, 
  ArrowTrendingUpIcon, 
  BellIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [spikes, setSpikes] = useState([])
  const [trends, setTrends] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsRes, spikesRes, trendsRes, analyticsRes] = await Promise.all([
        jobsAPI.getStats(),
        alertsAPI.getSpikes(),
        alertsAPI.getTrends(),
        trackerAPI.getAnalytics()
      ])

      setStats(statsRes.data.stats)
      setSpikes(spikesRes.data.spikes)
      setTrends(trendsRes.data.trends)
      setAnalytics(analyticsRes.data.analytics)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Jobs"
          value={stats?.totalJobs || 0}
          icon={BriefcaseIcon}
          color="blue"
        />
        <StatCard
          title="This Week"
          value={stats?.weekJobs || 0}
          icon={ArrowTrendingUpIcon}
          color="green"
          subtitle={`${Math.round((stats?.weekJobs / stats?.totalJobs) * 100) || 0}% of total`}
        />
        <StatCard
          title="Active Companies"
          value={stats?.companiesCount || 0}
          icon={BriefcaseIcon}
          color="purple"
        />
        <StatCard
          title="Applications"
          value={analytics?.totalApplications || 0}
          icon={CheckCircleIcon}
          color="orange"
          subtitle={`${analytics?.responseRate || 0}% response rate`}
        />
      </div>

      {/* Hiring Spikes */}
      {spikes && spikes.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BellIcon className="w-6 h-6 text-red-500" />
            🚨 Hiring Spikes Detected
          </h2>
          <div className="space-y-3">
            {spikes.slice(0, 3).map((spike, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <h3 className="font-bold text-gray-900">{spike.company}</h3>
                  <p className="text-sm text-gray-600">
                    {spike.todayCount} jobs posted today (avg: {spike.avgCount})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">+{spike.percentIncrease}%</p>
                  <p className="text-xs text-gray-600">increase</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends Chart */}
      {trends && trends.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Skills Trending This Week</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="growthRate" fill="#3b82f6" name="Growth %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Skills */}
      {stats?.topSkills && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Top Skills in Demand</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats.topSkills.slice(0, 10).map((item, idx) => (
              <div key={idx} className="p-4 bg-primary-50 rounded-lg border border-primary-200 text-center">
                <p className="font-bold text-lg text-primary-600">{item.count}</p>
                <p className="text-sm text-gray-700 truncate">{item.skill}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Application Status</h2>
            <div className="space-y-3">
              {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                count > 0 && (
                  <div key={status} className="flex items-center justify-between">
                    <span className="capitalize text-gray-700">{status}</span>
                    <span className="font-bold text-primary-600">{count}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold text-green-600">{analytics.responseRate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.avgResponseTime} days</p>
              </div>
              {analytics.followUpNeeded > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Needs Follow-up</p>
                  <p className="text-3xl font-bold text-orange-600">{analytics.followUpNeeded}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg border ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

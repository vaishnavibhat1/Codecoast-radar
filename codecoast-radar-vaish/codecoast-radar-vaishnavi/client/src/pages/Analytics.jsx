import { useState, useEffect } from 'react'
import { alertsAPI } from '../utils/api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Analytics() {
  const [spikes, setSpikes] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const [spikesRes, trendsRes] = await Promise.all([
        alertsAPI.getSpikes(),
        alertsAPI.getTrends()
      ])
      setSpikes(spikesRes.data.spikes)
      setTrends(trendsRes.data.trends)
    } catch (error) {
      console.error('Failed to load analytics')
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
      {/* Hiring Spikes */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🚨 Hiring Spikes - Last 24 Hours</h2>
        
        {spikes.length === 0 ? (
          <p className="text-gray-600">No significant hiring spikes detected</p>
        ) : (
          <div className="space-y-4">
            {spikes.map((spike, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{spike.company}</h3>
                    <p className="text-gray-600">Posted {spike.todayCount} jobs today</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-red-600">+{spike.percentIncrease}%</p>
                    <p className="text-sm text-gray-600">vs avg {spike.avgCount} per day</p>
                  </div>
                </div>

                {spike.jobs && spike.jobs.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-700">Latest Postings:</p>
                    {spike.jobs.slice(0, 3).map((job, jdx) => (
                      <div key={jdx} className="p-3 bg-white rounded-lg">
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-gray-600">{job.location?.city}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Trends */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Skills Trending This Week</h2>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="skill" />
            <YAxis label={{ value: 'Growth %', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="growthRate" fill="#3b82f6" name="Growth Rate %" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {trends.slice(0, 6).map((trend, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900">{trend.skill}</p>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  trend.trend === 'up' ? 'bg-green-100 text-green-700' : 
                  trend.trend === 'down' ? 'bg-red-100 text-red-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {trend.trend === 'up' && '↗️ '}
                  {trend.trend === 'down' && '↘️ '}
                  {trend.trend === 'new' && '🆕 '}
                  {trend.growthRate}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {trend.thisWeekCount} jobs this week
                {trend.lastWeekCount > 0 && ` (was ${trend.lastWeekCount})`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Market Insights</h2>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-900">Top Growing Skill</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {trends[0]?.skill || 'N/A'} (+{trends[0]?.growthRate || 0}%)
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="font-semibold text-green-900">Most Active Company</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {spikes[0]?.company || 'N/A'}
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="font-semibold text-purple-900">Recommendation</p>
            <p className="text-gray-700 mt-1">
              Focus on {trends.slice(0, 3).map(t => t.skill).join(', ')} to maximize opportunities
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { authAPI } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    skills: [],
    experience: 'fresher',
    qualification: 'B.Tech',
    preferences: {
      roles: [],
      companies: [],
      minSalary: '',
      maxDistance: 50
    }
  })
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        skills: user.profile.skills || [],
        experience: user.profile.experience || 'fresher',
        qualification: user.profile.qualification || 'B.Tech',
        preferences: user.profile.preferences || {
          roles: [],
          companies: [],
          minSalary: '',
          maxDistance: 50
        }
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await api.put('/users/profile', formData)
      updateUser(data.user)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-3xl">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user?.subscription?.tier === 'pro'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {user?.subscription?.tier?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="input"
            >
              <option value="fresher">Fresher</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="input"
              placeholder="Add a skill..."
            />
            <button
              type="button"
              onClick={addSkill}
              className="btn btn-primary"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-bold text-gray-900 mb-4">Job Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Salary (₹ LPA)
              </label>
              <input
                type="number"
                value={formData.preferences.minSalary}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, minSalary: e.target.value }
                })}
                className="input"
                placeholder="e.g., 500000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Distance (km)
              </label>
              <input
                type="number"
                value={formData.preferences.maxDistance}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, maxDistance: e.target.value }
                })}
                className="input"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-3 text-lg"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Stats */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Skills Added</p>
            <p className="text-2xl font-bold text-primary-600">{formData.skills.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Saved Jobs</p>
            <p className="text-2xl font-bold text-primary-600">{user?.savedJobs?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Saved Searches</p>
            <p className="text-2xl font-bold text-primary-600">{user?.savedSearches?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Member Since</p>
            <p className="text-sm font-bold text-primary-600">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

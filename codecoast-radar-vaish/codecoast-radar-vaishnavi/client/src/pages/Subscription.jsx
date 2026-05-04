import { useState, useEffect } from 'react'
import { subscriptionAPI } from '../utils/api'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

export default function Subscription() {
  const [status, setStatus] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statusRes, plansRes] = await Promise.all([
        subscriptionAPI.getStatus(),
        subscriptionAPI.getPlans()
      ])
      setStatus(statusRes.data.subscription)
      setPlans(plansRes.data.plans)
    } catch (error) {
      console.error('Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      const { data } = await subscriptionAPI.createCheckout()
      window.location.href = data.url
    } catch (error) {
      toast.error('Failed to create checkout session')
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    try {
      await subscriptionAPI.cancel()
      toast.success('Subscription will be cancelled at period end')
      loadData()
    } catch (error) {
      toast.error('Failed to cancel subscription')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="space-y-8">
      {/* Current Status */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Subscription</h2>
        
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl">
          <div>
            <p className="text-sm text-gray-600">Current Plan</p>
            <p className="text-3xl font-bold text-primary-600 capitalize">{status?.tier}</p>
            {status?.isActive && status?.daysRemaining && (
              <p className="text-sm text-gray-600 mt-1">
                {status.daysRemaining} days remaining
              </p>
            )}
          </div>
          
          {status?.tier === 'pro' && status?.isActive ? (
            <button onClick={handleCancel} className="btn bg-red-500 text-white hover:bg-red-600">
              Cancel Subscription
            </button>
          ) : (
            <button onClick={handleUpgrade} className="btn btn-primary text-lg px-8 py-3">
              Upgrade to Pro ✨
            </button>
          )}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`card relative ${
              plan.name === 'Pro'
                ? 'border-2 border-primary-500 shadow-xl'
                : 'border border-gray-200'
            }`}
          >
            {plan.name === 'Pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold rounded-full">
                  RECOMMENDED
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                {plan.price === 0 ? (
                  <p className="text-5xl font-bold text-gray-900">Free</p>
                ) : (
                  <>
                    <p className="text-lg text-gray-600">₹</p>
                    <p className="text-5xl font-bold text-gray-900">{plan.price}</p>
                    <p className="text-gray-600">/{plan.interval}</p>
                  </>
                )}
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, fidx) => (
                <li key={fidx} className="flex items-start gap-2">
                  <CheckCircleIcon className={`w-5 h-5 mt-0.5 ${
                    plan.name === 'Pro' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.name === 'Pro' && status?.tier !== 'pro' && (
              <button
                onClick={handleUpgrade}
                className="w-full btn btn-primary py-3 text-lg"
              >
                Upgrade Now
              </button>
            )}

            {plan.name === 'Free' && status?.tier === 'free' && (
              <div className="w-full btn btn-secondary py-3 text-center cursor-default">
                Current Plan
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="card bg-gradient-to-r from-primary-600 to-blue-600 text-white">
        <h2 className="text-2xl font-bold mb-4">Why Upgrade to Pro?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-5xl mb-2">🚀</p>
            <h3 className="font-bold text-lg mb-1">Unlimited Alerts</h3>
            <p className="text-blue-100">Never miss a perfect job match again</p>
          </div>
          <div>
            <p className="text-5xl mb-2">🎯</p>
            <h3 className="font-bold text-lg mb-1">92%+ Matching</h3>
            <p className="text-blue-100">Higher accuracy job recommendations</p>
          </div>
          <div>
            <p className="text-5xl mb-2">📱</p>
            <h3 className="font-bold text-lg mb-1">Phone Notifications</h3>
            <p className="text-blue-100">Instant alerts on your mobile device</p>
          </div>
        </div>
      </div>
    </div>
  )
}

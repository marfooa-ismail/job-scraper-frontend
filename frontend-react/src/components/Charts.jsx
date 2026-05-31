import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts'

const SOURCE_COLORS = ['#0ea5e9', '#0284c7', '#ea580c', '#f97316', '#06b6d4', '#7c3aed']
const WORK_MODE_COLORS = ['#16a34a', '#f97316']

function groupBy(arr, key) {
  return arr.reduce((acc, cur) => {
    const k = cur[key] || 'Unknown'
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
}

export default function Charts({ jobs }) {
  const bySite = useMemo(() => {
    const g = groupBy(jobs, 'site')
    return Object.entries(g).map(([site, count]) => ({ site, count }))
  }, [jobs])

  const byRemote = useMemo(() => {
    const total = jobs.length
    const remote = jobs.filter(j => j.is_remote === true).length
    return [
      { name: 'Remote', value: remote },
      { name: 'On-site / Hybrid', value: total - remote }
    ]
  }, [jobs])

  const timeline = useMemo(() => {
    const counts = {}
    jobs.forEach(j => {
      const d = j.date_posted ? j.date_posted.split('T')[0] : j.date_posted
      if (!d) return
      counts[d] = (counts[d] || 0) + 1
    })
    return Object.entries(counts).sort((a,b)=> a[0].localeCompare(b[0])).map(([date, jobs])=>({ date, jobs }))
  }, [jobs])

  return (
    <section className="charts">
      <div className="chart card chart--source">
        <div className="section-head">
          <p className="section-kicker">Source mix</p>
          <h3>Listings by Source</h3>
          <p className="section-copy">A quick read on where the strongest volume is coming from.</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bySite} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="site" />
            <YAxis />
            <Tooltip cursor={{ fill: 'rgba(15,23,42,.04)' }} contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(15,23,42,.12)' }} />
            <Bar dataKey="count" radius={[10, 10, 0, 0]}>
              {bySite.map((entry, index) => (
                <Cell key={`site-${entry.site}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart card chart--timeline">
        <div className="section-head">
          <p className="section-kicker">Momentum</p>
          <h3>Postings Over Time</h3>
          <p className="section-copy">A softer timeline that feels more like a narrative than a spreadsheet.</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeline} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip cursor={{ fill: 'rgba(15,23,42,.04)' }} contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(15,23,42,.12)' }} />
            <Area type="monotone" dataKey="jobs" stroke="#f97316" fill="url(#timelineGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart card chart--mode">
        <div className="section-head">
          <p className="section-kicker">Work mode</p>
          <h3>Remote vs On-site</h3>
          <p className="section-copy">A compact signal showing how flexible the current batch really is.</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <defs>
              <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fdba74" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#fff7ed" stopOpacity={0.25} />
              </linearGradient>
            </defs>
            <Pie data={byRemote} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {byRemote.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={WORK_MODE_COLORS[index % WORK_MODE_COLORS.length]} />
              ))}
            </Pie>
            <Legend formatter={(value) => <span className="legend-label">{value}</span>} />
            <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(15,23,42,.12)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

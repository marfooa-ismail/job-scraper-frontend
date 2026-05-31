import React from 'react'

function WorkBadge({ isRemote }) {
  return (
    <span className={`work-badge ${isRemote ? 'work-badge-remote' : 'work-badge-onsite'}`}>
      {isRemote ? 'Remote' : 'On-site / Hybrid'}
    </span>
  )
}

function formatDate(value) {
  if (!value) return 'Fresh upload'
  const asDate = new Date(value)
  if (Number.isNaN(asDate.getTime())) {
    return String(value).split('T')[0]
  }
  return asDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function JobsTable({ jobs }) {
  return (
    <section className="table card">
      <div className="section-head">
        <p className="section-kicker">Open roles</p>
        <h3>Opportunity Board</h3>
        <p className="section-copy">A card wall instead of a rigid table, so each role reads more like a featured listing.</p>
      </div>
      {jobs.length === 0 ? (
        <div className="table-empty-card">No opportunities to show.</div>
      ) : (
        <div className="listing-grid">
          {jobs.map((job, idx) => (
            <article className="job-card" key={`${job.job_url || job.title || 'job'}-${idx}`}>
              <div className="job-card-top">
                <div>
                  <p className="job-title">{job.title || 'Untitled role'}</p>
                  <div className="job-meta-row">
                    <span className="source-name">{String(job.company || job.site || 'Unknown')}</span>
                    <WorkBadge isRemote={job.is_remote} />
                  </div>
                </div>

                {job.job_url ? (
                  <a className="open-link" href={job.job_url} target="_blank" rel="noreferrer">
                    Open role
                  </a>
                ) : null}
              </div>

              <div className="job-chip-row">
                <span className="location-pill">{String(job.location || 'Location not listed')}</span>
                <span className="job-date">{formatDate(job.date_posted)}</span>
              </div>

              {job.description ? <p className="job-description">{job.description}</p> : null}

              <div className="job-card-foot">
                <span className="job-source-label">Source</span>
                <span className="job-source-value">{String(job.site || 'Unknown')}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

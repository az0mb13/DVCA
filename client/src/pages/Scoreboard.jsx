import React, { useState, useEffect } from 'react';

export default function Scoreboard() {
  const [data, setData] = useState(null);
  const [flag, setFlag] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [filter, setFilter] = useState('all');

  const loadData = () => {
    fetch('/scoreboard/api/challenges').then(r => r.json()).then(setData);
  };

  useEffect(() => { loadData(); }, []);

  const submitFlag = async (e) => {
    e.preventDefault();
    setSubmitMsg('');
    const res = await fetch('/scoreboard/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag })
    });
    const result = await res.json();
    setSubmitMsg(result.message);
    if (result.success) {
      setFlag('');
      loadData();
    }
  };

  const resetProgress = async () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      await fetch('/scoreboard/api/reset', { method: 'POST' });
      loadData();
    }
  };

  if (!data) return <div className="empty-state"><p>Loading scoreboard...</p></div>;

  const categories = [...new Set(data.challenges.map(c => c.category))];
  const filteredChallenges = filter === 'all'
    ? data.challenges
    : data.challenges.filter(c => c.category === filter);

  const getDifficultyStars = (level) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span key={i} className={`star ${i < level ? '' : 'empty'}`}>&#9733;</span>
    ));
  };

  return (
    <div>
      <div className="scoreboard-hero">
        <h1>Security Challenge Lab</h1>
        <p>Find vulnerabilities, submit flags, and track your progress across all OWASP ASVS categories.</p>
        <div className="scoreboard-stats">
          <div className="scoreboard-stat">
            <div className="stat-value">{data.totalSolved}</div>
            <div className="stat-label">Solved</div>
          </div>
          <div className="scoreboard-stat">
            <div className="stat-value">{data.totalChallenges}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="scoreboard-stat">
            <div className="stat-value">{data.overallPercentage}%</div>
            <div className="stat-label">Complete</div>
          </div>
        </div>
      </div>

      <div className="progress-bar" style={{ height: 12, borderRadius: 6 }}>
        <div className="progress-fill" style={{ width: `${data.overallPercentage}%` }} />
      </div>

      <div className="card">
        <form onSubmit={submitFlag} className="flag-input">
          <input
            type="text"
            value={flag}
            onChange={e => setFlag(e.target.value)}
            placeholder="Enter flag: FLAG{...}"
          />
          <button type="submit" className="btn btn-success">Submit Flag</button>
        </form>
        {submitMsg && (
          <div className={`alert ${submitMsg.includes('Correct') || submitMsg.includes('Already') ? 'alert-success' : 'alert-error'}`}>
            {submitMsg}
          </div>
        )}
      </div>

      <div className="filter-pills">
        <button className={`pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        {categories.map(cat => (
          <button key={cat} className={`pill ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {data.stats.filter(s => filter === 'all' || s.category === filter).map(stat => (
        <div key={stat.category} className="scoreboard-category">
          <h3>
            {stat.category}
            <span className="cat-count">{stat.solved}/{stat.total}</span>
          </h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stat.percentage}%` }} />
          </div>

          {filteredChallenges.filter(c => c.category === stat.category).map(challenge => (
            <div key={challenge.id} className={`challenge-item ${challenge.solved ? 'solved' : ''}`}>
              <span className="challenge-difficulty">
                {getDifficultyStars(challenge.difficulty)}
              </span>
              <span className="challenge-name">
                {challenge.solved && <span className="solved-tag">&#10003;</span>}
                {challenge.name}
              </span>
              <span className="challenge-ref">{challenge.asvs_ref}</span>
              {challenge.hint && (
                <span className="challenge-hint-btn" title={challenge.hint}>&#63;</span>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="text-center mt-24 mb-20">
        <button onClick={resetProgress} className="btn btn-danger btn-sm">Reset All Progress</button>
      </div>
    </div>
  );
}

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const challengesPath = path.join(__dirname, '..', 'scoreboard', 'challenges.json');
const progressPath = path.join(__dirname, '..', 'scoreboard', 'progress.json');

function getChallenges() {
  return JSON.parse(fs.readFileSync(challengesPath, 'utf8'));
}

function getProgress() {
  if (!fs.existsSync(progressPath)) {
    fs.writeFileSync(progressPath, JSON.stringify({ solved: [], solvedAt: {} }));
  }
  return JSON.parse(fs.readFileSync(progressPath, 'utf8'));
}

function saveProgress(progress) {
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

// Get all challenges with progress
app.get('/api/challenges', (req, res) => {
  const challenges = getChallenges();
  const progress = getProgress();

  const enriched = challenges.map(c => ({
    ...c,
    solved: progress.solved.includes(c.id),
    solvedAt: progress.solvedAt[c.id] || null,
    flag: undefined,
    flag_hash: c.flag_hash
  }));

  const categories = [...new Set(challenges.map(c => c.category))];
  const stats = categories.map(cat => {
    const catChallenges = enriched.filter(c => c.category === cat);
    const solved = catChallenges.filter(c => c.solved).length;
    return {
      category: cat,
      total: catChallenges.length,
      solved,
      percentage: Math.round((solved / catChallenges.length) * 100)
    };
  });

  res.json({
    challenges: enriched,
    stats,
    totalSolved: progress.solved.length,
    totalChallenges: challenges.length,
    overallPercentage: Math.round((progress.solved.length / challenges.length) * 100)
  });
});

// Submit a flag
app.post('/api/submit', (req, res) => {
  const { flag } = req.body;
  if (!flag) return res.status(400).json({ error: 'Flag required' });

  const flagHash = crypto.createHash('sha256').update(flag).digest('hex');
  const challenges = getChallenges();
  const challenge = challenges.find(c => c.flag_hash === flagHash);

  if (!challenge) {
    return res.status(400).json({ success: false, message: 'Invalid flag' });
  }

  const progress = getProgress();
  if (progress.solved.includes(challenge.id)) {
    return res.json({ success: true, message: 'Already solved!', challenge: challenge.id });
  }

  progress.solved.push(challenge.id);
  progress.solvedAt[challenge.id] = new Date().toISOString();
  saveProgress(progress);

  res.json({
    success: true,
    message: `Correct! Challenge "${challenge.name}" solved!`,
    challengeId: challenge.id,
    category: challenge.category
  });
});

// Reset progress
app.post('/api/reset', (req, res) => {
  saveProgress({ solved: [], solvedAt: {} });
  res.json({ success: true, message: 'Progress reset' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`DVCA Scoreboard running at http://127.0.0.1:${PORT}`);
});

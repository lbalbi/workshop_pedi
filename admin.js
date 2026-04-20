const { createClient } = supabase;
const config = window.APP_CONFIG;
const db = createClient(config.supabaseUrl, config.supabaseAnonKey);

const passwordForm = document.getElementById('passwordForm');
const passwordInput = document.getElementById('passwordInput');
const gateCard = document.getElementById('gateCard');
const dashboardCard = document.getElementById('dashboardCard');
const tbody = document.querySelector('#teamsTable tbody');
const dashboardMeta = document.getElementById('dashboardMeta');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');

let authorized = false;
let lastTeams = [];

function escapeHtml(text = '') {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function answersToText(answers) {
  return Object.entries(answers || {})
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

async function loadTeams() {
  const { data, error } = await db.from('teams').select('*').order('updated_at', { ascending: false });
  if (error) {
    alert(`Failed to load teams: ${error.message}`);
    return;
  }

  lastTeams = data || [];
  dashboardMeta.textContent = `${lastTeams.length} team(s) loaded.`;
  tbody.innerHTML = lastTeams.map(team => `
    <tr>
      <td>${escapeHtml(team.team_name)}</td>
      <td>${team.current_stage}</td>
      <td>${team.finished ? 'Yes' : 'No'}</td>
      <td>${team.score}</td>
      <td>${new Date(team.updated_at).toLocaleString()}</td>
      <td><pre>${escapeHtml(answersToText(team.answers))}</pre></td>
    </tr>
  `).join('');
}

function exportCsv() {
  const headers = ['team_name', 'current_stage', 'finished', 'score', 'updated_at', 'answers'];
  const rows = lastTeams.map(team => [
    team.team_name,
    team.current_stage,
    team.finished,
    team.score,
    team.updated_at,
    JSON.stringify(team.answers || {})
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pedipaper-teams.csv';
  a.click();
  URL.revokeObjectURL(url);
}

passwordForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (passwordInput.value !== config.quizmasterPassword) {
    alert('Wrong password.');
    return;
  }
  authorized = true;
  gateCard.classList.add('hidden');
  dashboardCard.classList.remove('hidden');
  await loadTeams();
});

refreshBtn.addEventListener('click', () => authorized && loadTeams());
exportBtn.addEventListener('click', exportCsv);

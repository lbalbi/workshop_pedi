const { createClient } = supabase;
const config = window.APP_CONFIG;
const db = createClient(config.supabaseUrl, config.supabaseAnonKey);

const teamForm = document.getElementById('teamForm');
const teamNameInput = document.getElementById('teamName');
const teamCard = document.getElementById('teamCard');
const locationCard = document.getElementById('locationCard');
const quizCard = document.getElementById('quizCard');
const quizForm = document.getElementById('quizForm');
const quizTitle = document.getElementById('quizTitle');
const finalCard = document.getElementById('finalCard');
const finalMessage = document.getElementById('finalMessage');
const statusText = document.getElementById('statusText');
const teamPill = document.getElementById('teamPill');
const stagePill = document.getElementById('stagePill');
const scorePill = document.getElementById('scorePill');
const checkpointDescription = document.getElementById('checkpointDescription');
const locationStatus = document.getElementById('locationStatus');
const mapLinkWrap = document.getElementById('mapLinkWrap');
const checkLocationBtn = document.getElementById('checkLocationBtn');

let currentTeam = null;
let currentStage = 1;
let answers = {};
let score = 0;
let finished = false;

const TEAM_STORAGE_KEY = 'pedipaper_team_name';

function normalizeAnswer(value = '') {
  return value.trim().toLowerCase();
}

function calculateScore(allAnswers) {
  let total = 0;
  for (const checkpoint of config.checkpoints) {
    for (const q of checkpoint.questions) {
      if (normalizeAnswer(allAnswers[q.id]) === normalizeAnswer(q.correctAnswer)) {
        total += 1;
      }
    }
  }
  return total;
}

function getCheckpoint(stage) {
  return config.checkpoints[stage - 1] || null;
}

function getGoogleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function renderStatus() {
  teamPill.textContent = currentTeam ? `Team: ${currentTeam}` : 'No team yet';
  stagePill.textContent = finished ? 'Stage: Finished' : `Stage: ${currentStage}/${config.checkpoints.length}`;
  scorePill.textContent = `Score: ${score}/${config.checkpoints.length * 3}`;

  if (!currentTeam) {
    statusText.textContent = 'Choose a team name to begin.';
  } else if (finished) {
    statusText.textContent = 'All checkpoints completed. Your final score is shown below.';
  } else {
    statusText.textContent = `You are currently on ${getCheckpoint(currentStage).name}.`;
  }
}

function renderCheckpointGate() {
  const checkpoint = getCheckpoint(currentStage);
  if (!checkpoint || finished) {
    locationCard.classList.add('hidden');
    return;
  }

  const isFirstStage = currentStage === 1;
  locationCard.classList.toggle('hidden', isFirstStage);
  if (isFirstStage) return;

  checkpointDescription.textContent = `${checkpoint.description}`;
  mapLinkWrap.innerHTML = `<a class="map-link" target="_blank" rel="noopener noreferrer" href="${getGoogleMapsUrl(checkpoint.lat, checkpoint.lng)}">Open checkpoint in Google Maps</a>`;
  locationStatus.textContent = 'Check your location to unlock the next 3 questions.';
}

function renderQuestions() {
  const checkpoint = getCheckpoint(currentStage);
  if (!checkpoint || finished) {
    quizCard.classList.add('hidden');
    return;
  }

  quizCard.classList.remove('hidden');
  quizTitle.textContent = `${checkpoint.name} — Questions ${((currentStage - 1) * 3) + 1}-${currentStage * 3}`;
  quizForm.innerHTML = checkpoint.questions.map(q => `
    <div class="question">
      <h3>${q.text}</h3>
      <label>
        Your answer
        <textarea name="${q.id}" required>${answers[q.id] || ''}</textarea>
      </label>
    </div>
  `).join('') + '<button type="submit">Submit answers</button>';

  if (currentStage > 1) {
    quizCard.classList.add('hidden');
  }
}

function showFinal() {
  finalCard.classList.remove('hidden');
  finalMessage.textContent = `Congratulations ${currentTeam}! Your final score is ${score} out of ${config.checkpoints.length * 3}.`;
}

async function upsertTeamRecord() {
  const payload = {
    team_name: currentTeam,
    current_stage: currentStage,
    answers,
    score,
    finished,
    updated_at: new Date().toISOString()
  };

  const { error } = await db.from('teams').upsert(payload, { onConflict: 'team_name' });
  if (error) {
    console.error(error);
    alert(`Failed to save your progress online: ${error.message}`);
    throw error;
  }
}

async function loadExistingTeam(teamName) {
  const { data, error } = await db.from('teams').select('*').eq('team_name', teamName).maybeSingle();
  if (error) {
    console.error(error);
    alert(`Failed to load team: ${error.message}`);
    return;
  }
  if (data) {
    currentTeam = data.team_name;
    currentStage = data.current_stage || 1;
    answers = data.answers || {};
    score = data.score || 0;
    finished = !!data.finished;
  } else {
    currentTeam = teamName;
    currentStage = 1;
    answers = {};
    score = 0;
    finished = false;
    await upsertTeamRecord();
  }
  localStorage.setItem(TEAM_STORAGE_KEY, currentTeam);
  teamCard.classList.add('hidden');
  renderAll();
  if (finished) showFinal();
}

function renderAll() {
  renderStatus();
  renderCheckpointGate();
  renderQuestions();
}

async function unlockQuestionsByLocation() {
  const checkpoint = getCheckpoint(currentStage);
  if (!checkpoint) return;

  if (!navigator.geolocation) {
    alert('Geolocation is not available on this device/browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(async position => {
    const { latitude, longitude, accuracy } = position.coords;
    const distance = haversineDistanceMeters(latitude, longitude, checkpoint.lat, checkpoint.lng);

    if (distance <= config.unlockRadiusMeters) {
      locationStatus.textContent = `Unlocked. You are about ${Math.round(distance)} m away (accuracy ±${Math.round(accuracy)} m).`;
      quizCard.classList.remove('hidden');
    } else {
      locationStatus.textContent = `Not close enough yet. You are about ${Math.round(distance)} m away (accuracy ±${Math.round(accuracy)} m).`;
    }
  }, error => {
    locationStatus.textContent = `Location check failed: ${error.message}`;
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 5000
  });
}

teamForm.addEventListener('submit', async e => {
  e.preventDefault();
  const teamName = teamNameInput.value.trim();
  if (!teamName) return;
  await loadExistingTeam(teamName);
});

quizForm.addEventListener('submit', async e => {
  e.preventDefault();
  const checkpoint = getCheckpoint(currentStage);
  const formData = new FormData(quizForm);
  checkpoint.questions.forEach(q => {
    answers[q.id] = String(formData.get(q.id) || '').trim();
  });

  score = calculateScore(answers);

  if (currentStage >= config.checkpoints.length) {
    finished = true;
  } else {
    currentStage += 1;
  }

  await upsertTeamRecord();
  renderAll();

  if (finished) {
    showFinal();
    quizCard.classList.add('hidden');
    locationCard.classList.add('hidden');
  } else {
    alert('Answers submitted. The next checkpoint is now visible. Go there and use the location button to unlock the next questions.');
  }
});

checkLocationBtn.addEventListener('click', unlockQuestionsByLocation);

(async function init() {
  const savedTeam = localStorage.getItem(TEAM_STORAGE_KEY);
  if (savedTeam) {
    await loadExistingTeam(savedTeam);
  }
  renderAll();
})();

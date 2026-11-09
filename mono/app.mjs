import { exercises, routines } from './exercises.mjs';

const byId = new Map(exercises.map(exercise => [exercise.id, exercise]));
const storageKey = 'fittracker-mono.v1';
const maxSessions = 10000;
const views = ['today', 'workout', 'exercises', 'history'];
const $ = id => document.getElementById(id);
const formatDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
let sessions = [];
let draft = [];
let activeView;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, action) {
  const node = element('button', text);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

function notice(message) {
  $('notice').textContent = message;
  $('notice').hidden = !message;
}

function within(value, max) {
  return Number.isInteger(value) && value >= 1 && value <= max;
}

function validSession(session) {
  return session && typeof session.id === 'string' && /^[a-z0-9-]{1,80}$/.test(session.id) &&
    typeof session.name === 'string' && session.name.trim() && session.name.length <= 60 &&
    typeof session.date === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(session.date) && Number.isFinite(Date.parse(session.date)) &&
    Array.isArray(session.rows) && session.rows.length > 0 && session.rows.length <= exercises.length &&
    new Set(session.rows.map(row => row?.id)).size === session.rows.length &&
    session.rows.every(row => row && byId.has(row.id) && within(row.sets, 99) && within(row.amount, 999));
}

function parseBackup(text) {
  const data = JSON.parse(text);
  if (data?.version !== 1 || !Array.isArray(data.sessions) ||
      data.sessions.length > maxSessions || !data.sessions.every(validSession) ||
      new Set(data.sessions.map(session => session.id)).size !== data.sessions.length) {
    throw new Error('Invalid FitTracker Mono backup.');
  }
  return data.sessions;
}

function readSessions() {
  const data = localStorage.getItem(storageKey);
  return data === null ? [] : parseBackup(data);
}

function persist(records) {
  try {
    if (records.length > maxSessions) throw new Error('Log limit reached.');
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, sessions: records }));
    sessions = records;
    renderActivity();
    return true;
  } catch {
    notice('Could not save the log. Check browser storage or export a backup.');
    return false;
  }
}

function latestSessions() {
  try {
    return readSessions();
  } catch {
    notice('Could not read your saved log. Check that browser storage is available.');
    return null;
  }
}

function showView() {
  const hash = location.hash.slice(1);
  const view = views.includes(hash) ? hash : 'today';
  for (const id of views) $(id).hidden = view !== id;
  for (const link of document.querySelectorAll('nav a')) {
    if (link.hash === '#' + view) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (activeView !== undefined && activeView !== view) {
    const heading = $(view).querySelector('h1');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  activeView = view;
}

function addExercise(id) {
  if (!byId.has(id) || draft.some(row => row.id === id)) return;
  draft.push({ id, sets: 1, amount: byId.get(id).unit === 'seconds' ? 30 : 10 });
}

function renderDraft() {
  const rows = $('rows');
  rows.replaceChildren();
  if (!draft.length) rows.append(element('p', 'Add an exercise below to start your log.', 'muted'));
  for (const row of draft) {
    const exercise = byId.get(row.id);
    const line = element('div', undefined, 'row');
    line.append(element('strong', exercise.name));
    for (const [field, title, max] of [['sets', 'Sets', 99], ['amount', exercise.unit === 'reps' ? 'Reps / set' : 'Sec / set', 999]]) {
      const label = element('label', title);
      const input = element('input');
      input.type = 'number';
      input.required = true;
      input.min = 1;
      input.max = max;
      input.value = row[field];
      input.setAttribute('aria-label', exercise.name + ' ' + title);
      input.addEventListener('input', () => { row[field] = input.valueAsNumber; });
      label.append(input);
      line.append(label);
    }
    const remove = button('Remove', () => {
      draft = draft.filter(item => item.id !== row.id);
      renderDraft();
      $('exercise-picker').focus();
    });
    remove.setAttribute('aria-label', 'Remove ' + exercise.name);
    line.append(remove);
    rows.append(line);
  }

  const picker = $('exercise-picker');
  const available = exercises.filter(exercise => !draft.some(row => row.id === exercise.id));
  picker.replaceChildren(...available.map(exercise => new Option(exercise.name, exercise.id)));
  picker.disabled = $('add-exercise').disabled = available.length === 0;
}

function startRoutine(routine) {
  if ((draft.length || $('workout-name').value.trim()) && !confirm('Replace your current workout draft?')) return;
  draft = [];
  $('workout-name').value = routine.name;
  routine.exercises.forEach(addExercise);
  renderDraft();
  notice('');
  location.hash = 'workout';
}

function renderRoutines() {
  $('routines').replaceChildren(...routines.map((routine, index) => {
    const card = element('article', undefined, 'card');
    card.append(element('span', '0' + (index + 1) + ' / ' + routine.exercises.length + ' EXERCISES', 'eyebrow'),
      element('h3', routine.name), element('p', routine.detail),
      button('Use ' + routine.name, () => startRoutine(routine)));
    return card;
  }));
}

function renderLibrary() {
  const query = $('search').value.trim().toLowerCase();
  const matches = exercises.filter(exercise => (exercise.name + ' ' + exercise.group).toLowerCase().includes(query));
  const cards = matches.map(exercise => {
    const card = element('article', undefined, 'card');
    const guide = element('details');
    const steps = element('ol');
    steps.append(...exercise.steps.map(step => element('li', step)));
    const video = element('a', 'Watch NASM demo ↗');
    video.href = 'https://www.youtube.com/watch?v=' + exercise.video;
    video.target = '_blank';
    video.rel = 'noopener noreferrer';
    guide.append(element('summary', 'Form and video'), steps, video);
    card.append(element('span', exercise.group + ' / ' + exercise.level, 'eyebrow'),
      element('h3', exercise.name), element('p', exercise.tip), guide,
      button('Add to workout', () => {
        addExercise(exercise.id);
        renderDraft();
        notice('');
        location.hash = 'workout';
      }));
    return card;
  });
  $('library').replaceChildren(...(cards.length ? cards : [element('p', 'No exercises match that search.', 'muted')]));
}

function renderStats(id, records, period) {
  const sets = records.reduce((sum, record) => sum + record.rows.reduce((count, row) => count + row.sets, 0), 0);
  const days = new Set(records.map(record => new Date(record.date).toDateString())).size;
  $(id).replaceChildren(...[[records.length, 'Workouts' + period], [sets, 'Sets logged'], [days, 'Active days']].map(([value, label]) => {
    const card = element('div', undefined, 'stat');
    card.append(element('strong', value), element('span', label));
    return card;
  }));
}

function renderActivity() {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
  weekStart.setHours(0, 0, 0, 0);
  renderStats('stats', sessions.filter(session => Date.parse(session.date) >= +weekStart && Date.parse(session.date) <= Date.now()), ' this week');
  renderStats('history-stats', sessions, ' all time');
  const history = [...sessions].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).map(session => {
    const card = element('details', undefined, 'session');
    const list = element('ul');
    for (const row of session.rows) {
      const exercise = byId.get(row.id);
      list.append(element('li', exercise.name + ' · ' + row.sets + ' × ' + row.amount + ' ' + exercise.unit));
    }
    const remove = button('Delete workout', () => {
      if (!confirm('Delete this workout from your history?')) return;
      const records = latestSessions();
      if (records && persist(records.filter(record => record.id !== session.id))) notice('Workout deleted.');
    });
    card.append(element('summary', session.name + ' · ' + formatDate.format(new Date(session.date))), list, remove);
    return card;
  });
  $('sessions').replaceChildren(...(history.length ? history : [element('p', 'Your saved workouts will appear here.', 'muted')]));
}

$('search').addEventListener('input', renderLibrary);
$('add-exercise').addEventListener('click', () => {
  const id = $('exercise-picker').value;
  addExercise(id);
  renderDraft();
  $('rows').lastElementChild?.querySelector('input')?.focus();
});
$('discard').addEventListener('click', () => {
  if (!(draft.length || $('workout-name').value) || !confirm('Clear this workout draft?')) return;
  draft = [];
  $('workout-form').reset();
  renderDraft();
  notice('Draft cleared.');
});
$('workout-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('workout-name').value.trim();
  if (!name || !draft.length) {
    notice('Enter a workout name and add at least one exercise.');
    return;
  }
  const record = { id: crypto.randomUUID(), date: new Date().toISOString(), name, rows: draft };
  if (!validSession(record)) {
    notice('Check your exercise sets and reps or seconds.');
    return;
  }
  const records = latestSessions();
  if (!records || !persist([...records, record])) return;
  draft = [];
  $('workout-form').reset();
  renderDraft();
  notice('Workout saved.');
  location.hash = 'history';
});
$('export').addEventListener('click', () => {
  const records = latestSessions();
  if (!records) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, sessions: records }, null, 2)], { type: 'application/json' }));
  const link = element('a');
  link.href = url;
  link.download = 'fittracker-mono-backup.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('import').addEventListener('click', () => $('backup-file').click());
$('backup-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  try {
    if (file.size > 10_000_000) throw new Error('Backup is too large.');
    const incoming = parseBackup(await file.text());
    const records = latestSessions();
    if (!records) return;
    const existing = new Set(records.map(record => record.id));
    const additions = incoming.filter(record => !existing.has(record.id));
    if (!additions.length) notice('This backup has no new workouts.');
    else if (persist([...records, ...additions])) notice('Imported workouts: ' + additions.length + '.');
  } catch {
    notice('Could not import this file. Choose a valid FitTracker Mono JSON backup under 10 MB.');
  }
});
window.addEventListener('hashchange', showView);
window.addEventListener('storage', event => {
  if (event.key !== null && event.key !== storageKey) return;
  const records = latestSessions();
  if (records) {
    sessions = records;
    renderActivity();
  }
});
$('today-date').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date());
sessions = latestSessions() ?? [];
renderRoutines();
renderDraft();
renderLibrary();
renderActivity();
showView();

const locale = document.documentElement.lang;
const labels = {
  en: { build: 'Build', preview: 'Preview', release: 'Release' },
  ru: { build: 'Сборка', preview: 'Тестовая версия', release: 'Релиз' },
}[locale];

const dates = new Intl.DateTimeFormat(locale, {
  dateStyle: 'long',
  timeZone: 'UTC',
});
const entries = document.querySelector('.changelog-entries');

function renderRelease(release) {
  const article = document.createElement('article');
  article.className = 'changelog-entry';
  article.id = `build-${release.build}`;

  const date = document.createElement('time');
  date.dateTime = release.date;
  date.textContent = dates.format(new Date(release.date));

  const heading = document.createElement('h2');
  heading.textContent = release.version;

  const details = document.createElement('p');
  details.className = 'changelog-details';
  details.textContent = `${labels[release.stage]} · ${labels.build} ${release.build}`;

  const notes = document.createElement('ul');
  for (const note of release.notes[locale]) {
    const item = document.createElement('li');
    item.textContent = note;
    notes.append(item);
  }

  article.append(date, heading, details, notes);
  return article;
}

try {
  const response = await fetch(new URL('releases.json', import.meta.url));
  if (!response.ok) throw new Error('Release history unavailable');

  const releases = await response.json();
  if (!Array.isArray(releases) || releases.length === 0)
    throw new Error('Release history is empty');

  releases.sort((a, b) => b.date.localeCompare(a.date) || b.build - a.build);
  entries.replaceChildren(...releases.map(renderRelease));

  const fragment = window.location.hash;
  if (/^#build-\d+$/.test(fragment)) {
    document.getElementById(fragment.slice(1))?.scrollIntoView();
  }
} catch {
  document.querySelector('.changelog-status').hidden = false;
} finally {
  entries.setAttribute('aria-busy', 'false');
}

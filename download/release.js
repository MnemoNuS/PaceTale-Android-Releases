const response = await fetch(new URL('latest.json', import.meta.url), {
  cache: 'no-cache',
}).catch(() => null);
const release = response?.ok ? await response.json().catch(() => null) : null;

function parseUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

const url = parseUrl(release?.url);

if (
  url?.protocol === 'https:' &&
  !url.username &&
  !url.password &&
  url.pathname.toLowerCase().endsWith('.apk') &&
  typeof release.version === 'string' &&
  /^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/.test(release.version) &&
  Number.isSafeInteger(release.bytes) &&
  release.bytes > 0 &&
  typeof release.sha256 === 'string' &&
  /^[a-f0-9]{64}$/.test(release.sha256)
) {
  const size = new Intl.NumberFormat(document.documentElement.lang, {
    style: 'unit',
    unit: 'megabyte',
    unitDisplay: 'short',
    maximumFractionDigits: 1,
  });

  document.querySelector('.download-button').href = url.href;
  document.querySelector('[data-release="version"]').textContent =
    release.version;
  if (Number.isSafeInteger(release.build) && release.build > 0) {
    document.querySelector('[data-release="build"]').textContent =
      release.build;
    document.querySelector('[data-build-row]').hidden = false;
    document.querySelector('[data-release-history]').hash =
      `build-${release.build}`;
  }
  document.querySelector('[data-release="size"]').textContent = size.format(
    release.bytes / 1_000_000,
  );
  document.querySelector('[data-release="sha256"]').textContent =
    release.sha256;
  document.querySelector('.download-status').hidden = true;
  document.querySelector('.download-ready').hidden = false;
  document.querySelector('.download-install').hidden = false;
}

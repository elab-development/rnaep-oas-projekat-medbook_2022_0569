import { useState, useEffect } from 'react';
import client from '../api/client';

const WMO_MAP = {
  0:  { label: 'Clear sky',       tip: 'Great day for a walk — fresh air supports recovery.' },
  1:  { label: 'Mainly clear',    tip: 'Enjoy the mild weather.' },
  2:  { label: 'Partly cloudy',   tip: 'Light layers recommended.' },
  3:  { label: 'Overcast',        tip: 'Overcast sky — keep your mood up.' },
  45: { label: 'Foggy',           tip: 'Poor visibility — drive carefully to your appointment.' },
  48: { label: 'Icy fog',         tip: 'Slippery conditions — allow extra travel time.' },
  51: { label: 'Light drizzle',   tip: 'Bring an umbrella for your appointment.' },
  53: { label: 'Drizzle',         tip: 'Wet outside — dress appropriately.' },
  55: { label: 'Heavy drizzle',   tip: 'Wear waterproof clothing today.' },
  61: { label: 'Light rain',      tip: 'Rain today — take care of your health.' },
  63: { label: 'Moderate rain',   tip: 'Rainy day — stay dry and warm.' },
  65: { label: 'Heavy rain',      tip: 'Heavy rain — consider rescheduling if possible.' },
  71: { label: 'Light snow',      tip: 'Light snow — dress in warm layers.' },
  73: { label: 'Moderate snow',   tip: 'Snowy conditions — watch for icy paths.' },
  75: { label: 'Heavy snow',      tip: 'Heavy snow — allow extra time to reach your appointment.' },
  80: { label: 'Rain showers',    tip: 'Showers expected — keep an umbrella handy.' },
  81: { label: 'Rain showers',    tip: 'Wet weather today — take care.' },
  82: { label: 'Violent showers', tip: 'Severe showers — stay indoors if possible.' },
  95: { label: 'Thunderstorm',    tip: 'Thunderstorm alert — prioritise indoor safety.' },
};

const getWeatherInfo = (code) =>
  WMO_MAP[code] ?? { label: 'Unknown', tip: 'Check local conditions before heading out.' };

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await client.get('/users/weather', {
            params: { lat: coords.latitude, lon: coords.longitude },
          });
          const info = getWeatherInfo(data.weathercode);
          setWeather({ temp: Math.round(data.temperature), label: info.label, tip: info.tip });
          setStatus('ok');
        } catch {
          setStatus('error');
        }
      },
      () => setStatus('denied'),
    );
  }, []);

  if (status === 'loading') {
    return (
      <div style={styles.wrapper}>
        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Fetching weather…</span>
      </div>
    );
  }

  if (status !== 'ok') return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.left}>
        <div>
          <p style={styles.temp}>{weather.temp}°C</p>
          <p style={styles.label}>{weather.label}</p>
        </div>
      </div>
      <p style={styles.tip}>{weather.tip}</p>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)',
    border: '1px solid #bae6fd',
    borderRadius: 14,
    padding: '0.75rem 1.25rem',
    margin: '0 auto 1.5rem',
    maxWidth: 680,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    flexShrink: 0,
  },
  temp: { fontSize: '1.125rem', fontWeight: 700, color: '#0369a1', margin: 0 },
  label: { fontSize: '0.75rem', color: '#64748b', margin: 0 },
  tip: { fontSize: '0.8125rem', color: '#0c4a6e', lineHeight: 1.45, margin: 0, borderLeft: '2px solid #7dd3fc', paddingLeft: '0.875rem' },
};

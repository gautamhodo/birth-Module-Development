// API utility for connecting frontend to json-server backend
// const API_BASE = 'http://localhost:3000';

// const API_BASE = `${window.location.protocol}//${window.location.hostname}:3000`;
// const API_BASE = `http://localhost:5000`;
const API_BASE = `http://192.168.50.171:5000`;
export default API_BASE;

export async function getBirthRecords() {
  const res = await fetch(`${API_BASE}/birthRecords`);
  if (!res.ok) throw new Error('Failed to fetch birth records');
  return res.json();
}

export async function deleteBirthRecord(id: string) {
  const res = await fetch(`${API_BASE}/birthRecords/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete birth record');
  return true;
}

export async function updateBirthRecord(id: string, data: any) {
  const res = await fetch(`${API_BASE}/birthRecords/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update birth record');
  return res.json();
}

export async function getDeathRecords() {
  const res = await fetch(`${API_BASE}/deathRecords`);
  if (!res.ok) throw new Error('Failed to fetch death records');
  return res.json();
}

export async function deleteDeathRecord(id: string) {
  const res = await fetch(`${API_BASE}/deathRecords/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete death record');
  return true;
}

export async function updateDeathRecord(id: string, data: any) {
  const res = await fetch(`${API_BASE}/deathRecords/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update death record');
  return res.json();
}

export async function getMortuaryRecords() {
  const res = await fetch(`${API_BASE}/mortuaryRecords`);
  if (!res.ok) throw new Error('Failed to fetch mortuary records');
  return res.json();
}

export async function addMortuaryRecord(data: any) {
  const res = await fetch(`${API_BASE}/mortuaryRecords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add mortuary record');
  return res.json();
}

export async function deleteMortuaryRecord(id: string) {
  const res = await fetch(`${API_BASE}/mortuaryRecords/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete mortuary record');
  return true;
}
// Add more API functions as needed for create/update 
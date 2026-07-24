// Solo-Spiel: Stub-Rules-Modul für das Higgsfield-Apps-Engine-Deployment
export const meta = { game: "arachne", minPlayers: 1, maxPlayers: 1 };
export function setup() { return {}; }
export function validateAction() { return { ok: true }; }
export function applyAction(state) { return state; }
export function isGameOver() { return { over: false }; }
export function viewFor(state) { return state; }

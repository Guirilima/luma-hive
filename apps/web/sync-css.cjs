const fs = require('fs');
const path = require('path');

const squadCssPath = 'C:/Users/UnGui/Documents/Projects/SquadCode/src/styles.css';
const lumaCssPath = 'C:/Users/UnGui/Documents/Projects/luma-hive/apps/web/src/styles/workspace.css';

const squadCss = fs.readFileSync(squadCssPath, 'utf8');

const additions = `
/* --- Luma Hive Angular Enhancements --- */
a.brand {
  text-decoration: none;
  cursor: pointer;
}
.mode-nav > a {
  padding: 11px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #8c9396;
  letter-spacing: .2px;
  text-decoration: none;
  background: none;
  border: 0;
  cursor: pointer;
  display: inline-block;
  transition: color .14s, background .14s, opacity .14s, transform .14s;
}
.mode-nav > a.active {
  color: #fff;
  font-size: 17px;
  position: relative;
}
.mode-nav > a.active:after {
  content: '';
  position: absolute;
  bottom: 1px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: var(--cyan);
}
.mode-nav > a:hover {
  background: #ffffff0a;
  color: #fff;
}

/* USAGE STATS Popover */
.usage-trigger {
  font: 9px var(--mono);
  letter-spacing: 1.1px;
  color: #30c5e8;
  border: 1px solid #30c5e855;
  background: #30c5e812;
  padding: 5px 9px;
  border-radius: 2px;
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.usage-trigger:hover {
  background: #30c5e825;
  border-color: #30c5e8;
}
.usage-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  background: #090e11fa;
  border: 1px solid #ffffff22;
  box-shadow: 0 16px 40px #000c;
  padding: 14px 16px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font: 11px var(--mono);
  animation: modal-in .2s ease-out;
}
.usage-popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  letter-spacing: 1px;
  color: #7d919d;
  border-bottom: 1px solid #ffffff15;
  padding-bottom: 8px;
}
.usage-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.usage-group-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.usage-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.usage-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.usage-cost {
  color: #a4b3ba;
  font-size: 10px;
}
.usage-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  color: #7b8e96;
}
.usage-row > span {
  width: 24px;
}
.usage-bar {
  flex: 1;
  height: 4px;
  background: #ffffff18;
  overflow: hidden;
  border-radius: 2px;
}
.usage-bar-fill {
  height: 100%;
  transition: width .3s ease;
}
.usage-bar-fill.danger {
  background-color: #ef4444 !important;
}

/* Fullscreen Agent Teams Overlay Fix */
.overlay:has(.agent-teams),
.at-overlay {
  padding: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  background: #020505d9 !important;
}
.brand img, .brand svg {
  width: 29px !important;
  height: 35px !important;
  object-fit: contain !important;
  flex-shrink: 0 !important;
}
.system-meta {
  position: relative !important;
}
.home-view {
  position: absolute !important;
  z-index: 3 !important;
  top: 106px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  overflow: auto !important;
  background: linear-gradient(180deg,#080a0bd9,#080a0bf2 40%) !important;
  backdrop-filter: blur(3px) !important;
  -webkit-backdrop-filter: blur(3px) !important;
}
`;

fs.writeFileSync(lumaCssPath, squadCss + additions, 'utf8');
console.log('Synchronized workspace.css with total size:', (squadCss + additions).length);

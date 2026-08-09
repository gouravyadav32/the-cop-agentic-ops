const fs = require('fs');
const vm = require('vm');

const context = {
  window: {},
  document: {
    getElementById: () => ({ addEventListener: () => {}, getContext: () => ({}), classList: { add: ()=>{}, remove: ()=>{} } }),
    createElement: () => ({ className: '', innerHTML: '', appendChild: () => {}, classList: { add: ()=>{}, remove: ()=>{} } }),
    body: { appendChild: () => {} },
    querySelectorAll: () => ([]),
    addEventListener: (event, cb) => {
      if(event === 'DOMContentLoaded') setTimeout(cb, 50);
    }
  },
  console: console,
  setTimeout: setTimeout,
  Math: Math,
  Date: Date,
  Number: Number,
  Chart: class { constructor() {} destroy() {} }
};

vm.createContext(context);

const files = [
  'js/data.js',
  'js/agentEngine.js',
  'js/components/workflowView.js',
  'js/components/dashboardView.js',
  'js/components/trustControlView.js',
  'js/components/agentTraceView.js',
  'js/components/skuExplorerView.js',
  'js/components/scenarioInjector.js',
  'js/components/limitationsView.js',
  'js/app.js'
];

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  try {
    vm.runInContext(code, context);
    console.log(`Successfully loaded ${file}`);
  } catch (e) {
    console.error(`Error executing ${file}:`, e);
  }
});

setTimeout(() => {
  console.log("Evaluation complete. Checking variables:");
  console.log("AppDataset loaded:", !!context.window.AppDataset);
  console.log("AgentEngine loaded:", !!context.window.AgentEngine);
}, 500);

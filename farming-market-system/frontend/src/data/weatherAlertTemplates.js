export const farmerWeatherAlerts = [
  {
    id: 'frost-watch',
    title: 'Frost watch',
    severity: 'WATCH',
    area: 'South-east farm belt',
    message: 'Tender vegetables may need cover overnight. Prioritize seedlings and leafy greens.',
    note: 'Preview alert state only. No live weather provider is connected yet.'
  },
  {
    id: 'heavy-rain',
    title: 'Heavy rain risk',
    severity: 'WARNING',
    area: 'Low-lying plots and access roads',
    message: 'Check drainage channels, protect packed produce, and review pickup timing for the next 24 hours.',
    note: 'This card is a local UI draft until backend weather broadcast support is added.'
  }
];

export const adminWeatherAlertTemplates = [
  {
    id: 'hail-risk',
    title: 'Hail response template',
    severity: 'SEVERE',
    area: 'Radius-based grower broadcast',
    message: 'Warn farmers to move produce under cover, pause fragile deliveries, and secure greenhouse sheeting.',
    note: 'Admin can prepare the message now; actual broadcast delivery still needs backend/API integration.'
  },
  {
    id: 'drought-risk',
    title: 'Drought advisory template',
    severity: 'INFO',
    area: 'Regional irrigation zones',
    message: 'Encourage water scheduling, mulch checks, and reduced midday transplanting.',
    note: 'Draft-only structure for future severe weather workflows.'
  }
];

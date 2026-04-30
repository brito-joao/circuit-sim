// Light mode is the permanent default — dark mode kept for reference
export const getTheme = (isDarkMode: boolean) => isDarkMode ? {
  bg:            '#1e272e',
  boardBody:     '#2d3436',
  hole:          '#636e72',
  trench:        '#1e272e',
  chipBody:      '#111827',
  chipStroke:    '#374151',
  tooltipBg:     'rgba(0,0,0,0.85)',
  tooltipText:   'white',
  panelBg:       'rgba(47, 54, 64, 0.9)',
  panelIcon:     'white',
} : {
  bg:            '#f0f2f5',
  // WHITE board with a crisp light shadow border
  boardBody:     '#ffffff',
  // Dark holes for maximum contrast against white board
  hole:          '#2d3436',
  // The trench (center gap) matches the board white
  trench:        '#e8ecef',
  // Chip body: dark so chips stand out clearly on white board
  chipBody:      '#2d3436',
  chipStroke:    '#1e272e',
  tooltipBg:     'rgba(255,255,255,0.97)',
  tooltipText:   '#2d3436',
  panelBg:       'rgba(255, 255, 255, 0.95)',
  panelIcon:     '#2d3436',
};

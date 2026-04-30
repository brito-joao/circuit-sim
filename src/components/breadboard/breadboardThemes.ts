export const getTheme = (isDarkMode: boolean) => isDarkMode ? {
  bg: '#1e272e', boardBody: '#ffffff', hole: '#2f3640', trench: '#dcdde1',
  discoveryBg: '#2f3640', discoveryText: '#f5f6fa', discoveryOff: '#576574',
  chipBody: '#111', tooltipBg: 'rgba(0,0,0,0.85)', tooltipText: 'white',
  panelBg: 'rgba(47, 54, 64, 0.8)', panelIcon: 'white'
} : {
  bg: '#f1f2f6', boardBody: '#ffffff', hole: '#7f8fa6', trench: '#dcdde1',
  discoveryBg: '#f1f2f6', discoveryText: '#2d3436', discoveryOff: '#b2bec3',
  chipBody: '#2d3436', tooltipBg: 'rgba(255,255,255,0.95)', tooltipText: '#2d3436',
  panelBg: 'rgba(255, 255, 255, 0.9)', panelIcon: '#2d3436'
};

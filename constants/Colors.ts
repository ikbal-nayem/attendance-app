// New Fancy Color Scheme

const tintColorLight = '#007AFF'; // Vibrant Blue
const tintColorDark = '#0A84FF'; // Lighter Blue for Dark Mode

export default {
  light: {
    primary: '#007AFF', // Vibrant Blue
    primaryLight: '#58AFFF', // Lighter shade for hover/active states if needed
    primaryDark: '#0056B3', // Darker shade if needed
    secondary: '#FF9500', // Orange
    secondaryLight: '#FFB340',
    secondaryDark: '#CC7A00',
    accent: '#34C759', // Green
    accentLight: '#6EE089',
    accentDark: '#248A3D',
    success: '#34C759', // Green
    warning: '#FFCC00', // Yellow
    error: '#FF3B30', // Red
    text: '#1C1C1E', // Almost Black
    subtext: '#8A8A8E', // Medium Grey
    background: '#F2F2F7', // Very Light Grey (iOS style)
    card: '#FFFFFF', // White
    border: '#D1D1D6', // Light Grey
    tint: tintColorLight,
    tabIconDefault: '#8A8A8E', // Medium Grey
    tabIconSelected: tintColorLight,
    inputBackground: '#FFFFFF', // White
    inputBorder: '#C7C7CC', // Slightly darker grey for input borders
    inputFocusBorder: tintColorLight, // Use primary color for focus
    statusBar: 'dark', // Dark text/icons on light background
  },
  dark: {
    primary: '#0A84FF', // Lighter Blue for Dark Mode
    primaryLight: '#5ABEFF',
    primaryDark: '#0060D1',
    secondary: '#FF9F0A', // Lighter Orange
    secondaryLight: '#FFBC57',
    secondaryDark: '#D18000',
    accent: '#30D158', // Lighter Green
    accentLight: '#66EAAA',
    accentDark: '#219640',
    success: '#30D158', // Lighter Green
    warning: '#FFD60A', // Lighter Yellow
    error: '#FF453A', // Lighter Red
    text: '#FFFFFF', // White
    subtext: '#8D8D93', // Lighter Grey
    background: '#000000', // Black (iOS style)
    card: '#1C1C1E', // Almost Black
    border: '#3A3A3C', // Dark Grey
    tint: tintColorDark,
    tabIconDefault: '#8D8D93', // Lighter Grey
    tabIconSelected: tintColorDark,
    inputBackground: '#1C1C1E', // Almost Black
    inputBorder: '#3A3A3C', // Dark Grey
    inputFocusBorder: tintColorDark, // Use primary color for focus
    statusBar: 'light', // Light text/icons on dark background
  },
};

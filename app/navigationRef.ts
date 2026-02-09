let setScreenRef: ((screen: string, data?: any) => void) | null = null;

export const registerSetScreen = (fn: (screen: string, data?: any) => void) => {
  setScreenRef = fn;
};

export const navigateTo = (screen: string, data?: any) => {
  if (setScreenRef) setScreenRef(screen, data);
};
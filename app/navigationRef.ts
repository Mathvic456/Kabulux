let setScreenRef: ((screen: string) => void) | null = null;

export const registerSetScreen = (fn: (screen: string) => void) => {
  setScreenRef = fn;
};

export const navigateTo = (screen: string) => {
  if (setScreenRef) setScreenRef(screen);
};
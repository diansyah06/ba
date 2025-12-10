export const getDigitalSignature = (data: string): string => {
  return `SIG-${Date.now()}-${data}-${Math.floor(Math.random() * 10000)}`;
};

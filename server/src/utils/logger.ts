export const logger = {
  info: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error);
  },
  
  warn: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.debug(`[${timestamp}] DEBUG: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  },
};

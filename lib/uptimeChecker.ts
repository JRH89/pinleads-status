export interface UptimeCheck {
  timestamp: number;
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}

export async function checkUptime(url: string): Promise<UptimeCheck> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`Uptime check for ${url}: status=${response.status}, ok=${response.ok}`);
    
    if (response.ok) {
      return {
        timestamp: Date.now(),
        status: 'up',
        responseTime,
      };
    } else {
      return {
        timestamp: Date.now(),
        status: 'down',
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      timestamp: Date.now(),
      status: 'down',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

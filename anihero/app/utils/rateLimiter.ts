class RateLimiter {
    private queue: (() => Promise<any>)[] = [];
    private isProcessing = false;
    private lastRequestTime = 0;
    private readonly minInterval: number;
  
    constructor(requestsPerSecond: number) {
      this.minInterval = 1000 / requestsPerSecond;
    }
  
    async enqueue<T>(task: () => Promise<T>): Promise<T> {
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
          try {
            const result = await task();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        this.processQueue();
      });
    }
  
    private async processQueue() {
      if (this.isProcessing) return;
      this.isProcessing = true;
  
      while (this.queue.length > 0) {
        const now = Date.now();
        const timeToWait = Math.max(0, this.lastRequestTime + this.minInterval - now);
        
        if (timeToWait > 0) {
          await new Promise(resolve => setTimeout(resolve, timeToWait));
        }
  
        const task = this.queue.shift();
        if (task) {
          this.lastRequestTime = Date.now();
          await task();
        }
      }
  
      this.isProcessing = false;
    }
  }
  
  export const jikanRateLimiter = new RateLimiter(1); // 1 request per second for Jikan API
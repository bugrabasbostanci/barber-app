/**
 * Caching service for API responses and data management
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  serialize?: boolean; // Whether to serialize complex objects
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes
  private maxSize: number = 100;
  private accessTimes: Map<string, number> = new Map();

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data: data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      key
    };

    // Evict expired entries and maintain size limit
    this.cleanup();

    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.accessTimes.set(key, Date.now());
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.delete(key);
      return null;
    }

    // Update access time for LRU
    this.accessTimes.set(key, Date.now());
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    this.accessTimes.delete(key);
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessTimes.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get or set pattern
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }

  // Memoization helper
  memoize<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    keyGenerator?: (...args: TArgs) => string,
    ttl?: number
  ) {
    const generateKey = keyGenerator || ((...args: TArgs) => JSON.stringify(args));
    
    return async (...args: TArgs): Promise<TReturn> => {
      const key = `memoized:${fn.name}:${generateKey(...args)}`;
      return this.getOrSet(key, () => fn(...args), ttl);
    };
  }

  // Invalidate by prefix
  invalidateByPrefix(prefix: string): void {
    const keysToDelete = this.keys().filter(key => key.startsWith(prefix));
    keysToDelete.forEach(key => this.delete(key));
  }

  // Invalidate by pattern
  invalidateByPattern(pattern: RegExp): void {
    const keysToDelete = this.keys().filter(key => pattern.test(key));
    keysToDelete.forEach(key => this.delete(key));
  }

  // Update TTL for existing entry
  updateTTL(key: string, ttl: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    entry.ttl = ttl;
    entry.timestamp = Date.now();
    return true;
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestEntry?: { key: string; age: number };
    newestEntry?: { key: string; age: number };
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    let oldest: CacheEntry<any> | undefined;
    let newest: CacheEntry<any> | undefined;

    entries.forEach(([key, entry]) => {
      if (!oldest || entry.timestamp < oldest.timestamp) {
        oldest = entry;
      }
      if (!newest || entry.timestamp > newest.timestamp) {
        newest = entry;
      }
    });

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need hit/miss tracking
      oldestEntry: oldest ? { key: oldest.key, age: now - oldest.timestamp } : undefined,
      newestEntry: newest ? { key: newest.key, age: now - newest.timestamp } : undefined
    };
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanup(): void {
    const expiredKeys: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestAccess = Date.now();

    this.accessTimes.forEach((accessTime, key) => {
      if (accessTime < oldestAccess) {
        oldestAccess = accessTime;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
}

// Local Storage Cache Service
export class LocalStorageCacheService extends CacheService {
  private storageKey: string;

  constructor(storageKey: string = 'cache', options: CacheOptions = {}) {
    super(options);
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  set<T>(key: string, data: T, ttl?: number): void {
    super.set(key, data, ttl);
    this.saveToStorage();
  }

  delete(key: string): boolean {
    const result = super.delete(key);
    this.saveToStorage();
    return result;
  }

  clear(): void {
    super.clear();
    this.removeFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.forEach((entry: CacheEntry<any>) => {
          if (!this.isLocalStorageExpired(entry)) {
            // Access protected cache through getter/setter
            this.set(entry.key, entry.data, entry.ttl);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // Get cache entries through public method
      const entries = this.keys().map(key => {
        const entry = this.get(key);
        const cacheEntry = this.getCacheEntry(key);
        return cacheEntry;
      }).filter(Boolean);
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private getCacheEntry(key: string): CacheEntry<any> | null {
    // Access cache through protected method
    return (this as any).cache.get(key) || null;
  }

  private removeFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to remove cache from localStorage:', error);
    }
  }

  private isLocalStorageExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
}

// Default cache instances
export const memoryCache = new CacheService({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100
});

export const persistentCache = new LocalStorageCacheService('barber-app-cache', {
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 50
});

// Cache decorators and utilities
export function cacheable<TArgs extends any[], TReturn>(
  cache: CacheService,
  ttl?: number,
  keyGenerator?: (...args: TArgs) => string
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: TArgs) => Promise<TReturn>>
  ) {
    const method = descriptor.value!;
    const generateKey = keyGenerator || ((...args: TArgs) => `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`);

    descriptor.value = async function (...args: TArgs): Promise<TReturn> {
      const key = generateKey(...args);
      return cache.getOrSet(key, () => method.apply(this, args), ttl);
    };

    return descriptor;
  };
}

export function cacheInvalidate(cache: CacheService, keyPattern: string | RegExp) {
  return function (
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
  ) {
    const method = descriptor.value!;

    descriptor.value = function (...args: any[]) {
      const result = method.apply(this, args);
      
      if (typeof keyPattern === 'string') {
        cache.invalidateByPrefix(keyPattern);
      } else {
        cache.invalidateByPattern(keyPattern);
      }

      return result;
    };

    return descriptor;
  };
}
/**
 * メモリキャッシュユーティリティ
 * 指定された有効期限でデータをキャッシュします
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // ミリ秒単位
}

export class MemoryCache {
  private static instance: MemoryCache;
  private cache: Map<string, CacheItem<any>> = new Map();
  
  // シングルトンパターン
  private constructor() {}
  
  public static getInstance(): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache();
    }
    return MemoryCache.instance;
  }
  
  /**
   * キャッシュからデータを取得
   * @param key キャッシュキー
   * @returns キャッシュされたデータ、または無効/存在しない場合はnull
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // 有効期限をチェック
    if (Date.now() - item.timestamp > item.expiresIn) {
      console.log(`Cache expired for: ${key}`);
      this.cache.delete(key);
      return null;
    }
    
    console.log(`Cache hit for: ${key}`);
    return item.data as T;
  }
  
  /**
   * データをキャッシュに保存
   * @param key キャッシュキー
   * @param data キャッシュするデータ
   * @param expiresIn 有効期限（ミリ秒）
   */
  set<T>(key: string, data: T, expiresIn: number = 30 * 60 * 1000): void {
    console.log(`Caching data for: ${key}, expires in: ${expiresIn}ms`);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }
  
  /**
   * キャッシュが有効かどうかをチェック
   * @param key キャッシュキー
   * @returns キャッシュが有効な場合はtrue
   */
  isValid(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    return Date.now() - item.timestamp <= item.expiresIn;
  }
  
  /**
   * キャッシュを削除
   * @param key キャッシュキー
   */
  remove(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * 有効期限が切れたすべてのアイテムを削除
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiresIn) {
        this.cache.delete(key);
      }
    }
  }
}

// キャッシュキー生成関数
export const generateCacheKey = (prefix: string, id: string): string => {
  return `${prefix}:${id}`;
};

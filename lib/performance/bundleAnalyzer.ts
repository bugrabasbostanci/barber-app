import React from 'react'

// Bundle analysis utility for development
export const bundleAnalysis = {
  // Track component lazy loading
  logComponentLoad: (componentName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Loaded component: ${componentName}`)
    }
  },

  // Track feature loading
  logFeatureLoad: (featureName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Loaded feature: ${featureName}`)
    }
  },

  // Monitor bundle size
  measureBundleImpact: (bundleName: string) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const startTime = performance.now()
      
      return {
        finish: () => {
          const endTime = performance.now()
          console.log(`⏱️ Bundle ${bundleName} loaded in ${endTime - startTime}ms`)
        }
      }
    }
    
    return { finish: () => {} }
  },

  // Track memory usage
  trackMemoryUsage: () => {
    if (typeof window !== 'undefined' && 'memory' in performance && process.env.NODE_ENV === 'development') {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
      if (memory) {
        console.log('💾 Memory usage:', {
          used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
          allocated: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
        })
      }
    }
  }
}

// Performance metrics collector
export const performanceMetrics = {
  // Core Web Vitals tracking
  trackLCP: () => {
    if (typeof window !== 'undefined') {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('🎯 LCP (Largest Contentful Paint):', entry)
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] })
    }
  },

  trackFID: () => {
    if (typeof window !== 'undefined') {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('👆 FID (First Input Delay):', entry)
        }
      }).observe({ entryTypes: ['first-input'] })
    }
  },

  trackCLS: () => {
    if (typeof window !== 'undefined') {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('📏 CLS (Cumulative Layout Shift):', entry)
        }
      }).observe({ entryTypes: ['layout-shift'] })
    }
  },

  // Initialize all tracking
  init: () => {
    if (process.env.NODE_ENV === 'development') {
      performanceMetrics.trackLCP()
      performanceMetrics.trackFID()
      performanceMetrics.trackCLS()
    }
  }
}

// HOC for measuring component performance
export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    const measurement = bundleAnalysis.measureBundleImpact(componentName)
    
    React.useEffect(() => {
      bundleAnalysis.logComponentLoad(componentName)
      measurement.finish()
      
      // Track memory after component load
      setTimeout(() => bundleAnalysis.trackMemoryUsage(), 100)
    }, [measurement])

    return React.createElement(Component, props)
  }
}
#!/usr/bin/env node

/**
 * Hybrid System Performance Monitor
 * Tracks response times, cache hit rates, and system performance
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class HybridSystemMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      aiEnhancedCount: 0,
      totalRestaurants: 0
    };
    this.responseTimes = [];
  }

  async getCacheStats() {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'get-stats' }
      });

      if (error) {
        console.error('Failed to get cache stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }

  async testHybridSystem(location = 'New York, NY') {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('hybrid-restaurants', {
        body: {
          action: 'search-restaurants',
          location,
          radius: 5000,
          limit: 10,
          useHybrid: true
        }
      });

      const responseTime = Date.now() - startTime;
      this.responseTimes.push(responseTime);

      if (error) {
        this.metrics.failedRequests++;
        console.error('❌ Hybrid system test failed:', error);
        return null;
      }

      if (!data || !data.restaurants) {
        this.metrics.failedRequests++;
        console.error('❌ No data returned from hybrid system');
        return null;
      }

      this.metrics.successfulRequests++;
      this.metrics.totalRequests++;
      this.metrics.totalRestaurants += data.restaurants.length;
      this.metrics.aiEnhancedCount += data.restaurants.filter(r => r.processedByChatGPT).length;

      // Update average response time
      this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

      return {
        restaurants: data.restaurants,
        responseTime,
        aiEnhancedCount: data.restaurants.filter(r => r.processedByChatGPT).length
      };
    } catch (error) {
      this.metrics.failedRequests++;
      this.metrics.totalRequests++;
      console.error('❌ Hybrid system test failed:', error);
      return null;
    }
  }

  async runPerformanceTest(iterations = 5) {
    console.log(`🚀 Running performance test with ${iterations} iterations...\n`);

    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      console.log(`Test ${i + 1}/${iterations}...`);
      const result = await this.testHybridSystem();
      if (result) {
        results.push(result);
        console.log(`✅ Response time: ${result.responseTime}ms, AI enhanced: ${result.aiEnhancedCount}/${result.restaurants.length}`);
      } else {
        console.log('❌ Test failed');
      }
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  async getSystemHealth() {
    console.log('🏥 Checking system health...\n');

    // Test cache manager
    const cacheStats = await this.getCacheStats();
    if (cacheStats) {
      console.log('📊 Cache Statistics:');
      console.log(`   Total entries: ${cacheStats.total_entries || 0}`);
      console.log(`   Cache hits: ${cacheStats.cache_hits || 0}`);
      console.log(`   Cache misses: ${cacheStats.cache_misses || 0}`);
      console.log(`   Hit rate: ${cacheStats.hit_rate || 0}%`);
    }

    // Test hybrid system
    const hybridResult = await this.testHybridSystem();
    if (hybridResult) {
      console.log('\n🔧 Hybrid System Health:');
      console.log(`   Response time: ${hybridResult.responseTime}ms`);
      console.log(`   Restaurants returned: ${hybridResult.restaurants.length}`);
      console.log(`   AI enhanced: ${hybridResult.aiEnhancedCount}`);
      console.log(`   AI enhancement rate: ${Math.round((hybridResult.aiEnhancedCount / hybridResult.restaurants.length) * 100)}%`);
    }

    // Overall metrics
    console.log('\n📈 Overall Metrics:');
    console.log(`   Total requests: ${this.metrics.totalRequests}`);
    console.log(`   Success rate: ${this.metrics.totalRequests > 0 ? Math.round((this.metrics.successfulRequests / this.metrics.totalRequests) * 100) : 0}%`);
    console.log(`   Average response time: ${Math.round(this.metrics.averageResponseTime)}ms`);
    console.log(`   Total restaurants processed: ${this.metrics.totalRestaurants}`);
    console.log(`   Total AI enhanced: ${this.metrics.aiEnhancedCount}`);
  }

  async runContinuousMonitoring(intervalMs = 30000) {
    console.log(`🔄 Starting continuous monitoring (interval: ${intervalMs}ms)...\n`);
    
    let iteration = 1;
    
    const monitor = async () => {
      console.log(`\n--- Monitoring Run ${iteration} ---`);
      console.log(`Time: ${new Date().toLocaleTimeString()}`);
      
      await this.getSystemHealth();
      
      iteration++;
    };

    // Run initial check
    await monitor();
    
    // Set up continuous monitoring
    setInterval(monitor, intervalMs);
  }
}

async function main() {
  const monitor = new HybridSystemMonitor();
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'test':
      const iterations = parseInt(args[1]) || 5;
      await monitor.runPerformanceTest(iterations);
      break;
      
    case 'health':
      await monitor.getSystemHealth();
      break;
      
    case 'monitor':
      const interval = parseInt(args[1]) || 30000;
      await monitor.runContinuousMonitoring(interval);
      break;
      
    default:
      console.log('Usage:');
      console.log('  node monitor-hybrid-performance.js test [iterations]  - Run performance test');
      console.log('  node monitor-hybrid-performance.js health            - Check system health');
      console.log('  node monitor-hybrid-performance.js monitor [interval] - Start continuous monitoring');
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Monitor failed:', error);
    process.exit(1);
  });
}

module.exports = HybridSystemMonitor; 
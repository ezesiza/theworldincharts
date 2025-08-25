
import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as d3 from 'd3';

interface RedditPost {
  title: string;
  subreddit: string;
  score: number;
  ups: number;
  downs: number;
  num_comments: number;
  created_utc: number;
  author: string;
  url: string;
  selftext: string;
  is_video: boolean;
  over_18: boolean;
}

interface ChartData {
  name: string;
  title: string;
  score: number;
  comments: number;
}

interface SubredditData {
  name: string;
  value: number;
  posts: number;
}

@Component({
  selector: 'reddit-data-dashboard',
  templateUrl: './reddit-data-dashboard.component.html',
  styleUrls: ['./reddit-data-dashboard.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class RedditDataDashboardComponent implements OnInit, AfterViewInit {
  constructor(private http: HttpClient) { }

  loading = true;
  error = false;
  errorMessage = '';
  loadingMessage = 'Loading Reddit data...';
  posts: RedditPost[] = [];
  scoreData: ChartData[] = [];
  subredditChartData: SubredditData[] = [];
  engagementData: any[] = [];
  colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  hoverColors = ['#FF5252', '#26A69A', '#2196F3', '#66BB6A', '#FFD54F', '#BA68C8', '#4DB6AC', '#FFB74D'];

  // Cache configuration
  private readonly CACHE_KEY = 'reddit_data_cache';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly SESSION_CACHE_KEY = 'reddit_data_session';
  private readonly SESSION_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
  private inMemoryCache: { data: any; timestamp: number } | null = null;

  // Fixed: Made Math property accessible
  Math = Math;

  // Cache utility methods
  private getCachedData(): any | null {
    // Check in-memory cache first (fastest)
    if (this.inMemoryCache && this.isCacheValid(this.inMemoryCache.timestamp, this.CACHE_DURATION)) {
      console.log('Using in-memory cached data');
      return this.inMemoryCache.data;
    }

    // Check sessionStorage (medium speed)
    const sessionData = this.getSessionCache();
    if (sessionData) {
      console.log('Using session cached data');
      this.inMemoryCache = { data: sessionData, timestamp: Date.now() };
      return sessionData;
    }

    // Check localStorage (slowest but persistent)
    const localData = this.getLocalCache();
    if (localData) {
      console.log('Using local cached data');
      this.inMemoryCache = { data: localData, timestamp: Date.now() };
      return localData;
    }

    return null;
  }

  private setCache(data: any): void {
    const timestamp = Date.now();

    // Set in-memory cache
    this.inMemoryCache = { data, timestamp };

    // Set session cache
    try {
      sessionStorage.setItem(this.SESSION_CACHE_KEY, JSON.stringify({ data, timestamp }));
    } catch (error) {
      console.warn('Failed to set session cache:', error);
    }

    // Set local cache
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({ data, timestamp }));
    } catch (error) {
      console.warn('Failed to set local cache:', error);
    }
  }

  private getSessionCache(): any | null {
    try {
      const cached = sessionStorage.getItem(this.SESSION_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (this.isCacheValid(timestamp, this.SESSION_CACHE_DURATION)) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to read session cache:', error);
    }
    return null;
  }

  private getLocalCache(): any | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (this.isCacheValid(timestamp, this.CACHE_DURATION)) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to read local cache:', error);
    }
    return null;
  }

  private isCacheValid(timestamp: number, duration: number): boolean {
    return Date.now() - timestamp < duration;
  }

  clearCache(): void {
    this.inMemoryCache = null;
    try {
      sessionStorage.removeItem(this.SESSION_CACHE_KEY);
      localStorage.removeItem(this.CACHE_KEY);
      console.log('Cache cleared successfully');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  showCacheInfo(): void {
    const inMemoryInfo = this.inMemoryCache ? {
      timestamp: new Date(this.inMemoryCache.timestamp).toLocaleString(),
      age: this.formatCacheAge(Date.now() - this.inMemoryCache.timestamp)
    } : null;

    const sessionInfo = this.getSessionCacheInfo();
    const localInfo = this.getLocalCacheInfo();

    const cacheInfo = {
      inMemory: inMemoryInfo,
      session: sessionInfo,
      local: localInfo
    };

    console.log('Cache Information:', cacheInfo);
    alert(`Cache Information:\n\nIn-Memory: ${inMemoryInfo ? `${inMemoryInfo.age} (${inMemoryInfo.timestamp})` : 'None'}\nSession: ${sessionInfo ? sessionInfo : 'None'}\nLocal: ${localInfo ? localInfo : 'None'}`);
  }

  private getSessionCacheInfo(): string | null {
    try {
      const cached = sessionStorage.getItem(this.SESSION_CACHE_KEY);
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        return this.formatCacheAge(Date.now() - timestamp);
      }
    } catch (error) {
      console.warn('Failed to read session cache info:', error);
    }
    return null;
  }

  private getLocalCacheInfo(): string | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        return this.formatCacheAge(Date.now() - timestamp);
      }
    } catch (error) {
      console.warn('Failed to read local cache info:', error);
    }
    return null;
  }

  private processRedditData(data: any): void {
    // Extract posts from the response
    if (data && data.data && data.data.children) {
      this.posts = data.data.children
        .filter((child: any) => child.kind === 't3') // Only posts, not comments
        .map((child: any) => child.data)
        .filter((post: any) => !post.over_18) // Filter out NSFW content
        .slice(0, 25); // Limit to 25 posts for better performance

      // Cache the processed data
      this.setCache(data);

      this.prepareChartData();
      this.loading = false;
      this.error = false;
      this.errorMessage = '';

      // Show success message briefly
      this.loadingMessage = 'Data loaded successfully! Rendering charts...';
      setTimeout(() => {
        this.loadingMessage = '';
      }, 2000);

      // Render charts after data loads
      setTimeout(() => {
        this.renderEnhancedBarChart();
        this.renderEnhancedPieChart();
        this.renderEnhancedScatterPlot();
        this.renderEnhancedLineChart();
      }, 100);
    } else {
      throw new Error('Invalid data structure from Reddit API');
    }
  }

  // Fixed: Removed invalid property declarations and moved to getter methods
  get totalComments(): string {
    return this.formatNumber(this.posts.reduce((sum, p) => sum + p.num_comments, 0));
  }

  get averageScore(): string {
    const avg = this.posts.length > 0 ? this.posts.reduce((sum, p) => sum + p.score, 0) / this.posts.length : 0;
    return this.formatNumber(Math.round(avg));
  }

  get totalScore(): string {
    return this.formatNumber(this.posts.reduce((sum, p) => sum + p.score, 0));
  }

  get mostDiscussed(): string {
    const sorted = [...this.posts].sort((a, b) => b.num_comments - a.num_comments);
    return sorted.length > 0 ? sorted[0].title.substring(0, 60) : '';
  }

  get commentsCount(): number {
    const sorted = [...this.posts].sort((a, b) => b.num_comments - a.num_comments);
    return sorted.length > 0 ? sorted[0].num_comments : 0;
  }

  get commentsScore(): string {
    const sorted = [...this.posts].sort((a, b) => b.num_comments - a.num_comments);
    const score = sorted.length > 0 ? sorted[0].score : 0;
    return this.formatNumber(score);
  }

  get averageEngRatio(): string {
    if (this.posts.length === 0) return '0.0';
    const avg = this.posts.reduce((sum, p) => sum + (p.score / Math.max(p.num_comments, 1)), 0) / this.posts.length;
    return avg.toFixed(1);
  }

  get totalInteractions(): string {
    return this.formatNumber(this.posts.reduce((sum, p) => sum + p.score + p.num_comments, 0));
  }

  ngOnInit(): void {
    this.loadRedditData();
  }

  ngAfterViewInit(): void {
    // Charts will be rendered after data loads
  }

  refreshData(): void {
    // Force refresh by clearing cache and loading fresh data
    this.clearCache();
    this.loadRedditData();
  }

  forceRefresh(): void {
    // Force refresh without clearing cache (for debugging)
    this.loadingMessage = 'Force refreshing data...';
    this.loadRedditData();
  }

  hasCachedData(): boolean {
    return this.getCachedData() !== null;
  }

  getCacheAge(): string {
    if (this.inMemoryCache) {
      const age = Date.now() - this.inMemoryCache.timestamp;
      return this.formatCacheAge(age);
    }
    return '';
  }

  private formatCacheAge(age: number): string {
    const minutes = Math.floor(age / (1000 * 60));
    const seconds = Math.floor((age % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  }

  private loadRedditData(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    this.loadingMessage = 'Loading Reddit data...';

    // Check cache first
    const cachedData = this.getCachedData();
    if (cachedData) {
      console.log('Using cached Reddit data');
      this.loadingMessage = 'Loading cached data...';

      // Process cached data
      this.processRedditData(cachedData);
      return;
    }

    this.loadingMessage = 'Fetching fresh data from Reddit...';

    // Use a CORS proxy to access Reddit API
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const redditUrl = 'https://api.reddit.com/r/popular.json';

    // Alternative: Use a different CORS proxy or try direct access first
    this.http.get(redditUrl, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      })
    }).subscribe({
      next: (data: any) => {
        console.log('Reddit API Response:', data);

        // Process the API response
        this.processRedditData(data);
      },
      error: (error) => {
        console.error('Error fetching Reddit data:', error);

        // Try alternative approach with CORS proxy
        this.loadRedditDataWithProxy();
      }
    });
  }

  private loadRedditDataWithProxy(): void {
    // Try multiple CORS proxy services
    const proxyServices = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/',
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest='
    ];

    this.tryProxyService(proxyServices, 0);
  }

  private tryProxyService(proxyServices: string[], index: number): void {
    if (index >= proxyServices.length) {
      // All proxy services failed, fallback to mock data
      console.error('All proxy services failed');
      this.loading = false;
      this.error = true;
      this.errorMessage = `Unable to access Reddit API due to CORS restrictions. This is a browser security feature that prevents websites from making direct requests to external APIs. We've tried ${proxyServices.length} proxy services but they're all unavailable or blocked. Using mock data instead.`;
      this.loadMockData();
      return;
    }

    const proxy = proxyServices[index];
    const redditUrl = encodeURIComponent('https://api.reddit.com/r/popular.json');

    console.log(`Trying proxy service ${index + 1}: ${proxy}`);
    this.loadingMessage = `Trying proxy service ${index + 1}... (${proxy.replace('https://', '').split('/')[0]})`;

    // Add timeout to prevent hanging on slow proxy services
    const timeout = setTimeout(() => {
      console.error(`Proxy service ${index + 1} timed out`);
      this.tryProxyService(proxyServices, index + 1);
    }, 10000); // 10 second timeout

    this.http.get(proxy + redditUrl, { responseType: 'text' }).subscribe({
      next: (response: string) => {
        console.log(`Proxy response received from ${proxy}`);

        // Try to parse the response as JSON
        let data: any;
        try {
          data = JSON.parse(response);
        } catch (parseError) {
          clearTimeout(timeout); // Clear timeout before trying next proxy
          console.error(`Failed to parse response as JSON from ${proxy}:`, parseError);
          // Response is not valid JSON, try next proxy
          this.tryProxyService(proxyServices, index + 1);
          return;
        }

        console.log(`Reddit API Response (via ${proxy}):`, data);

        // Validate the response structure
        if (data && data.data && data.data.children && Array.isArray(data.data.children)) {
          clearTimeout(timeout); // Clear timeout on success

          // Process the proxy response
          this.processRedditData(data);
        } else {
          clearTimeout(timeout); // Clear timeout before trying next proxy
          console.error(`Invalid data structure from proxy ${proxy}:`, data);
          // Try next proxy service
          this.tryProxyService(proxyServices, index + 1);
        }
      },
      error: (proxyError) => {
        clearTimeout(timeout); // Clear timeout on error
        console.error(`Proxy service ${index + 1} failed:`, proxyError);
        // Try next proxy service
        this.tryProxyService(proxyServices, index + 1);
      }
    });
  }

  private loadMockData(): void {
    setTimeout(() => {
      const mockRedditResponse = {
        "kind": "Listing",
        "data": {
          "after": "t3_example",
          "dist": 25,
          "children": [
            {
              "kind": "t3",
              "data": {
                "title": "TIL: Octopuses have three hearts and blue blood",
                "subreddit": "todayilearned",
                "score": 15420,
                "ups": 15420,
                "downs": 0,
                "num_comments": 342,
                "created_utc": 1692115200,
                "author": "science_lover",
                "url": "https://example.com/octopus-facts",
                "selftext": "",
                "is_video": false,
                "over_18": false
              }
            },
            {
              "kind": "t3",
              "data": {
                "title": "My dog learned to open doors, now nowhere is safe",
                "subreddit": "funny",
                "score": 8934,
                "ups": 8934,
                "downs": 0,
                "num_comments": 156,
                "created_utc": 1692108000,
                "author": "dogowner123",
                "url": "https://i.reddit.com/funny/dog.jpg",
                "selftext": "",
                "is_video": false,
                "over_18": false
              }
            },
            {
              "kind": "t3",
              "data": {
                "title": "New breakthrough in quantum computing announced",
                "subreddit": "technology",
                "score": 12567,
                "ups": 12567,
                "downs": 0,
                "num_comments": 489,
                "created_utc": 1692101400,
                "author": "tech_enthusiast",
                "url": "https://example.com/quantum-breakthrough",
                "selftext": "Researchers at MIT have achieved a new milestone...",
                "is_video": false,
                "over_18": false
              }
            },
            {
              "kind": "t3",
              "data": {
                "title": "Amazing sunset photo from my backyard",
                "subreddit": "pics",
                "score": 6789,
                "ups": 6789,
                "downs": 0,
                "num_comments": 89,
                "created_utc": 1692094800,
                "author": "photographer42",
                "url": "https://i.reddit.com/pics/sunset.jpg",
                "selftext": "",
                "is_video": false,
                "over_18": false
              }
            },
            {
              "kind": "t3",
              "data": {
                "title": "LPT: Use a tennis ball to massage sore muscles",
                "subreddit": "LifeProTips",
                "score": 4321,
                "ups": 4321,
                "downs": 0,
                "num_comments": 67,
                "created_utc": 1692088200,
                "author": "fitness_guru",
                "url": "",
                "selftext": "Just roll the tennis ball over sore spots for instant relief...",
                "is_video": false,
                "over_18": false
              }
            },
            {
              "kind": "t3",
              "data": {
                "title": "Game dev here, just released my indie game after 3 years",
                "subreddit": "gaming",
                "score": 9876,
                "ups": 9876,
                "downs": 0,
                "num_comments": 234,
                "created_utc": 1692081600,
                "author": "indie_dev_dreams",
                "url": "https://store.example.com/mygame",
                "selftext": "",
                "is_video": false,
                "over_18": false
              }
            },
            {
              "kind": "t3",
              "data": {
                "title": "Climate change discussion megathread",
                "subreddit": "worldnews",
                "score": 7654,
                "ups": 7654,
                "downs": 0,
                "num_comments": 1247,
                "created_utc": 1692075000,
                "author": "news_moderator",
                "url": "",
                "selftext": "Weekly discussion thread for climate change topics...",
                "is_video": false,
                "over_18": false
              }
            },
            {
              "kind": "t3",
              "data": {
                "title": "My grandmother's 100-year-old cookie recipe",
                "subreddit": "food",
                "score": 5432,
                "ups": 5432,
                "downs": 0,
                "num_comments": 178,
                "created_utc": 1692068400,
                "author": "baker_grandchild",
                "url": "https://i.reddit.com/food/cookies.jpg",
                "selftext": "",
                "is_video": false,
                "over_18": false
              }
            },
            {
              "kind": "t3",
              "data": {
                "title": "ELI5: Why do we get brain freeze from cold food?",
                "subreddit": "explainlikeimfive",
                "score": 3456,
                "ups": 3456,
                "downs": 0,
                "num_comments": 123,
                "created_utc": 1692061800,
                "author": "curious_mind",
                "url": "",
                "selftext": "I always wondered about this...",
                "is_video": false,
                "over_18": false
              }
            },
            {
              "kind": "t3",
              "data": {
                "title": "My city's transformation over 20 years",
                "subreddit": "mildlyinteresting",
                "score": 7890,
                "ups": 7890,
                "downs": 0,
                "num_comments": 198,
                "created_utc": 1692055200,
                "author": "urban_explorer",
                "url": "https://i.reddit.com/before-after.jpg",
                "selftext": "",
                "is_video": false,
                "over_18": false
              }
            }
          ]
        }
      };

      this.posts = mockRedditResponse.data.children.map(child => child.data);
      this.prepareChartData();
      this.loading = false;

      // Render charts after view is initialized
      setTimeout(() => {
        this.renderEnhancedBarChart();
        this.renderEnhancedPieChart();
        this.renderEnhancedScatterPlot();
        this.renderEnhancedLineChart();
      }, 100);
    }, 1000);
  }

  private prepareChartData(): void {
    // Prepare score data
    this.scoreData = this.posts.map((post, index) => ({
      name: `Post ${index + 1}`,
      title: post.title.substring(0, 40) + (post.title.length > 40 ? '...' : ''),
      score: post.score,
      comments: post.num_comments
    }));

    // Prepare subreddit data
    const subredditCounts = this.posts.reduce((acc: { [key: string]: number }, post) => {
      acc[post.subreddit] = (acc[post.subreddit] || 0) + 1;
      return acc;
    }, {});

    this.subredditChartData = Object.entries(subredditCounts).map(([name, value]) => ({
      name,
      value,
      posts: value
    }));

    // Prepare engagement data
    this.engagementData = this.posts.map((post, index) => ({
      name: `Post ${index + 1}`,
      score: post.score,
      comments: post.num_comments,
      ratio: post.num_comments > 0 ? (post.score / post.num_comments).toFixed(1) : 0
    }));
  }

  private createTooltip(): d3.Selection<HTMLDivElement, unknown, HTMLElement, any> {
    return d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '12px')
      .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.3)')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('max-width', '300px')
      .style('line-height', '1.4');
  }

  private renderEnhancedBarChart(): void {
    const margin = { top: 40, right: 30, bottom: 80, left: 80 };
    const width = 550 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select('#bar-chart').selectAll('*').remove();

    const svg = d3.select('#bar-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
      .style('border-radius', '12px')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tooltip
    const tooltip = this.createTooltip();

    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(this.scoreData.map(d => d.name))
      .padding(0.3);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('fill', 'white')
      .style('font-weight', '500');

    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(this.scoreData, d => d.score) || 0])
      .range([height, 0]);

    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', 'white')
      .style('font-weight', '500');

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Create gradient for bars
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'barGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#FF6B6B')
      .attr('stop-opacity', 0.8);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FF8E53')
      .attr('stop-opacity', 1);

    // Bars with hover effects
    const component = this; // Store reference for use in callbacks

    svg.selectAll('rect')
      .data(this.scoreData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.name) || 0)
      .attr('y', height)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', 'url(#barGradient)')
      .attr('rx', 4)
      .attr('ry', 4)
      .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))')
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.05)')
          .style('filter', 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))');

        tooltip.transition()
          .duration(200)
          .style('opacity', 1);

        tooltip.html(`
          <strong>${d.title}</strong><br/>
          Score: <span style="color: #4CAF50">${d.score.toLocaleString()}</span><br/>
          Comments: <span style="color: #FF9800">${d.comments}</span><br/>
          Engagement Ratio: <span style="color: #2196F3">${(d.score / Math.max(d.comments, 1)).toFixed(1)}</span>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)')
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))');

        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('y', d => y(d.score))
      .attr('height', d => height - y(d.score));

    // Chart title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text('Post Scores Distribution');
  }

  private renderEnhancedPieChart(): void {
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 20;

    // Clear previous chart
    d3.select('#pie-chart').selectAll('*').remove();

    const svg = d3.select('#pie-chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
      .style('border-radius', '12px')
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const tooltip = this.createTooltip();

    const color = d3.scaleOrdinal()
      .domain(this.subredditChartData.map(d => d.name))
      .range(this.colors);

    const pie = d3.pie<SubredditData>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<any, d3.PieArcDatum<SubredditData>>()
      .innerRadius(40)
      .outerRadius(radius);

    const arcHover = d3.arc<any, d3.PieArcDatum<SubredditData>>()
      .innerRadius(40)
      .outerRadius(radius + 15);

    const arcs = svg.selectAll('arc')
      .data(pie(this.subredditChartData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    const component = this; // Store reference for use in callbacks

    // Add paths with animations
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.name) as string)
      .style('stroke', 'white')
      .style('stroke-width', '2px')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))')
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover as any)
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))');

        tooltip.transition()
          .duration(200)
          .style('opacity', 1);

        tooltip.html(`
          <strong>r/${d.data.name}</strong><br/>
          Posts: <span style="color: #4CAF50">${d.data.value}</span><br/>
          Percentage: <span style="color: #FF9800">${((d.data.value / component.posts.length) * 100).toFixed(1)}%</span>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc as any)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      })
      .transition()
      .duration(1000)
      .attrTween('d', function (d: any) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t: number) {
          return arc(interpolate(t));
        };
      });

    // Add labels
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .text(d => d.data.value > 0 ? d.data.name : '')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.7)')
      .style('opacity', 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style('opacity', 1);

    // Chart title
    svg.append('text')
      .attr('x', 0)
      .attr('y', -height / 2 + 20)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text('Subreddit Distribution');
  }

  private renderEnhancedScatterPlot(): void {
    const margin = { top: 40, right: 30, bottom: 80, left: 80 };
    const width = 550 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select('#scatter-plot').selectAll('*').remove();

    const svg = d3.select('#scatter-plot')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)')
      .style('border-radius', '12px')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = this.createTooltip();

    // X scale
    const x = d3.scaleLinear()
      .domain([0, d3.max(this.posts, d => d.num_comments) || 0])
      .range([0, width]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('fill', 'white')
      .style('font-weight', '500');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text('Number of Comments');

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(this.posts, d => d.score) || 0])
      .range([height, 0]);

    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', 'white')
      .style('font-weight', '500');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text('Score');

    // Add grid
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Add dots with enhanced styling
    svg.append('g')
      .selectAll('circle')
      .data(this.posts)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.num_comments))
      .attr('cy', d => y(d.score))
      .attr('r', 0)
      .attr('fill', '#FFE082')
      .style('stroke', 'white')
      .style('stroke-width', '2px')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 12)
          .style('fill', '#FFC107')
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))');

        tooltip.transition()
          .duration(200)
          .style('opacity', 1);

        tooltip.html(`
          <strong>${d.title.substring(0, 50)}${d.title.length > 50 ? '...' : ''}</strong><br/>
          <span style="color: #81C784">Score: ${d.score.toLocaleString()}</span><br/>
          <span style="color: #FFB74D">Comments: ${d.num_comments}</span><br/>
          <span style="color: #64B5F6">Subreddit: r/${d.subreddit}</span><br/>
          <span style="color: #F06292">Author: u/${d.author}</span>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .style('fill', '#FFE082')
          .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('r', 8);

    // Chart title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text('Score vs Comments Correlation');
  }

  private renderEnhancedLineChart(): void {
    const margin = { top: 40, right: 30, bottom: 80, left: 80 };
    const width = 550 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select('#line-chart').selectAll('*').remove();

    const svg = d3.select('#line-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
      .style('border-radius', '12px')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = this.createTooltip();

    // X scale
    const x = d3.scaleBand()
      .domain(this.scoreData.map(d => d.name))
      .range([0, width])
      .padding(0.2);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('fill', 'white')
      .style('font-weight', '500');

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(this.scoreData, d => d.comments) || 0])
      .range([height, 0]);

    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', 'white')
      .style('font-weight', '500');

    // Add grid
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Line generator
    const line = d3.line<ChartData>()
      .x(d => (x(d.name) || 0) + x.bandwidth() / 2)
      .y(d => y(d.comments))
      .curve(d3.curveMonotoneX);

    // Add gradient for line
    const lineGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'lineGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', height);

    lineGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4FC3F7')
      .attr('stop-opacity', 1);

    lineGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#29B6F6')
      .attr('stop-opacity', 0.8);

    // Add area under the line
    const area = d3.area<ChartData>()
      .x(d => (x(d.name) || 0) + x.bandwidth() / 2)
      .y0(height)
      .y1(d => y(d.comments))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(this.scoreData)
      .attr('fill', 'url(#lineGradient)')
      .attr('opacity', 0.3)
      .attr('d', area);

    // Add the line
    const path = svg.append('path')
      .datum(this.scoreData)
      .attr('fill', 'none')
      .attr('stroke', '#29B6F6')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
      .attr('d', line);

    // Animate line drawing
    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Add interactive points
    svg.selectAll('circle')
      .data(this.scoreData)
      .enter()
      .append('circle')
      .attr('cx', d => (x(d.name) || 0) + x.bandwidth() / 2)
      .attr('cy', d => y(d.comments))
      .attr('r', 0)
      .attr('fill', '#FFF')
      .style('stroke', '#29B6F6')
      .style('stroke-width', '3px')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 10)
          .style('fill', '#FFD54F')
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))');

        tooltip.transition()
          .duration(200)
          .style('opacity', 1);

        tooltip.html(`
          <strong>${d.title}</strong><br/>
          Comments: <span style="color: #4CAF50">${d.comments}</span><br/>
          Score: <span style="color: #FF9800">${d.score.toLocaleString()}</span><br/>
          Engagement: <span style="color: #2196F3">${(d.score / Math.max(d.comments, 1)).toFixed(1)} score/comment</span>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6)
          .style('fill', '#FFF')
          .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      })
      .transition()
      .duration(800)
      .delay((d, i) => 2000 + i * 100)
      .attr('r', 6);

    // Chart title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text('Comment Activity Timeline');

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 60)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text('Posts');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text('Comments');
  }

  // Utility method to format numbers
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Utility method to get time ago
  getTimeAgo(timestamp: number): string {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 3600) {
      return Math.floor(diff / 60) + 'm ago';
    }
    if (diff < 86400) {
      return Math.floor(diff / 3600) + 'h ago';
    }
    return Math.floor(diff / 86400) + 'd ago';
  }

  // Get subreddit color
  getSubredditColor(subreddit: string): string {
    const index = this.subredditChartData.findIndex(s => s.name === subreddit);
    return this.colors[index % this.colors.length];
  }
}
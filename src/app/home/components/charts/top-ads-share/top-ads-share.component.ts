// top-ads-share.component.ts
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';

// Enhanced Interfaces for Complex Advertising Data
interface Creative {
  id: string;
  name: string;
  type: 'video' | 'display' | 'native' | 'rich_media';
  format: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  cvr: number;
  roas: number;
  viewability: number;
  completionRate?: number;
}

interface AdGroup {
  id: string;
  name: string;
  targetAudience: string;
  bidStrategy: 'cpc' | 'cpm' | 'cpa' | 'roas';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpa: number;
  roas: number;
  creatives: Creative[];
}

interface Campaign {
  id: string;
  name: string;
  objective: 'awareness' | 'consideration' | 'conversion';
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  totalBudget: number;
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpa: number;
  roas: number;
  adGroups: AdGroup[];
}

interface Channel {
  id: string;
  name: string;
  platform: 'google' | 'meta' | 'tiktok' | 'linkedin' | 'programmatic' | 'native';
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpa: number;
  roas: number;
  qualityScore: number;
  campaigns: Campaign[];
}

interface TimeSeriesData {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpa: number;
  roas: number;
}

interface AudienceSegment {
  id: string;
  name: string;
  size: number;
  spend: number;
  conversions: number;
  cpa: number;
  ltv: number;
  demographics: {
    ageGroup: string;
    gender: string;
    income: string;
  };
}

interface GeographicData {
  region: string;
  country: string;
  state?: string;
  city?: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number;
  roas: number;
}

interface DeviceData {
  device: 'mobile' | 'desktop' | 'tablet' | 'ctv';
  os: string;
  browser?: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpa: number;
}

interface AdvertisingData {
  overview: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    avgCtr: number;
    avgCpa: number;
    avgRoas: number;
    period: string;
  };
  channels: Channel[];
  timeSeries: TimeSeriesData[];
  audienceSegments: AudienceSegment[];
  geographicData: GeographicData[];
  deviceData: DeviceData[];
}

@Component({
  selector: 'top-ads-share',
  templateUrl: './top-ads-share.component.html',
  styleUrls: ['./top-ads-share.component.less']
})
export class TopAdsShareComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef;
  @ViewChild('tooltip', { static: true }) tooltip!: ElementRef;

  activeViz: string = 'overview';
  selectedChannel: Channel | null = null;
  selectedCampaign: Campaign | null = null;

  // Complex Advertising Data
  data: AdvertisingData = {
    overview: {
      totalSpend: 2847500,
      totalImpressions: 458750000,
      totalClicks: 6875420,
      totalConversions: 284750,
      totalRevenue: 14237500,
      avgCtr: 1.5,
      avgCpa: 10.0,
      avgRoas: 5.0,
      period: 'Q4 2025'
    },
    channels: [
      {
        id: 'ch-google',
        name: 'Google Ads',
        platform: 'google',
        spend: 985000,
        impressions: 175000000,
        clicks: 2625000,
        conversions: 105000,
        revenue: 5250000,
        ctr: 1.5,
        cpa: 9.38,
        roas: 5.33,
        qualityScore: 8.5,
        campaigns: [
          {
            id: 'camp-g1',
            name: 'Brand Awareness Q4',
            objective: 'awareness',
            status: 'active',
            startDate: '2025-10-01',
            endDate: '2025-12-31',
            totalBudget: 350000,
            spend: 325000,
            impressions: 85000000,
            reach: 42500000,
            frequency: 2.0,
            clicks: 850000,
            conversions: 25500,
            revenue: 1275000,
            ctr: 1.0,
            cpa: 12.75,
            roas: 3.92,
            adGroups: [
              {
                id: 'ag-g1-1',
                name: 'Tech Enthusiasts',
                targetAudience: 'In-market: Technology',
                bidStrategy: 'cpm',
                budget: 150000,
                spend: 142000,
                impressions: 38000000,
                clicks: 380000,
                conversions: 11400,
                ctr: 1.0,
                cpa: 12.46,
                roas: 4.0,
                creatives: [
                  { id: 'cr-1', name: 'Hero Video 30s', type: 'video', format: '16:9', impressions: 15000000, clicks: 165000, conversions: 4950, spend: 58000, revenue: 247500, ctr: 1.1, cvr: 3.0, roas: 4.27, viewability: 72, completionRate: 68 },
                  { id: 'cr-2', name: 'Product Showcase', type: 'display', format: '300x250', impressions: 12000000, clicks: 120000, conversions: 3600, spend: 44000, revenue: 180000, ctr: 1.0, cvr: 3.0, roas: 4.09, viewability: 65 },
                  { id: 'cr-3', name: 'Native Carousel', type: 'native', format: 'carousel', impressions: 11000000, clicks: 95000, conversions: 2850, spend: 40000, revenue: 142500, ctr: 0.86, cvr: 3.0, roas: 3.56, viewability: 78 }
                ]
              },
              {
                id: 'ag-g1-2',
                name: 'Business Decision Makers',
                targetAudience: 'B2B: C-Suite & Directors',
                bidStrategy: 'cpm',
                budget: 200000,
                spend: 183000,
                impressions: 47000000,
                clicks: 470000,
                conversions: 14100,
                ctr: 1.0,
                cpa: 12.98,
                roas: 3.85,
                creatives: [
                  { id: 'cr-4', name: 'Thought Leadership', type: 'video', format: '16:9', impressions: 20000000, clicks: 220000, conversions: 6600, spend: 82000, revenue: 330000, ctr: 1.1, cvr: 3.0, roas: 4.02, viewability: 70, completionRate: 62 },
                  { id: 'cr-5', name: 'Case Study Banner', type: 'display', format: '728x90', impressions: 15000000, clicks: 135000, conversions: 4050, spend: 55000, revenue: 202500, ctr: 0.9, cvr: 3.0, roas: 3.68, viewability: 58 },
                  { id: 'cr-6', name: 'Whitepaper Promo', type: 'rich_media', format: 'expandable', impressions: 12000000, clicks: 115000, conversions: 3450, spend: 46000, revenue: 172500, ctr: 0.96, cvr: 3.0, roas: 3.75, viewability: 75 }
                ]
              }
            ]
          },
          {
            id: 'camp-g2',
            name: 'Performance Max Conversions',
            objective: 'conversion',
            status: 'active',
            startDate: '2025-10-01',
            endDate: '2025-12-31',
            totalBudget: 400000,
            spend: 385000,
            impressions: 55000000,
            reach: 35000000,
            frequency: 1.57,
            clicks: 1100000,
            conversions: 55000,
            revenue: 2750000,
            ctr: 2.0,
            cpa: 7.0,
            roas: 7.14,
            adGroups: [
              {
                id: 'ag-g2-1',
                name: 'High Intent Shoppers',
                targetAudience: 'Purchase Intent Signals',
                bidStrategy: 'cpa',
                budget: 200000,
                spend: 192500,
                impressions: 27500000,
                clicks: 550000,
                conversions: 27500,
                ctr: 2.0,
                cpa: 7.0,
                roas: 7.14,
                creatives: [
                  { id: 'cr-7', name: 'Dynamic Product Feed', type: 'display', format: 'responsive', impressions: 15000000, clicks: 330000, conversions: 16500, spend: 115500, revenue: 825000, ctr: 2.2, cvr: 5.0, roas: 7.14, viewability: 68 },
                  { id: 'cr-8', name: 'Urgency Banner', type: 'display', format: '336x280', impressions: 12500000, clicks: 220000, conversions: 11000, spend: 77000, revenue: 550000, ctr: 1.76, cvr: 5.0, roas: 7.14, viewability: 62 }
                ]
              },
              {
                id: 'ag-g2-2',
                name: 'Retargeting Pool',
                targetAudience: 'Website Visitors 30 Days',
                bidStrategy: 'roas',
                budget: 200000,
                spend: 192500,
                impressions: 27500000,
                clicks: 550000,
                conversions: 27500,
                ctr: 2.0,
                cpa: 7.0,
                roas: 7.14,
                creatives: [
                  { id: 'cr-9', name: 'Cart Abandonment', type: 'display', format: '300x600', impressions: 14000000, clicks: 294000, conversions: 14700, spend: 102900, revenue: 735000, ctr: 2.1, cvr: 5.0, roas: 7.14, viewability: 70 },
                  { id: 'cr-10', name: 'Special Offer', type: 'rich_media', format: 'interstitial', impressions: 13500000, clicks: 256000, conversions: 12800, spend: 89600, revenue: 640000, ctr: 1.9, cvr: 5.0, roas: 7.14, viewability: 82 }
                ]
              }
            ]
          },
          {
            id: 'camp-g3',
            name: 'YouTube Video Campaign',
            objective: 'consideration',
            status: 'active',
            startDate: '2025-10-15',
            endDate: '2025-12-31',
            totalBudget: 275000,
            spend: 275000,
            impressions: 35000000,
            reach: 28000000,
            frequency: 1.25,
            clicks: 675000,
            conversions: 24000,
            revenue: 1225000,
            ctr: 1.93,
            cpa: 11.46,
            roas: 4.45,
            adGroups: [
              {
                id: 'ag-g3-1',
                name: 'Video Engagement',
                targetAudience: 'YouTube Engaged Audiences',
                bidStrategy: 'cpm',
                budget: 275000,
                spend: 275000,
                impressions: 35000000,
                clicks: 675000,
                conversions: 24000,
                ctr: 1.93,
                cpa: 11.46,
                roas: 4.45,
                creatives: [
                  { id: 'cr-11', name: 'Brand Story 60s', type: 'video', format: '16:9', impressions: 18000000, clicks: 378000, conversions: 13440, spend: 154000, revenue: 686000, ctr: 2.1, cvr: 3.56, roas: 4.45, viewability: 88, completionRate: 45 },
                  { id: 'cr-12', name: 'Product Demo 15s', type: 'video', format: '16:9', impressions: 17000000, clicks: 297000, conversions: 10560, spend: 121000, revenue: 539000, ctr: 1.75, cvr: 3.56, roas: 4.45, viewability: 92, completionRate: 72 }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'ch-meta',
        name: 'Meta Ads',
        platform: 'meta',
        spend: 875000,
        impressions: 145000000,
        clicks: 2175000,
        conversions: 87500,
        revenue: 4375000,
        ctr: 1.5,
        cpa: 10.0,
        roas: 5.0,
        qualityScore: 7.8,
        campaigns: [
          {
            id: 'camp-m1',
            name: 'Facebook Reach Campaign',
            objective: 'awareness',
            status: 'active',
            startDate: '2025-10-01',
            endDate: '2025-12-31',
            totalBudget: 300000,
            spend: 287500,
            impressions: 75000000,
            reach: 50000000,
            frequency: 1.5,
            clicks: 750000,
            conversions: 22500,
            revenue: 1125000,
            ctr: 1.0,
            cpa: 12.78,
            roas: 3.91,
            adGroups: [
              {
                id: 'ag-m1-1',
                name: 'Lookalike Audiences',
                targetAudience: '1% Lookalike - Purchasers',
                bidStrategy: 'cpm',
                budget: 150000,
                spend: 143750,
                impressions: 37500000,
                clicks: 375000,
                conversions: 11250,
                ctr: 1.0,
                cpa: 12.78,
                roas: 3.91,
                creatives: [
                  { id: 'cr-m1', name: 'Story Format Video', type: 'video', format: '9:16', impressions: 20000000, clicks: 220000, conversions: 6600, spend: 84333, revenue: 330000, ctr: 1.1, cvr: 3.0, roas: 3.91, viewability: 85, completionRate: 55 },
                  { id: 'cr-m2', name: 'Feed Carousel', type: 'native', format: 'carousel', impressions: 17500000, clicks: 155000, conversions: 4650, spend: 59417, revenue: 232500, ctr: 0.89, cvr: 3.0, roas: 3.91, viewability: 72 }
                ]
              },
              {
                id: 'ag-m1-2',
                name: 'Interest Targeting',
                targetAudience: 'Technology & Gadgets Interest',
                bidStrategy: 'cpm',
                budget: 150000,
                spend: 143750,
                impressions: 37500000,
                clicks: 375000,
                conversions: 11250,
                ctr: 1.0,
                cpa: 12.78,
                roas: 3.91,
                creatives: [
                  { id: 'cr-m3', name: 'Reels Creative', type: 'video', format: '9:16', impressions: 22000000, clicks: 242000, conversions: 7260, spend: 87542, revenue: 363000, ctr: 1.1, cvr: 3.0, roas: 4.15, viewability: 88, completionRate: 48 },
                  { id: 'cr-m4', name: 'Single Image', type: 'display', format: '1080x1080', impressions: 15500000, clicks: 133000, conversions: 3990, spend: 56208, revenue: 199500, ctr: 0.86, cvr: 3.0, roas: 3.55, viewability: 68 }
                ]
              }
            ]
          },
          {
            id: 'camp-m2',
            name: 'Instagram Shopping',
            objective: 'conversion',
            status: 'active',
            startDate: '2025-10-01',
            endDate: '2025-12-31',
            totalBudget: 350000,
            spend: 337500,
            impressions: 45000000,
            reach: 30000000,
            frequency: 1.5,
            clicks: 900000,
            conversions: 45000,
            revenue: 2250000,
            ctr: 2.0,
            cpa: 7.5,
            roas: 6.67,
            adGroups: [
              {
                id: 'ag-m2-1',
                name: 'Shop Tab Placement',
                targetAudience: 'Shopping Behaviors',
                bidStrategy: 'cpa',
                budget: 350000,
                spend: 337500,
                impressions: 45000000,
                clicks: 900000,
                conversions: 45000,
                ctr: 2.0,
                cpa: 7.5,
                roas: 6.67,
                creatives: [
                  { id: 'cr-m5', name: 'Product Collection', type: 'native', format: 'collection', impressions: 25000000, clicks: 550000, conversions: 27500, spend: 206250, revenue: 1375000, ctr: 2.2, cvr: 5.0, roas: 6.67, viewability: 75 },
                  { id: 'cr-m6', name: 'Dynamic Catalog', type: 'display', format: 'dynamic', impressions: 20000000, clicks: 350000, conversions: 17500, spend: 131250, revenue: 875000, ctr: 1.75, cvr: 5.0, roas: 6.67, viewability: 70 }
                ]
              }
            ]
          },
          {
            id: 'camp-m3',
            name: 'Messenger Lead Gen',
            objective: 'consideration',
            status: 'active',
            startDate: '2025-11-01',
            endDate: '2025-12-31',
            totalBudget: 250000,
            spend: 250000,
            impressions: 25000000,
            reach: 18000000,
            frequency: 1.39,
            clicks: 525000,
            conversions: 20000,
            revenue: 1000000,
            ctr: 2.1,
            cpa: 12.5,
            roas: 4.0,
            adGroups: [
              {
                id: 'ag-m3-1',
                name: 'Click-to-Messenger',
                targetAudience: 'Warm Audiences',
                bidStrategy: 'cpm',
                budget: 250000,
                spend: 250000,
                impressions: 25000000,
                clicks: 525000,
                conversions: 20000,
                ctr: 2.1,
                cpa: 12.5,
                roas: 4.0,
                creatives: [
                  { id: 'cr-m7', name: 'Messenger Bot CTA', type: 'rich_media', format: 'interactive', impressions: 25000000, clicks: 525000, conversions: 20000, spend: 250000, revenue: 1000000, ctr: 2.1, cvr: 3.81, roas: 4.0, viewability: 80 }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'ch-tiktok',
        name: 'TikTok Ads',
        platform: 'tiktok',
        spend: 425000,
        impressions: 68000000,
        clicks: 1020000,
        conversions: 34000,
        revenue: 1700000,
        ctr: 1.5,
        cpa: 12.5,
        roas: 4.0,
        qualityScore: 7.2,
        campaigns: [
          {
            id: 'camp-t1',
            name: 'TikTok Spark Ads',
            objective: 'awareness',
            status: 'active',
            startDate: '2025-10-01',
            endDate: '2025-12-31',
            totalBudget: 225000,
            spend: 212500,
            impressions: 40000000,
            reach: 32000000,
            frequency: 1.25,
            clicks: 520000,
            conversions: 15600,
            revenue: 780000,
            ctr: 1.3,
            cpa: 13.62,
            roas: 3.67,
            adGroups: [
              {
                id: 'ag-t1-1',
                name: 'Creator Content',
                targetAudience: 'Gen Z & Millennials',
                bidStrategy: 'cpm',
                budget: 225000,
                spend: 212500,
                impressions: 40000000,
                clicks: 520000,
                conversions: 15600,
                ctr: 1.3,
                cpa: 13.62,
                roas: 3.67,
                creatives: [
                  { id: 'cr-t1', name: 'UGC Style 15s', type: 'video', format: '9:16', impressions: 22000000, clicks: 308000, conversions: 9240, spend: 125937, revenue: 462000, ctr: 1.4, cvr: 3.0, roas: 3.67, viewability: 90, completionRate: 42 },
                  { id: 'cr-t2', name: 'Trending Sound', type: 'video', format: '9:16', impressions: 18000000, clicks: 212000, conversions: 6360, spend: 86563, revenue: 318000, ctr: 1.18, cvr: 3.0, roas: 3.67, viewability: 88, completionRate: 38 }
                ]
              }
            ]
          },
          {
            id: 'camp-t2',
            name: 'TikTok Shop Campaign',
            objective: 'conversion',
            status: 'active',
            startDate: '2025-10-15',
            endDate: '2025-12-31',
            totalBudget: 212500,
            spend: 212500,
            impressions: 28000000,
            reach: 20000000,
            frequency: 1.4,
            clicks: 500000,
            conversions: 18400,
            revenue: 920000,
            ctr: 1.79,
            cpa: 11.55,
            roas: 4.33,
            adGroups: [
              {
                id: 'ag-t2-1',
                name: 'Shop Now Ads',
                targetAudience: 'Shopping Intent',
                bidStrategy: 'cpa',
                budget: 212500,
                spend: 212500,
                impressions: 28000000,
                clicks: 500000,
                conversions: 18400,
                ctr: 1.79,
                cpa: 11.55,
                roas: 4.33,
                creatives: [
                  { id: 'cr-t3', name: 'Live Shopping Clip', type: 'video', format: '9:16', impressions: 15000000, clicks: 285000, conversions: 10488, spend: 121181, revenue: 524400, ctr: 1.9, cvr: 3.68, roas: 4.33, viewability: 85, completionRate: 52 },
                  { id: 'cr-t4', name: 'Product Demo', type: 'video', format: '9:16', impressions: 13000000, clicks: 215000, conversions: 7912, spend: 91319, revenue: 395600, ctr: 1.65, cvr: 3.68, roas: 4.33, viewability: 82, completionRate: 48 }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'ch-programmatic',
        name: 'Programmatic Display',
        platform: 'programmatic',
        spend: 375000,
        impressions: 52500000,
        clicks: 787500,
        conversions: 37500,
        revenue: 1875000,
        ctr: 1.5,
        cpa: 10.0,
        roas: 5.0,
        qualityScore: 7.5,
        campaigns: [
          {
            id: 'camp-p1',
            name: 'Premium Publisher Network',
            objective: 'awareness',
            status: 'active',
            startDate: '2025-10-01',
            endDate: '2025-12-31',
            totalBudget: 200000,
            spend: 187500,
            impressions: 30000000,
            reach: 24000000,
            frequency: 1.25,
            clicks: 390000,
            conversions: 15600,
            revenue: 780000,
            ctr: 1.3,
            cpa: 12.02,
            roas: 4.16,
            adGroups: [
              {
                id: 'ag-p1-1',
                name: 'Contextual Targeting',
                targetAudience: 'Business & Finance Sites',
                bidStrategy: 'cpm',
                budget: 200000,
                spend: 187500,
                impressions: 30000000,
                clicks: 390000,
                conversions: 15600,
                ctr: 1.3,
                cpa: 12.02,
                roas: 4.16,
                creatives: [
                  { id: 'cr-p1', name: 'Rich Media Expandable', type: 'rich_media', format: 'expandable', impressions: 15000000, clicks: 210000, conversions: 8400, spend: 101250, revenue: 420000, ctr: 1.4, cvr: 4.0, roas: 4.15, viewability: 72 },
                  { id: 'cr-p2', name: 'High Impact Skin', type: 'rich_media', format: 'skin', impressions: 15000000, clicks: 180000, conversions: 7200, spend: 86250, revenue: 360000, ctr: 1.2, cvr: 4.0, roas: 4.17, viewability: 85 }
                ]
              }
            ]
          },
          {
            id: 'camp-p2',
            name: 'CTV & Connected Devices',
            objective: 'awareness',
            status: 'active',
            startDate: '2025-10-01',
            endDate: '2025-12-31',
            totalBudget: 187500,
            spend: 187500,
            impressions: 22500000,
            reach: 18000000,
            frequency: 1.25,
            clicks: 397500,
            conversions: 21900,
            revenue: 1095000,
            ctr: 1.77,
            cpa: 8.56,
            roas: 5.84,
            adGroups: [
              {
                id: 'ag-p2-1',
                name: 'Streaming TV',
                targetAudience: 'Cord Cutters',
                bidStrategy: 'cpm',
                budget: 187500,
                spend: 187500,
                impressions: 22500000,
                clicks: 397500,
                conversions: 21900,
                ctr: 1.77,
                cpa: 8.56,
                roas: 5.84,
                creatives: [
                  { id: 'cr-p3', name: 'CTV 30s Spot', type: 'video', format: '16:9', impressions: 12500000, clicks: 225000, conversions: 12375, spend: 106250, revenue: 618750, ctr: 1.8, cvr: 5.5, roas: 5.82, viewability: 95, completionRate: 92 },
                  { id: 'cr-p4', name: 'CTV 15s Spot', type: 'video', format: '16:9', impressions: 10000000, clicks: 172500, conversions: 9525, spend: 81250, revenue: 476250, ctr: 1.73, cvr: 5.52, roas: 5.86, viewability: 96, completionRate: 95 }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'ch-linkedin',
        name: 'LinkedIn Ads',
        platform: 'linkedin',
        spend: 187500,
        impressions: 18250000,
        clicks: 267920,
        conversions: 20750,
        revenue: 1037500,
        ctr: 1.47,
        cpa: 9.04,
        roas: 5.53,
        qualityScore: 8.2,
        campaigns: [
          {
            id: 'camp-l1',
            name: 'B2B Lead Generation',
            objective: 'conversion',
            status: 'active',
            startDate: '2025-10-01',
            endDate: '2025-12-31',
            totalBudget: 187500,
            spend: 187500,
            impressions: 18250000,
            reach: 9125000,
            frequency: 2.0,
            clicks: 267920,
            conversions: 20750,
            revenue: 1037500,
            ctr: 1.47,
            cpa: 9.04,
            roas: 5.53,
            adGroups: [
              {
                id: 'ag-l1-1',
                name: 'Decision Makers',
                targetAudience: 'VP+ Level Executives',
                bidStrategy: 'cpa',
                budget: 100000,
                spend: 100000,
                impressions: 9500000,
                clicks: 142500,
                conversions: 11400,
                ctr: 1.5,
                cpa: 8.77,
                roas: 5.7,
                creatives: [
                  { id: 'cr-l1', name: 'Sponsored Content', type: 'native', format: 'single_image', impressions: 5000000, clicks: 80000, conversions: 6400, spend: 56140, revenue: 320000, ctr: 1.6, cvr: 8.0, roas: 5.7, viewability: 75 },
                  { id: 'cr-l2', name: 'Message Ad', type: 'native', format: 'inmail', impressions: 4500000, clicks: 62500, conversions: 5000, spend: 43860, revenue: 250000, ctr: 1.39, cvr: 8.0, roas: 5.7, viewability: 100 }
                ]
              },
              {
                id: 'ag-l1-2',
                name: 'Account Based Marketing',
                targetAudience: 'Target Account List',
                bidStrategy: 'cpm',
                budget: 87500,
                spend: 87500,
                impressions: 8750000,
                clicks: 125420,
                conversions: 9350,
                ctr: 1.43,
                cpa: 9.36,
                roas: 5.34,
                creatives: [
                  { id: 'cr-l3', name: 'Document Ad', type: 'native', format: 'document', impressions: 4500000, clicks: 67500, conversions: 5062, spend: 47396, revenue: 253125, ctr: 1.5, cvr: 7.5, roas: 5.34, viewability: 78 },
                  { id: 'cr-l4', name: 'Carousel Showcase', type: 'native', format: 'carousel', impressions: 4250000, clicks: 57920, conversions: 4288, spend: 40104, revenue: 214375, ctr: 1.36, cvr: 7.4, roas: 5.35, viewability: 72 }
                ]
              }
            ]
          }
        ]
      }
    ],
    timeSeries: this.generateTimeSeries(),
    audienceSegments: [
      { id: 'seg-1', name: 'High-Value Customers', size: 2500000, spend: 425000, conversions: 51000, cpa: 8.33, ltv: 850, demographics: { ageGroup: '25-44', gender: 'Mixed', income: '$100k+' } },
      { id: 'seg-2', name: 'New Prospects', size: 15000000, spend: 712500, conversions: 71250, cpa: 10.0, ltv: 320, demographics: { ageGroup: '18-34', gender: 'Mixed', income: '$50-100k' } },
      { id: 'seg-3', name: 'Retargeting Pool', size: 5000000, spend: 356250, conversions: 50875, cpa: 7.0, ltv: 450, demographics: { ageGroup: '25-54', gender: 'Mixed', income: '$75k+' } },
      { id: 'seg-4', name: 'Lookalike Audiences', size: 8000000, spend: 498750, conversions: 49875, cpa: 10.0, ltv: 380, demographics: { ageGroup: '25-44', gender: 'Mixed', income: '$60-100k' } },
      { id: 'seg-5', name: 'B2B Decision Makers', size: 1200000, spend: 285000, conversions: 28500, cpa: 10.0, ltv: 1250, demographics: { ageGroup: '35-54', gender: 'Mixed', income: '$150k+' } },
      { id: 'seg-6', name: 'Gen Z Mobile Native', size: 12000000, spend: 570000, conversions: 33250, cpa: 17.14, ltv: 180, demographics: { ageGroup: '18-24', gender: 'Mixed', income: '$25-50k' } }
    ],
    geographicData: [
      { region: 'North America', country: 'USA', state: 'California', city: 'Los Angeles', spend: 425000, impressions: 68000000, clicks: 1020000, conversions: 42500, cpa: 10.0, roas: 5.0 },
      { region: 'North America', country: 'USA', state: 'California', city: 'San Francisco', spend: 212500, impressions: 34000000, clicks: 510000, conversions: 21250, cpa: 10.0, roas: 5.0 },
      { region: 'North America', country: 'USA', state: 'New York', city: 'New York City', spend: 498750, impressions: 79800000, clicks: 1197000, conversions: 49875, cpa: 10.0, roas: 5.0 },
      { region: 'North America', country: 'USA', state: 'Texas', city: 'Austin', spend: 285000, impressions: 45600000, clicks: 684000, conversions: 28500, cpa: 10.0, roas: 5.0 },
      { region: 'North America', country: 'USA', state: 'Texas', city: 'Houston', spend: 213750, impressions: 34200000, clicks: 513000, conversions: 21375, cpa: 10.0, roas: 5.0 },
      { region: 'North America', country: 'USA', state: 'Florida', city: 'Miami', spend: 356250, impressions: 57000000, clicks: 855000, conversions: 35625, cpa: 10.0, roas: 5.0 },
      { region: 'North America', country: 'USA', state: 'Washington', city: 'Seattle', spend: 285000, impressions: 45600000, clicks: 684000, conversions: 28500, cpa: 10.0, roas: 5.0 },
      { region: 'North America', country: 'USA', state: 'Illinois', city: 'Chicago', spend: 356250, impressions: 57000000, clicks: 855000, conversions: 35625, cpa: 10.0, roas: 5.0 },
      { region: 'North America', country: 'Canada', spend: 142500, impressions: 22800000, clicks: 342000, conversions: 14250, cpa: 10.0, roas: 5.0 },
      { region: 'Europe', country: 'United Kingdom', spend: 71250, impressions: 11400000, clicks: 171000, conversions: 7125, cpa: 10.0, roas: 5.0 }
    ],
    deviceData: [
      { device: 'mobile', os: 'iOS', spend: 997625, impressions: 165000000, clicks: 2475000, conversions: 99763, ctr: 1.5, cpa: 10.0 },
      { device: 'mobile', os: 'Android', spend: 712500, impressions: 117875000, clicks: 1768125, conversions: 71250, ctr: 1.5, cpa: 10.0 },
      { device: 'desktop', os: 'Windows', spend: 498750, impressions: 82500000, clicks: 1237500, conversions: 49875, ctr: 1.5, cpa: 10.0 },
      { device: 'desktop', os: 'macOS', spend: 356250, impressions: 58875000, clicks: 883125, conversions: 35625, ctr: 1.5, cpa: 10.0 },
      { device: 'tablet', os: 'iPadOS', spend: 142500, impressions: 23562500, clicks: 353437, conversions: 14250, ctr: 1.5, cpa: 10.0 },
      { device: 'ctv', os: 'Various', spend: 139875, impressions: 10937500, clicks: 157983, conversions: 13987, ctr: 1.44, cpa: 10.0 }
    ]
  };

  private svg: any;
  private resizeListener: any;

  constructor(private router: Router) { }

  private generateTimeSeries(): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const startDate = new Date('2025-10-01');
    for (let i = 0; i < 92; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayOfWeek = date.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
      const trendFactor = 1 + (i * 0.005);
      const randomFactor = 0.9 + Math.random() * 0.2;

      const baseSpend = 30950 * weekendFactor * trendFactor * randomFactor;
      const baseImpressions = 4987500 * weekendFactor * trendFactor * randomFactor;

      data.push({
        date: date.toISOString().split('T')[0],
        spend: Math.round(baseSpend),
        impressions: Math.round(baseImpressions),
        clicks: Math.round(baseImpressions * 0.015),
        conversions: Math.round(baseSpend / 10),
        revenue: Math.round(baseSpend * 5),
        ctr: +(baseImpressions * 0.015 / baseImpressions * 100).toFixed(2),
        cpa: 10.0,
        roas: 5.0
      });
    }
    return data;
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.renderVisualization();
    this.resizeListener = () => this.renderVisualization();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    this.clearSvg();
  }

  setActiveViz(vizType: string): void {
    this.activeViz = vizType;
    this.selectedChannel = null;
    this.selectedCampaign = null;
    this.renderVisualization();
  }

  // Navigate to detail analytics page
  navigateToDetail(type: string, id: string, name: string): void {
    this.router.navigate(['/topads-detail'], {
      queryParams: { type, id, name }
    });
  }

  private renderVisualization(): void {
    this.clearSvg();

    switch (this.activeViz) {
      case 'overview':
        this.renderOverviewDashboard();
        break;
      case 'channels':
        this.renderChannelTreemap();
        break;
      case 'funnel':
        this.renderConversionFunnel();
        break;
      case 'performance':
        this.renderPerformanceMatrix();
        break;
      case 'audience':
        this.renderAudienceBubbles();
        break;
      case 'timeline':
        this.renderTimelineChart();
        break;
      default:
        this.renderOverviewDashboard();
    }
  }

  private clearSvg(): void {
    const container = this.svgContainer.nativeElement;
    d3.select(container).selectAll('*').remove();
  }

  private renderOverviewDashboard(): void {
    const width = 1300;
    const height = 800;
    const container = this.svgContainer.nativeElement;

    this.svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    // Title
    this.svg.append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1a1a2e')
      .text('Advertising Performance Overview - Click Any Element to Drill Down');

    // KPI Cards Section
    const kpiSection = this.svg.append('g').attr('transform', 'translate(50, 60)');
    const kpis = [
      { label: 'Total Spend', value: `$${(this.data.overview.totalSpend / 1000000).toFixed(2)}M`, color: '#e74c3c', icon: '💰' },
      { label: 'Impressions', value: `${(this.data.overview.totalImpressions / 1000000).toFixed(1)}M`, color: '#3498db', icon: '👁️' },
      { label: 'Conversions', value: `${(this.data.overview.totalConversions / 1000).toFixed(1)}K`, color: '#2ecc71', icon: '🎯' },
      { label: 'Revenue', value: `$${(this.data.overview.totalRevenue / 1000000).toFixed(2)}M`, color: '#00ACC1', icon: '📈' },
      { label: 'Avg CPA', value: `$${this.data.overview.avgCpa.toFixed(2)}`, color: '#f39c12', icon: '💵' },
      { label: 'ROAS', value: `${this.data.overview.avgRoas.toFixed(1)}x`, color: '#1abc9c', icon: '📊' }
    ];

    const kpiWidth = 185;
    kpis.forEach((kpi, i) => {
      const g = kpiSection.append('g')
        .attr('transform', `translate(${i * kpiWidth}, 0)`)
        .style('cursor', 'pointer')
        .on('click', () => this.navigateToDetail('metric', kpi.label.toLowerCase().replace(' ', '_'), kpi.label))
        .on('mouseover', (event: MouseEvent) => {
          d3.select(event.currentTarget as any).select('rect').attr('stroke-width', 3);
        })
        .on('mouseout', (event: MouseEvent) => {
          d3.select(event.currentTarget as any).select('rect').attr('stroke-width', 1);
        });

      g.append('rect')
        .attr('width', kpiWidth - 10)
        .attr('height', 80)
        .attr('rx', 10)
        .attr('fill', '#fff')
        .attr('stroke', kpi.color)
        .attr('stroke-width', 1)
        .attr('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))');

      g.append('text')
        .attr('x', (kpiWidth - 10) / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '22px')
        .attr('font-weight', 'bold')
        .attr('fill', kpi.color)
        .text(kpi.value);

      g.append('text')
        .attr('x', (kpiWidth - 10) / 2)
        .attr('y', 55)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(kpi.label);

      g.append('text')
        .attr('x', (kpiWidth - 10) / 2)
        .attr('y', 75)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#999')
        .text('Click to analyze →');
    });

    // Channel Performance Donut Chart
    const donutSection = this.svg.append('g').attr('transform', 'translate(200, 320)');

    donutSection.append('text')
      .attr('x', 0)
      .attr('y', -130)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('Channel Distribution (Click to Drill Down)');

    const pie = d3.pie<Channel>().value(d => d.spend).sort(null);
    const arc = d3.arc<d3.PieArcDatum<Channel>>().innerRadius(50).outerRadius(120);
    const labelArc = d3.arc<d3.PieArcDatum<Channel>>().innerRadius(130).outerRadius(130);

    const channelColors = d3.scaleOrdinal<string>()
      .domain(this.data.channels.map(c => c.name))
      .range(['#1976D2', '#42A5F5', '#00ACC1', '#43A047', '#0277BD']);

    const arcs = donutSection.selectAll('.arc')
      .data(pie(this.data.channels))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer');

    arcs.append('path')
      .attr('d', arc as any)
      .attr('fill', (d: d3.PieArcDatum<Channel>) => channelColors(d.data.name))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', (event: MouseEvent, d: d3.PieArcDatum<Channel>) => {
        d3.select(event.currentTarget as any)
          .transition()
          .duration(200)
          .attr('transform', () => {
            const [x, y] = arc.centroid(d);
            return `translate(${x * 0.1}, ${y * 0.1})`;
          });
        this.showTooltip(event, `
          <strong>${d.data.name}</strong><br/>
          Spend: $${(d.data.spend / 1000).toFixed(0)}K<br/>
          ROAS: ${d.data.roas.toFixed(2)}x<br/>
          CPA: $${d.data.cpa.toFixed(2)}<br/>
          <em>Click to see campaigns →</em>
        `);
      })
      .on('mouseout', (event: MouseEvent) => {
        d3.select(event.currentTarget as any)
          .transition()
          .duration(200)
          .attr('transform', 'translate(0, 0)');
        this.hideTooltip();
      })
      .on('click', (event: MouseEvent, d: d3.PieArcDatum<Channel>) => {
        this.navigateToDetail('channel', d.data.id, d.data.name);
      });

    arcs.append('text')
      .attr('transform', (d: d3.PieArcDatum<Channel>) => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text((d: d3.PieArcDatum<Channel>) => d.data.name.split(' ')[0]);

    // Center text
    donutSection.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(`$${(this.data.overview.totalSpend / 1000000).toFixed(1)}M`);

    donutSection.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 20)
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text('Total Spend');

    // Campaign Performance Bars
    const barSection = this.svg.append('g').attr('transform', 'translate(480, 170)');

    barSection.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('Top Campaigns by ROAS (Click to Drill Down)');

    const allCampaigns = this.data.channels.flatMap(ch =>
      ch.campaigns.map(camp => ({ ...camp, channelName: ch.name, channelId: ch.id }))
    ).sort((a, b) => b.roas - a.roas).slice(0, 8);

    const barWidth = 700;
    const barHeight = 35;
    const maxRoas = d3.max(allCampaigns, d => d.roas) || 10;

    const roasScale = d3.scaleLinear()
      .domain([0, maxRoas])
      .range([0, barWidth - 200]);

    const roasColorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([3, 8]);

    allCampaigns.forEach((campaign, i) => {
      const g = barSection.append('g')
        .attr('transform', `translate(0, ${20 + i * (barHeight + 8)})`)
        .style('cursor', 'pointer')
        .on('mouseover', (event: MouseEvent) => {
          d3.select(event.currentTarget as any).select('rect.bar').attr('opacity', 0.8);
          this.showTooltip(event, `
            <strong>${campaign.name}</strong><br/>
            Channel: ${campaign.channelName}<br/>
            Spend: $${(campaign.spend / 1000).toFixed(0)}K<br/>
            Conversions: ${campaign.conversions.toLocaleString()}<br/>
            Revenue: $${(campaign.revenue / 1000).toFixed(0)}K<br/>
            ROAS: ${campaign.roas.toFixed(2)}x<br/>
            CPA: $${campaign.cpa.toFixed(2)}<br/>
            <em>Click for ad group details →</em>
          `);
        })
        .on('mouseout', (event: MouseEvent) => {
          d3.select(event.currentTarget as any).select('rect.bar').attr('opacity', 1);
          this.hideTooltip();
        })
        .on('click', () => {
          this.navigateToDetail('campaign', campaign.id, campaign.name);
        });

      // Campaign name (truncated)
      g.append('text')
        .attr('x', 0)
        .attr('y', barHeight / 2 + 4)
        .attr('font-size', '11px')
        .attr('fill', '#333')
        .text(campaign.name.length > 25 ? campaign.name.slice(0, 25) + '...' : campaign.name);

      // ROAS bar
      g.append('rect')
        .attr('class', 'bar')
        .attr('x', 200)
        .attr('y', 2)
        .attr('width', roasScale(campaign.roas))
        .attr('height', barHeight - 4)
        .attr('fill', roasColorScale(campaign.roas))
        .attr('rx', 4);

      // ROAS value
      g.append('text')
        .attr('x', 200 + roasScale(campaign.roas) + 8)
        .attr('y', barHeight / 2 + 4)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(`${campaign.roas.toFixed(2)}x`);
    });

    // Device Performance Section
    const deviceSection = this.svg.append('g').attr('transform', 'translate(50, 520)');

    deviceSection.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('Device Performance (Click to Drill Down)');

    const deviceIcons: { [key: string]: string } = {
      'mobile': '📱',
      'desktop': '🖥️',
      'tablet': '📱',
      'ctv': '📺'
    };

    const aggregatedDevices = d3.rollups(
      this.data.deviceData,
      v => ({
        spend: d3.sum(v, d => d.spend),
        conversions: d3.sum(v, d => d.conversions),
        impressions: d3.sum(v, d => d.impressions)
      }),
      d => d.device
    );

    const deviceWidth = 280;
    aggregatedDevices.forEach(([device, metrics], i) => {
      const g = deviceSection.append('g')
        .attr('transform', `translate(${i * deviceWidth}, 20)`)
        .style('cursor', 'pointer')
        .on('click', () => this.navigateToDetail('device', device, device))
        .on('mouseover', (event: MouseEvent) => {
          d3.select(event.currentTarget as any).select('rect').attr('fill', '#f0f8ff');
          this.showTooltip(event, `
            <strong>${device.toUpperCase()}</strong><br/>
            Spend: $${(metrics.spend / 1000).toFixed(0)}K<br/>
            Conversions: ${metrics.conversions.toLocaleString()}<br/>
            Share: ${((metrics.spend / this.data.overview.totalSpend) * 100).toFixed(1)}%<br/>
            <em>Click to analyze device trends →</em>
          `);
        })
        .on('mouseout', (event: MouseEvent) => {
          d3.select(event.currentTarget as any).select('rect').attr('fill', '#fff');
          this.hideTooltip();
        });

      g.append('rect')
        .attr('width', deviceWidth - 20)
        .attr('height', 100)
        .attr('rx', 10)
        .attr('fill', '#fff')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1)
        .attr('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.05))');

      g.append('text')
        .attr('x', 20)
        .attr('y', 40)
        .attr('font-size', '30px')
        .text(deviceIcons[device] || '📊');

      g.append('text')
        .attr('x', 70)
        .attr('y', 35)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(device.charAt(0).toUpperCase() + device.slice(1));

      g.append('text')
        .attr('x', 70)
        .attr('y', 55)
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#2ecc71')
        .text(`$${(metrics.spend / 1000).toFixed(0)}K`);

      g.append('text')
        .attr('x', 70)
        .attr('y', 75)
        .attr('font-size', '11px')
        .attr('fill', '#666')
        .text(`${metrics.conversions.toLocaleString()} conversions`);

      g.append('text')
        .attr('x', deviceWidth - 30)
        .attr('y', 85)
        .attr('font-size', '10px')
        .attr('fill', '#999')
        .attr('text-anchor', 'end')
        .text('Click →');
    });

    // Audience Segments Preview
    const audienceSection = this.svg.append('g').attr('transform', 'translate(50, 660)');

    audienceSection.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('Top Audience Segments by LTV (Click to Drill Down)');

    const topAudiences = this.data.audienceSegments.sort((a, b) => b.ltv - a.ltv).slice(0, 6);
    const audienceWidth = 190;

    topAudiences.forEach((segment, i) => {
      const g = audienceSection.append('g')
        .attr('transform', `translate(${i * audienceWidth}, 20)`)
        .style('cursor', 'pointer')
        .on('click', () => this.navigateToDetail('audience', segment.id, segment.name))
        .on('mouseover', (event: MouseEvent) => {
          d3.select(event.currentTarget as any).select('rect').attr('stroke-width', 2);
          this.showTooltip(event, `
            <strong>${segment.name}</strong><br/>
            Size: ${(segment.size / 1000000).toFixed(1)}M users<br/>
            Spend: $${(segment.spend / 1000).toFixed(0)}K<br/>
            LTV: $${segment.ltv}<br/>
            CPA: $${segment.cpa.toFixed(2)}<br/>
            Demographics: ${segment.demographics.ageGroup}<br/>
            <em>Click for segment analysis →</em>
          `);
        })
        .on('mouseout', (event: MouseEvent) => {
          d3.select(event.currentTarget as any).select('rect').attr('stroke-width', 1);
          this.hideTooltip();
        });

      g.append('rect')
        .attr('width', audienceWidth - 10)
        .attr('height', 80)
        .attr('rx', 8)
        .attr('fill', d3.interpolateBlues(0.1 + (i * 0.15)))
        .attr('stroke', d3.interpolateBlues(0.3 + (i * 0.12)))
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', (audienceWidth - 10) / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(segment.name.length > 18 ? segment.name.slice(0, 18) + '...' : segment.name);

      g.append('text')
        .attr('x', (audienceWidth - 10) / 2)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', '#2ecc71')
        .text(`$${segment.ltv}`);

      g.append('text')
        .attr('x', (audienceWidth - 10) / 2)
        .attr('y', 68)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text('LTV');
    });
  }

  private renderChannelTreemap(): void {
    const width = 1200;
    const height = 700;
    const container = this.svgContainer.nativeElement;

    this.svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    this.svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('Channel & Campaign Treemap - Click to Drill Down');

    // Build hierarchy
    const hierarchyData = {
      name: 'All Channels',
      children: this.data.channels.map(channel => ({
        name: channel.name,
        id: channel.id,
        type: 'channel',
        value: channel.spend,
        roas: channel.roas,
        cpa: channel.cpa,
        children: channel.campaigns.map(campaign => ({
          name: campaign.name,
          id: campaign.id,
          type: 'campaign',
          channelId: channel.id,
          channelName: channel.name,
          value: campaign.spend,
          roas: campaign.roas,
          cpa: campaign.cpa,
          conversions: campaign.conversions
        }))
      }))
    };

    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap<any>()
      .size([width - 40, height - 80])
      .padding(2)
      .round(true)(root);

    const channelColors = d3.scaleOrdinal<string>()
      .domain(this.data.channels.map(c => c.name))
      .range(['#1976D2', '#42A5F5', '#00ACC1', '#43A047', '#0277BD']);

    const group = this.svg.append('g')
      .attr('transform', 'translate(20, 50)');

    const leaves = group.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer');

    leaves.append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d: any) => {
        const channelName = d.parent?.data.name || d.data.channelName;
        return d3.color(channelColors(channelName))!.brighter(0.3) as any;
      })
      .attr('stroke', (d: any) => {
        const channelName = d.parent?.data.name || d.data.channelName;
        return channelColors(channelName);
      })
      .attr('stroke-width', 1)
      .on('mouseover', (event: MouseEvent, d: any) => {
        d3.select(event.currentTarget as any).attr('stroke-width', 3);
        this.showTooltip(event, `
          <strong>${d.data.name}</strong><br/>
          Channel: ${d.parent?.data.name || 'N/A'}<br/>
          Spend: $${(d.value / 1000).toFixed(0)}K<br/>
          ROAS: ${d.data.roas?.toFixed(2) || 'N/A'}x<br/>
          CPA: $${d.data.cpa?.toFixed(2) || 'N/A'}<br/>
          <em>Click for detailed breakdown →</em>
        `);
      })
      .on('mouseout', (event: MouseEvent) => {
        d3.select(event.currentTarget as any).attr('stroke-width', 1);
        this.hideTooltip();
      })
      .on('click', (event: MouseEvent, d: any) => {
        if (d.data.type === 'campaign') {
          this.navigateToDetail('campaign', d.data.id, d.data.name);
        } else {
          this.navigateToDetail('channel', d.data.id, d.data.name);
        }
      });

    leaves.append('text')
      .attr('x', 5)
      .attr('y', 15)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text((d: any) => {
        const width = d.x1 - d.x0;
        if (width < 60) return '';
        const name = d.data.name;
        return name.length > 20 ? name.slice(0, 18) + '...' : name;
      });

    leaves.append('text')
      .attr('x', 5)
      .attr('y', 28)
      .attr('font-size', '11px')
      .attr('fill', '#2ecc71')
      .attr('font-weight', 'bold')
      .text((d: any) => {
        const width = d.x1 - d.x0;
        if (width < 50) return '';
        return `$${(d.value / 1000).toFixed(0)}K`;
      });

    // Legend
    const legend = this.svg.append('g').attr('transform', `translate(${width - 200}, 50)`);
    legend.append('text')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Channels:');

    this.data.channels.forEach((channel, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(0, ${20 + i * 20})`);

      g.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', channelColors(channel.name));

      g.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', '11px')
        .text(channel.name);
    });
  }

  private renderConversionFunnel(): void {
    const width = 1200;
    const height = 700;
    const container = this.svgContainer.nativeElement;

    this.svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    this.svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('Conversion Funnel Analysis - Click Each Stage');

    const funnelData = [
      { stage: 'Impressions', value: this.data.overview.totalImpressions, color: '#3498db' },
      { stage: 'Clicks', value: this.data.overview.totalClicks, color: '#00ACC1' },
      { stage: 'Conversions', value: this.data.overview.totalConversions, color: '#2ecc71' },
      { stage: 'Revenue', value: this.data.overview.totalRevenue, color: '#f39c12' }
    ];

    const maxWidth = 600;
    const funnelHeight = 120;
    const spacing = 20;
    const startY = 80;

    const widthScale = d3.scaleLinear()
      .domain([0, funnelData[0].value])
      .range([100, maxWidth]);

    const funnelGroup = this.svg.append('g')
      .attr('transform', `translate(${(width - maxWidth) / 2}, ${startY})`);

    funnelData.forEach((stage, i) => {
      const currentWidth = widthScale(stage.value);
      const nextWidth = i < funnelData.length - 1 ? widthScale(funnelData[i + 1].value) : currentWidth * 0.8;
      const y = i * (funnelHeight + spacing);

      const path = `
        M ${(maxWidth - currentWidth) / 2} ${y}
        L ${(maxWidth + currentWidth) / 2} ${y}
        L ${(maxWidth + nextWidth) / 2} ${y + funnelHeight}
        L ${(maxWidth - nextWidth) / 2} ${y + funnelHeight}
        Z
      `;

      const g = funnelGroup.append('g')
        .style('cursor', 'pointer')
        .on('mouseover', (event: MouseEvent) => {
          d3.select(event.currentTarget as any).select('path').attr('opacity', 0.8);
          const rate = i > 0 ? ((stage.value / funnelData[i - 1].value) * 100).toFixed(2) : '100';
          this.showTooltip(event, `
            <strong>${stage.stage}</strong><br/>
            Value: ${stage.stage === 'Revenue' ? '$' + (stage.value / 1000000).toFixed(2) + 'M' : stage.value.toLocaleString()}<br/>
            ${i > 0 ? `Conversion Rate: ${rate}%` : ''}<br/>
            <em>Click to analyze this stage →</em>
          `);
        })
        .on('mouseout', (event: MouseEvent) => {
          d3.select(event.currentTarget as any).select('path').attr('opacity', 1);
          this.hideTooltip();
        })
        .on('click', () => {
          this.navigateToDetail('funnel_stage', stage.stage.toLowerCase(), stage.stage);
        });

      g.append('path')
        .attr('d', path)
        .attr('fill', stage.color)
        .attr('stroke', d3.color(stage.color)!.darker(0.3) as any)
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', maxWidth / 2)
        .attr('y', y + funnelHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#fff')
        .text(stage.stage);

      g.append('text')
        .attr('x', maxWidth / 2)
        .attr('y', y + funnelHeight / 2 + 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#fff')
        .text(stage.stage === 'Revenue' ? `$${(stage.value / 1000000).toFixed(1)}M` : stage.value.toLocaleString());

      // Conversion rate arrow
      if (i > 0) {
        const rate = ((stage.value / funnelData[i - 1].value) * 100).toFixed(1);
        funnelGroup.append('text')
          .attr('x', (maxWidth + currentWidth) / 2 + 30)
          .attr('y', y + 20)
          .attr('font-size', '12px')
          .attr('fill', '#666')
          .text(`${rate}%`);

        funnelGroup.append('text')
          .attr('x', (maxWidth + currentWidth) / 2 + 30)
          .attr('y', y + 35)
          .attr('font-size', '10px')
          .attr('fill', '#999')
          .text('conversion');
      }
    });

    // Channel breakdown on the right
    const breakdownSection = this.svg.append('g')
      .attr('transform', `translate(${width - 350}, 80)`);

    breakdownSection.append('text')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Channel Funnel Breakdown');

    this.data.channels.forEach((channel, i) => {
      const g = breakdownSection.append('g')
        .attr('transform', `translate(0, ${30 + i * 110})`)
        .style('cursor', 'pointer')
        .on('click', () => this.navigateToDetail('channel', channel.id, channel.name));

      g.append('rect')
        .attr('width', 300)
        .attr('height', 100)
        .attr('rx', 8)
        .attr('fill', '#f8f9fa')
        .attr('stroke', '#ddd');

      g.append('text')
        .attr('x', 10)
        .attr('y', 20)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(channel.name);

      const metrics = [
        { label: 'Impr', value: `${(channel.impressions / 1000000).toFixed(0)}M` },
        { label: 'Click', value: `${(channel.clicks / 1000).toFixed(0)}K` },
        { label: 'Conv', value: `${(channel.conversions / 1000).toFixed(0)}K` },
        { label: 'Rev', value: `$${(channel.revenue / 1000).toFixed(0)}K` }
      ];

      metrics.forEach((m, j) => {
        g.append('text')
          .attr('x', 10 + j * 75)
          .attr('y', 50)
          .attr('font-size', '10px')
          .attr('fill', '#666')
          .text(m.label);

        g.append('text')
          .attr('x', 10 + j * 75)
          .attr('y', 68)
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .text(m.value);
      });

      g.append('text')
        .attr('x', 290)
        .attr('y', 90)
        .attr('text-anchor', 'end')
        .attr('font-size', '10px')
        .attr('fill', '#999')
        .text('Click →');
    });
  }

  private renderPerformanceMatrix(): void {
    const width = 1200;
    const height = 700;
    const container = this.svgContainer.nativeElement;

    this.svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    this.svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('Campaign Performance Matrix - CPA vs ROAS (Click Bubbles)');

    const allCampaigns = this.data.channels.flatMap(ch =>
      ch.campaigns.map(camp => ({ ...camp, channelName: ch.name, channelId: ch.id }))
    );

    const margin = { top: 60, right: 150, bottom: 60, left: 80 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain([5, 15])
      .range([0, plotWidth]);

    const yScale = d3.scaleLinear()
      .domain([3, 8])
      .range([plotHeight, 0]);

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(allCampaigns, d => d.spend) || 1])
      .range([10, 60]);

    const channelColors = d3.scaleOrdinal<string>()
      .domain(this.data.channels.map(c => c.name))
      .range(['#1976D2', '#42A5F5', '#00ACC1', '#43A047', '#0277BD']);

    const plot = this.svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Quadrant backgrounds
    const midX = xScale(10);
    const midY = yScale(5);

    // High ROAS, Low CPA (Best)
    plot.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', midX)
      .attr('height', midY)
      .attr('fill', 'rgba(46, 204, 113, 0.1)');

    // Low ROAS, High CPA (Worst)
    plot.append('rect')
      .attr('x', midX)
      .attr('y', midY)
      .attr('width', plotWidth - midX)
      .attr('height', plotHeight - midY)
      .attr('fill', 'rgba(231, 76, 60, 0.1)');

    // Quadrant labels
    plot.append('text')
      .attr('x', midX / 2)
      .attr('y', midY / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', 'rgba(46, 204, 113, 0.5)')
      .attr('font-weight', 'bold')
      .text('🌟 STAR PERFORMERS');

    plot.append('text')
      .attr('x', midX + (plotWidth - midX) / 2)
      .attr('y', midY + (plotHeight - midY) / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', 'rgba(231, 76, 60, 0.5)')
      .attr('font-weight', 'bold')
      .text('⚠️ NEEDS OPTIMIZATION');

    // Axes
    plot.append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `$${d}`))
      .append('text')
      .attr('x', plotWidth / 2)
      .attr('y', 45)
      .attr('fill', '#333')
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .text('Cost Per Acquisition (CPA) →');

    plot.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}x`))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -plotHeight / 2)
      .attr('y', -50)
      .attr('fill', '#333')
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .text('← Return on Ad Spend (ROAS)');

    // Reference lines
    plot.append('line')
      .attr('x1', midX)
      .attr('y1', 0)
      .attr('x2', midX)
      .attr('y2', plotHeight)
      .attr('stroke', '#999')
      .attr('stroke-dasharray', '5,5');

    plot.append('line')
      .attr('x1', 0)
      .attr('y1', midY)
      .attr('x2', plotWidth)
      .attr('y2', midY)
      .attr('stroke', '#999')
      .attr('stroke-dasharray', '5,5');

    // Campaign bubbles
    const bubbles = plot.selectAll('.bubble')
      .data(allCampaigns)
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', (d: { cpa: d3.NumberValue; roas: d3.NumberValue; }) => `translate(${xScale(d.cpa)}, ${yScale(d.roas)})`)
      .style('cursor', 'pointer');

    bubbles.append('circle')
      .attr('r', (d: { spend: d3.NumberValue; }) => sizeScale(d.spend))
      .attr('fill', (d: { channelName: string; }) => channelColors(d.channelName))
      .attr('opacity', 0.7)
      .attr('stroke', (d: { channelName: string; }) => d3.color(channelColors(d.channelName))!.darker(0.5) as any)
      .attr('stroke-width', 2)
      .on('mouseover', (event: MouseEvent, d: any) => {
        d3.select(event.currentTarget as any)
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.spend) * 1.2)
          .attr('opacity', 0.9);
        this.showTooltip(event, `
          <strong>${d.name}</strong><br/>
          Channel: ${d.channelName}<br/>
          Spend: $${(d.spend / 1000).toFixed(0)}K<br/>
          ROAS: ${d.roas.toFixed(2)}x<br/>
          CPA: $${d.cpa.toFixed(2)}<br/>
          Conversions: ${d.conversions.toLocaleString()}<br/>
          <em>Click for ad group details →</em>
        `);
      })
      .on('mouseout', (event: MouseEvent, d: any) => {
        d3.select(event.currentTarget as any)
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.spend))
          .attr('opacity', 0.7);
        this.hideTooltip();
      })
      .on('click', (event: MouseEvent, d: any) => {
        this.navigateToDetail('campaign', d.id, d.name);
      });

    // Legend
    const legend = this.svg.append('g')
      .attr('transform', `translate(${width - 140}, 80)`);

    legend.append('text')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Channels:');

    this.data.channels.forEach((channel, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(0, ${20 + i * 25})`);

      g.append('circle')
        .attr('r', 8)
        .attr('fill', channelColors(channel.name))
        .attr('opacity', 0.7);

      g.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .attr('font-size', '11px')
        .text(channel.name.split(' ')[0]);
    });

    // Size legend
    const sizeLegend = this.svg.append('g')
      .attr('transform', `translate(${width - 140}, 280)`);

    sizeLegend.append('text')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Spend:');

    [100000, 250000, 400000].forEach((val, i) => {
      sizeLegend.append('circle')
        .attr('cx', 20)
        .attr('cy', 30 + i * 40)
        .attr('r', sizeScale(val))
        .attr('fill', 'none')
        .attr('stroke', '#999');

      sizeLegend.append('text')
        .attr('x', 50)
        .attr('y', 35 + i * 40)
        .attr('font-size', '10px')
        .text(`$${val / 1000}K`);
    });
  }

  private renderAudienceBubbles(): void {
    const width = 1200;
    const height = 700;
    const container = this.svgContainer.nativeElement;

    this.svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    this.svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('Audience Segment Analysis - Click to Explore');

    const pack = d3.pack<AudienceSegment>()
      .size([width - 100, height - 100])
      .padding(20);

    const root = d3.hierarchy<any>({ children: this.data.audienceSegments })
      .sum((d: any) => d.ltv * (d.conversions || 1))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    pack(root);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(this.data.audienceSegments, d => d.ltv) || 1000]);

    const bubbles = this.svg.append('g')
      .attr('transform', 'translate(50, 50)')
      .selectAll('.bubble')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer');

    bubbles.append('circle')
      .attr('r', (d: any) => d.r)
      .attr('fill', (d: any) => colorScale(d.data.ltv))
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .on('mouseover', (event: MouseEvent, d: any) => {
        d3.select(event.currentTarget as any)
          .transition()
          .duration(200)
          .attr('r', d.r * 1.1)
          .attr('opacity', 1);
        this.showTooltip(event, `
          <strong>${d.data.name}</strong><br/>
          Size: ${(d.data.size / 1000000).toFixed(1)}M users<br/>
          Spend: $${(d.data.spend / 1000).toFixed(0)}K<br/>
          Conversions: ${d.data.conversions.toLocaleString()}<br/>
          LTV: $${d.data.ltv}<br/>
          CPA: $${d.data.cpa.toFixed(2)}<br/>
          Age: ${d.data.demographics.ageGroup}<br/>
          <em>Click for segment deep dive →</em>
        `);
      })
      .on('mouseout', (event: MouseEvent, d: any) => {
        d3.select(event.currentTarget as any)
          .transition()
          .duration(200)
          .attr('r', d.r)
          .attr('opacity', 0.8);
        this.hideTooltip();
      })
      .on('click', (event: MouseEvent, d: any) => {
        this.navigateToDetail('audience', d.data.id, d.data.name);
      });

    bubbles.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .attr('font-size', (d: any) => Math.min(d.r / 4, 14) + 'px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .text((d: any) => {
        const name = d.data.name;
        return d.r > 40 ? (name.length > 15 ? name.slice(0, 12) + '...' : name) : '';
      });

    bubbles.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 12)
      .attr('font-size', (d: any) => Math.min(d.r / 5, 12) + 'px')
      .attr('fill', '#fff')
      .text((d: any) => d.r > 50 ? `LTV: $${d.data.ltv}` : '');

    // Legend
    const legend = this.svg.append('g')
      .attr('transform', `translate(${width - 150}, 60)`);

    legend.append('text')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('LTV Scale:');

    const legendScale = d3.scaleLinear().domain([0, 1200]).range([0, 120]);
    const legendAxis = d3.axisRight(legendScale).ticks(5).tickFormat(d => `$${d}`);

    const gradient = legend.append('defs')
      .append('linearGradient')
      .attr('id', 'ltv-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');

    for (let i = 0; i <= 10; i++) {
      gradient.append('stop')
        .attr('offset', `${i * 10}%`)
        .attr('stop-color', colorScale(i * 120));
    }

    legend.append('rect')
      .attr('y', 20)
      .attr('width', 20)
      .attr('height', 120)
      .style('fill', 'url(#ltv-gradient)');

    legend.append('g')
      .attr('transform', 'translate(20, 20)')
      .call(legendAxis);
  }

  private renderTimelineChart(): void {
    const width = 1200;
    const height = 700;
    const container = this.svgContainer.nativeElement;

    this.svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    this.svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('Performance Timeline - Click Data Points for Daily Analysis');

    const margin = { top: 60, right: 60, bottom: 50, left: 80 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const parseDate = d3.timeParse('%Y-%m-%d');
    const data = this.data.timeSeries.map(d => ({
      ...d,
      parsedDate: parseDate(d.date)!
    }));

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.parsedDate) as [Date, Date])
      .range([0, plotWidth]);

    const yScaleSpend = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.spend)! * 1.1])
      .range([plotHeight, 0]);

    const yScaleRoas = d3.scaleLinear()
      .domain([3, 7])
      .range([plotHeight, 0]);

    const plot = this.svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Area chart for spend
    const areaGenerator = d3.area<any>()
      .x(d => xScale(d.parsedDate))
      .y0(plotHeight)
      .y1(d => yScaleSpend(d.spend))
      .curve(d3.curveMonotoneX);

    plot.append('path')
      .datum(data)
      .attr('d', areaGenerator)
      .attr('fill', 'rgba(52, 152, 219, 0.3)')
      .attr('stroke', '#3498db')
      .attr('stroke-width', 2);

    // Line for ROAS
    const lineGenerator = d3.line<any>()
      .x(d => xScale(d.parsedDate))
      .y(d => yScaleRoas(d.roas))
      .curve(d3.curveMonotoneX);

    plot.append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#e74c3c')
      .attr('stroke-width', 3);

    // Axes
    plot.append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b %d') as any));

    plot.append('g')
      .call(d3.axisLeft(yScaleSpend).tickFormat(d => `$${(d as number) / 1000}K`))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -plotHeight / 2)
      .attr('y', -60)
      .attr('fill', '#3498db')
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .text('Daily Spend');

    plot.append('g')
      .attr('transform', `translate(${plotWidth}, 0)`)
      .call(d3.axisRight(yScaleRoas).tickFormat(d => `${d}x`))
      .append('text')
      .attr('transform', 'rotate(90)')
      .attr('x', plotHeight / 2)
      .attr('y', -45)
      .attr('fill', '#e74c3c')
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .text('ROAS');

    // Interactive points
    const points = plot.selectAll('.point')
      .data(data.filter((_, i) => i % 3 === 0))
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', (d: { parsedDate: d3.NumberValue | Date; }) => xScale(d.parsedDate))
      .attr('cy', (d: { spend: d3.NumberValue; }) => yScaleSpend(d.spend))
      .attr('r', 6)
      .attr('fill', '#3498db')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: any) => {
        d3.select(event.currentTarget as any).attr('r', 10);
        this.showTooltip(event, `
          <strong>${d.date}</strong><br/>
          Spend: $${d.spend.toLocaleString()}<br/>
          Revenue: $${d.revenue.toLocaleString()}<br/>
          Conversions: ${d.conversions.toLocaleString()}<br/>
          ROAS: ${d.roas.toFixed(2)}x<br/>
          CPA: $${d.cpa.toFixed(2)}<br/>
          <em>Click for daily breakdown →</em>
        `);
      })
      .on('mouseout', (event: MouseEvent) => {
        d3.select(event.currentTarget as any).attr('r', 6);
        this.hideTooltip();
      })
      .on('click', (event: MouseEvent, d: any) => {
        this.navigateToDetail('date', d.date, d.date);
      });

    // Legend
    const legend = this.svg.append('g')
      .attr('transform', `translate(${width / 2 - 100}, ${height - 25})`);

    legend.append('rect')
      .attr('width', 20)
      .attr('height', 3)
      .attr('fill', '#3498db');

    legend.append('text')
      .attr('x', 25)
      .attr('y', 4)
      .attr('font-size', '11px')
      .text('Spend');

    legend.append('rect')
      .attr('x', 80)
      .attr('width', 20)
      .attr('height', 3)
      .attr('fill', '#e74c3c');

    legend.append('text')
      .attr('x', 105)
      .attr('y', 4)
      .attr('font-size', '11px')
      .text('ROAS');
  }

  private showTooltip(event: MouseEvent, html: string): void {
    const tooltip = d3.select(this.tooltip.nativeElement);
    tooltip
      .style('opacity', 1)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY + 10) + 'px')
      .html(html);
  }

  // private showTooltip(event: MouseEvent, html: string): void {
  //   const tooltip = d3.select(this.tooltip.nativeElement);
  //   const tooltipElement = this.tooltip.nativeElement;
  //   const offset = 15;

  //   tooltip
  //     .style('opacity', 1)
  //     .html(html);

  //   const tooltipWidth = tooltipElement.offsetWidth;
  //   const tooltipHeight = tooltipElement.offsetHeight;
  //   const viewportWidth = window.innerWidth;
  //   const viewportHeight = window.innerHeight;

  //   // Default position (right and below cursor)
  //   let left = event.pageX + offset;
  //   let top = event.pageY + offset;

  //   // Check right edge
  //   if (left + tooltipWidth > viewportWidth - 5) {
  //     left = event.pageX - tooltipWidth - offset;
  //   }

  //   // Check left edge
  //   if (left < 5) {
  //     left = offset;
  //   }

  //   // Check bottom edge
  //   if (top + tooltipHeight > viewportHeight - 5) {
  //     top = event.pageY - tooltipHeight - offset;
  //   }

  //   tooltip
  //     .style('left', left + 'px')
  //     .style('top', top + 'px');
  // }

  private hideTooltip(): void {
    d3.select(this.tooltip.nativeElement).style('opacity', 0);
  }
}

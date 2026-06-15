'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DailyData {
  date: string;
  uptime: number;
  totalChecks: number;
  downChecks: number;
}

interface UptimeData {
  overallUptime: number;
  dailyData: DailyData[];
  totalChecks: number;
  lastCheck: any;
}

export default function Home() {
  const [data, setData] = useState<UptimeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    fetch('/api/uptime')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (uptime: number) => {
    if (uptime >= 99) return 'bg-green-500';
    if (uptime >= 95) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (uptime: number) => {
    if (uptime >= 99) return 'Operational';
    if (uptime >= 95) return 'Degraded';
    return 'Outage';
  };

  const getStatusTextColor = (uptime: number) => {
    if (uptime >= 99) return 'text-green-600';
    if (uptime >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-row items-center justify-between">
            <a href="https://pinleads.org/" className="text-xl font-bold text-foreground">
            <img src="/favicon.png" alt="PinLeads Logo" className="w-10 h-10 sm:w-14 sm:h-14 rounded-full" />
            PinLeads</a>
            <nav className="hidden md:flex gap-6 text-sm">
              <a href="https://pinleads.org/about" className="text-foreground hover:opacity-80">About</a>
              <a href="https://pinleads.org/features" className="text-foreground hover:opacity-80">Features</a>
              <a href="https://pinleads.org/pricing" className="text-foreground hover:opacity-80">Pricing</a>
              <a href="https://pinleads.org/demo" className="text-foreground hover:opacity-80">Demo</a>
              <a href="https://pinleads.org/support" className="text-foreground hover:opacity-80">Help</a>
              <a href="https://pinleads.org/blog" className="text-foreground hover:opacity-80">Blog</a>
            </nav>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-foreground">Loading server health and metrics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-row items-center justify-between">
          <a href="https://pinleads.org/" className="text-3xl font-bold text-foreground flex items-center gap-2 -ml-2">
          <img src="/favicon.png" alt="PinLeads Logo" className="w-10 h-10 rounded-full" />
          PinLeads</a>
          <nav className="hidden md:flex gap-6 text-sm">
            <a href="https://pinleads.org/about" className="text-foreground hover:opacity-80">About</a>
            <a href="https://pinleads.org/features" className="text-foreground hover:opacity-80">Features</a>
            <a href="https://pinleads.org/pricing" className="text-foreground hover:opacity-80">Pricing</a>
            <a href="https://pinleads.org/demo" className="text-foreground hover:opacity-80">Demo</a>
            <a href="https://pinleads.org/support" className="text-foreground hover:opacity-80">Help</a>
            <a href="https://pinleads.org/blog" className="text-foreground hover:opacity-80">Blog</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">System Status</h1>
          <p className="text-foreground opacity-70">Real-time uptime monitoring for pinleads.org</p>
        </div>

        {/* Overall Status */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Overall Status</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(data?.overallUptime || 0)}`} />
              <span className={`text-lg font-medium ${getStatusTextColor(data?.overallUptime || 0)}`}>
                {getStatusText(data?.overallUptime || 0)}
              </span>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2 text-foreground">
            {data?.overallUptime.toFixed(2)}% Uptime
          </div>
          <p className="text-foreground opacity-70">
            Based on {data?.totalChecks} checks over the last 90 days
          </p>
        </div>

        {/* Last Check */}
        {data?.lastCheck && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Last Check</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-foreground opacity-50 text-sm mb-1">Status</p>
                <p className={`font-semibold ${data.lastCheck.status === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {data.lastCheck.status.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-foreground opacity-50 text-sm mb-1">Response Time</p>
                <p className="font-semibold text-foreground">{data.lastCheck.responseTime}ms</p>
              </div>
              <div>
                <p className="text-foreground opacity-50 text-sm mb-1">Timestamp</p>
                <p className="font-semibold text-foreground">{new Date(data.lastCheck.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* 90-Day History */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-foreground">90-Day History</h2>
          <div className="grid grid-cols-10 gap-2">
            {data?.dailyData.map((day) => (
              <div
                key={day.date}
                className={`aspect-square rounded ${getStatusColor(day.uptime)} cursor-pointer hover:opacity-80 transition-opacity`}
                title={`${day.date}: ${day.uptime.toFixed(1)}% uptime (${day.downChecks} downtime)`}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-foreground opacity-70">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>&gt;99% uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span>95-99% uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>&lt;95% uptime</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-12 justify-center">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8 mx-auto">
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Product</h3>
              <ul className="space-y-2 text-sm text-foreground opacity-70">
                <li><a href="https://pinleads.org/pricing" className="hover:opacity-80">Pricing</a></li>
                <li><a href="https://pinleads.org/demo" className="hover:opacity-80">Demo</a></li>
                <li><a href="https://pinleads.org/tools" className="hover:opacity-80">Free Tools</a></li>
                <li><a href="https://pinleads.org/extension" className="hover:opacity-80">Chrome Extension</a></li>
                <li><a href="https://pinleads.org/zapier" className="hover:opacity-80">Zapier Integration</a></li>
                <li><a href="https://pinleads.org/hubspot" className="hover:opacity-80">HubSpot Integration</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Use Cases</h3>
              <ul className="space-y-2 text-sm text-foreground opacity-70">
                <li><a href="https://pinleads.org/for" className="hover:opacity-80">For Your Business</a></li>
                <li><a href="https://pinleads.org/for/teams" className="hover:opacity-80">Teams</a></li>
                <li><a href="https://pinleads.org/for/saas-sales-teams" className="hover:opacity-80">SaaS Sales</a></li>
                <li><a href="https://pinleads.org/for/marketing-agencies" className="hover:opacity-80">Marketing Agencies</a></li>
                <li><a href="https://pinleads.org/for/seo-agencies" className="hover:opacity-80">SEO Agencies</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-foreground opacity-70">
                <li><a href="https://pinleads.org/about" className="hover:opacity-80">About</a></li>
                <li><a href="https://pinleads.org/blog" className="hover:opacity-80">Blog</a></li>
                <li><a href="https://pinleads.org/contact" className="hover:opacity-80">Contact</a></li>
                <li><a href="https://pinleads.org/changelog" className="hover:opacity-80">Changelog</a></li>
                <li><a href="https://pinleads.org/roadmap" className="hover:opacity-80">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-foreground opacity-70">
                <li><a href="https://pinleads.org/privacy" className="hover:opacity-80">Privacy</a></li>
                <li><a href="https://pinleads.org/terms" className="hover:opacity-80">Terms</a></li>
                <li><a href="https://twitter.com/pinleads" className="hover:opacity-80">X (Twitter)</a></li>
                <li><a href="https://www.linkedin.com/company/pinleads" className="hover:opacity-80">LinkedIn</a></li>
              </ul>
            </div>
            <div>
              <div className='flex flex-row items-center my-auto'>
                <Link href="/" className="flex flex-row -ml-2">
                  <img src="/favicon.png" alt="PinLeads Logo" className="w-10 h-10 sm:w-14 sm:h-14 rounded-full" />
                  <div className="flex flex-col align-center my-auto h-full justify-center items-center">  
                    <p className="text-3xl sm:text-4xl text-foreground">PinLeads</p>
                    <p className="tiny-text2 text-foreground opacity-70">automated b2b lead generation</p>
                  </div>
                </Link>
              </div>
              <p className="footer-tagline pt-2">
                Extract business names, emails, phone numbers, and LinkedIn profiles from Google Maps at scale with our powerful Google Maps scraper and data extraction tools.
              </p>
              <div className="border-t border-border mt-4 pt-4 text-sm text-foreground">
                TM & © 2026 PinLeads is a subsidiary of <a className="hover:text-emerald-600 transition-colors duration-200 text-emerald-500 font-medium" href="https://hookerhillstudios.com">Hooker Hill Studios</a>. All rights reserved.
              </div>
            </div>
            
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

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

    // In development, run uptime checks every 10 seconds
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        fetch('/api/test-check')
          .then(res => res.json())
          .then(() => {
            // Refresh uptime data after check
            return fetch('/api/uptime');
          })
          .then(res => res.json())
          .then(setData)
          .catch(console.error);
      }, 10000);

      return () => clearInterval(interval);
    }
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
      <div className="min-h-screen bg-white flex flex-col">
        <header className="border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="https://pinleads.org/" className="text-xl font-bold">PinLeads</a>
            <nav className="hidden md:flex gap-6 text-sm">
              <a href="https://pinleads.org/about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="https://pinleads.org/features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="https://pinleads.org/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="https://pinleads.org/demo" className="text-gray-600 hover:text-gray-900">Demo</a>
              <a href="https://pinleads.org/support" className="text-gray-600 hover:text-gray-900">Help</a>
              <a href="https://pinleads.org/blog" className="text-gray-600 hover:text-gray-900">Blog</a>
            </nav>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Loading server health and metrics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="https://pinleads.org/" className="text-xl font-bold">PinLeads</a>
          <nav className="hidden md:flex gap-6 text-sm">
            <a href="https://pinleads.org/about" className="text-gray-600 hover:text-gray-900">About</a>
            <a href="https://pinleads.org/features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="https://pinleads.org/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="https://pinleads.org/demo" className="text-gray-600 hover:text-gray-900">Demo</a>
            <a href="https://pinleads.org/support" className="text-gray-600 hover:text-gray-900">Help</a>
            <a href="https://pinleads.org/blog" className="text-gray-600 hover:text-gray-900">Blog</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Status</h1>
          <p className="text-gray-600">Real-time uptime monitoring for pinleads.org</p>
        </div>

        {/* Overall Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Overall Status</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(data?.overallUptime || 0)}`} />
              <span className={`text-lg font-medium ${getStatusTextColor(data?.overallUptime || 0)}`}>
                {getStatusText(data?.overallUptime || 0)}
              </span>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">
            {data?.overallUptime.toFixed(2)}% Uptime
          </div>
          <p className="text-gray-600">
            Based on {data?.totalChecks} checks over the last 90 days
          </p>
        </div>

        {/* Last Check */}
        {data?.lastCheck && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Last Check</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Status</p>
                <p className={`font-semibold ${data.lastCheck.status === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {data.lastCheck.status.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Response Time</p>
                <p className="font-semibold">{data.lastCheck.responseTime}ms</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Timestamp</p>
                <p className="font-semibold">{new Date(data.lastCheck.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* 90-Day History */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">90-Day History</h2>
          <div className="grid grid-cols-10 gap-2">
            {data?.dailyData.map((day) => (
              <div
                key={day.date}
                className={`aspect-square rounded ${getStatusColor(day.uptime)} cursor-pointer hover:opacity-80 transition-opacity`}
                title={`${day.date}: ${day.uptime.toFixed(1)}% uptime (${day.downChecks} downtime)`}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
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
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12 justify-center">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8 mx-auto">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="https://pinleads.org/pricing" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="https://pinleads.org/demo" className="hover:text-gray-900">Demo</a></li>
                <li><a href="https://pinleads.org/tools" className="hover:text-gray-900">Free Tools</a></li>
                <li><a href="https://pinleads.org/extension" className="hover:text-gray-900">Chrome Extension</a></li>
                <li><a href="https://pinleads.org/zapier" className="hover:text-gray-900">Zapier Integration</a></li>
                <li><a href="https://pinleads.org/hubspot" className="hover:text-gray-900">HubSpot Integration</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Use Cases</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="https://pinleads.org/for" className="hover:text-gray-900">For Your Business</a></li>
                <li><a href="https://pinleads.org/for/teams" className="hover:text-gray-900">Teams</a></li>
                <li><a href="https://pinleads.org/for/saas-sales-teams" className="hover:text-gray-900">SaaS Sales</a></li>
                <li><a href="https://pinleads.org/for/marketing-agencies" className="hover:text-gray-900">Marketing Agencies</a></li>
                <li><a href="https://pinleads.org/for/seo-agencies" className="hover:text-gray-900">SEO Agencies</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="https://pinleads.org/about" className="hover:text-gray-900">About</a></li>
                <li><a href="https://pinleads.org/blog" className="hover:text-gray-900">Blog</a></li>
                <li><a href="https://pinleads.org/contact" className="hover:text-gray-900">Contact</a></li>
                <li><a href="https://pinleads.org/changelog" className="hover:text-gray-900">Changelog</a></li>
                <li><a href="https://pinleads.org/roadmap" className="hover:text-gray-900">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="https://pinleads.org/privacy" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="https://pinleads.org/terms" className="hover:text-gray-900">Terms</a></li>
                <li><a href="https://twitter.com/pinleads" className="hover:text-gray-900">X (Twitter)</a></li>
                <li><a href="https://www.linkedin.com/company/pinleads" className="hover:text-gray-900">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-sm text-gray-600">
            TM & © 2026 PinLeads is a subsidiary of <a href="https://hookerhillstudios.com" className="hover:text-gray-900">Hooker Hill Studios</a>. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

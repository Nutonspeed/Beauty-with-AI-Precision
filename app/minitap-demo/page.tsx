import React from 'react';

export default function MinitapDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Opening the <span className="text-blue-600">mobile world</span> to AI agents.
          </h1>
          <div className="flex justify-center space-x-4 mb-8">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Join Cloud Waitlist
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">⭐</span>
              <span className="font-semibold">1.6k</span>
              <span>Github</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Discord</span>
            </div>
          </div>
          <p className="text-lg text-gray-600">1st on Android World Benchmark</p>
        </div>
      </section>

      {/* Mobile-Use Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Mobile-Use</h2>
          <p className="text-xl text-gray-600 mb-12">
            Fast, Scalable, Stateful mobile Infrastructure for AI Agents.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">Device Virtualization</h3>
              <p>Virtualize devices for AI agent interactions.</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">Cloud Workflows</h3>
              <p>Run workflows on cloud-based devices.</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">Visual AI Understanding</h3>
              <p>AI-powered visual recognition for mobile apps.</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">Reliable Interactions</h3>
              <p>Tap, Swipe, Type, Navigate seamlessly.</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">Cross-Platform</h3>
              <p>Support iOS & Android.</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">No-Code Workflow Builder</h3>
              <p>Build workflows without coding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">Features</h2>
          <p className="text-center text-lg text-gray-600 mb-12">
            Mobile-use is the first reliable platform that lets AI agents tap, swipe, and navigate any mobile app through device virtualization and visual AI.
          </p>
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">Minitap Cloud</h3>
            <p>Run your Workflows on Devices on Minitap Cloud.</p>
            <ul className="list-disc list-inside mt-4 text-left max-w-md mx-auto">
              <li>Lightning-Fast Infrastructure for AI Development</li>
              <li>Massive Parallelization for Mobile Devices</li>
              <li>Separated & Isolated Runtime Protection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Mobile App Testing & QA</h3>
              <p>Automate regression and user journey testing across real devices.</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Ecommerce Automation</h3>
              <p>Automate storefront operations and repetitive mobile workflows.</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Social Media Management</h3>
              <p>Manage cross-platform posting and scheduling without relying on APIs.</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Accessibility & Compliance</h3>
              <p>Ensure your mobile apps work for everyone.</p>
            </div>
            <div className="p-6 border rounded-lg md:col-span-2">
              <h3 className="text-xl font-semibold mb-4">AI Agent Platforms</h3>
              <p>Train and evaluate agentic models in realistic mobile environments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Backed By Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Backed By</h2>
          <div className="flex justify-center space-x-8">
            {/* Placeholder for logos */}
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">Logo 1</div>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">Logo 2</div>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">Logo 3</div>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">Logo 4</div>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">Logo 5</div>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">Logo 6</div>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">Logo 7</div>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">Logo 8</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-blue-600 text-white text-center">
        <p>&copy; 2025 Minitap Demo. Inspired by minitap.ai</p>
      </footer>
    </div>
  );
}
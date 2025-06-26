'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Mail, 
  Bot, 
  Database, 
  Globe, 
  Bell,
  Shield,
  Zap,
  MessageSquare,
  Brain,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // AI Configuration
    ai: {
      provider: 'claude',
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 30000,
      fallbackEnabled: true,
      languageDetection: true
    },
    
    // Email Processing
    email: {
      autoReply: true,
      processingDelay: 0,
      maxEmailsPerHour: 100,
      responseTemplate: 'professional',
      signatureEnabled: true,
      signature: 'Dubai Travel Agent\nYour Dream Dubai Experience Awaits!'
    },
    
    // Notifications
    notifications: {
      escalationEmail: 'agent@dubaitravel.com',
      emailEnabled: true
    },
    
    // Language Support
    languages: {
      supported: ['pl', 'en', 'fr', 'de', 'es', 'it', 'ru'],
      defaultLanguage: 'pl',
      autoDetection: true,
      fallbackLanguage: 'en'
    },
    
    // Knowledge Base
    knowledgeBase: {
      autoUpdate: true,
      searchEnabled: true,
      maxResults: 10,
      relevanceThreshold: 0.7,
      categoriesEnabled: true
    },
    
    // Performance
    performance: {
      cacheEnabled: true,
      cacheTTL: 3600,
      rateLimiting: true,
      maxRequestsPerMinute: 60,
      timeoutSeconds: 30
    }
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'ai', label: 'AI Configuration', icon: Brain },
    { id: 'email', label: 'Email Processing', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'languages', label: 'Languages', icon: Globe },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'performance', label: 'Performance', icon: Zap }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your Dubai Travel AI Agent</p>
      </div>

      {/* Save Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium ${
            saved 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'ai' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Configuration
                </CardTitle>
                <CardDescription>
                  Configure Claude AI settings and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">AI Provider</label>
                    <select
                      value={settings.ai.provider}
                      onChange={(e) => updateSetting('ai', 'provider', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="claude">Claude AI (Anthropic) - Recommended</option>
                      <option value="fallback">Fallback Responses</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Claude provides intelligent, context-aware responses
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Temperature</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.ai.temperature}
                      onChange={(e) => updateSetting('ai', 'temperature', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      Current: {settings.ai.temperature} (0 = Conservative, 1 = Creative)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Tokens</label>
                    <input
                      type="number"
                      value={settings.ai.maxTokens}
                      onChange={(e) => updateSetting('ai', 'maxTokens', parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg"
                      min="100"
                      max="4000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum length of AI responses (100-4000)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Timeout (ms)</label>
                    <input
                      type="number"
                      value={settings.ai.timeout}
                      onChange={(e) => updateSetting('ai', 'timeout', parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg"
                      min="5000"
                      max="60000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Request timeout (5000-60000ms)
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.ai.fallbackEnabled}
                      onChange={(e) => updateSetting('ai', 'fallbackEnabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Enable Fallback Responses</span>
                    <span className="text-xs text-gray-500 ml-2">
                      Use simple responses if Claude is unavailable
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.ai.languageDetection}
                      onChange={(e) => updateSetting('ai', 'languageDetection', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Automatic Language Detection</span>
                    <span className="text-xs text-gray-500 ml-2">
                      Detect and respond in customer's language
                    </span>
                  </label>
                </div>

                {/* Claude API Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Claude AI Status</h4>
                  <p className="text-sm text-blue-700">
                    Make sure to set your ANTHROPIC_API_KEY in the environment variables.
                    <br />
                    Current provider: <strong>{settings.ai.provider}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'email' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Processing
                </CardTitle>
                <CardDescription>
                  Configure email processing and auto-reply settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.email.autoReply}
                      onChange={(e) => updateSetting('email', 'autoReply', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Enable Auto-Reply</span>
                    <span className="text-xs text-gray-500 ml-2">
                      Automatically send responses to customer emails
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.email.signatureEnabled}
                      onChange={(e) => updateSetting('email', 'signatureEnabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Include Email Signature</span>
                    <span className="text-xs text-gray-500 ml-2">
                      Add signature to all outgoing emails
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Processing Delay (seconds)</label>
                    <input
                      type="number"
                      value={settings.email.processingDelay}
                      onChange={(e) => updateSetting('email', 'processingDelay', parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg"
                      min="0"
                      max="300"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Delay before processing emails (0-300 seconds)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Emails/Hour</label>
                    <input
                      type="number"
                      value={settings.email.maxEmailsPerHour}
                      onChange={(e) => updateSetting('email', 'maxEmailsPerHour', parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg"
                      min="1"
                      max="1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Rate limit for email processing
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Response Template</label>
                  <select
                    value={settings.email.responseTemplate}
                    onChange={(e) => updateSetting('email', 'responseTemplate', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="concise">Concise</option>
                    <option value="detailed">Detailed</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Style of AI-generated responses
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Signature</label>
                  <textarea
                    value={settings.email.signature}
                    onChange={(e) => updateSetting('email', 'signature', e.target.value)}
                    className="w-full p-2 border rounded-lg h-24"
                    placeholder="Your email signature..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Signature added to all outgoing emails
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Escalation Email</label>
                  <input
                    type="email"
                    value={settings.notifications.escalationEmail}
                    onChange={(e) => updateSetting('notifications', 'escalationEmail', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="agent@dubaitravel.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email address for important notifications
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailEnabled}
                      onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Email Notifications</span>
                    <span className="text-xs text-gray-500 ml-2">
                      Receive email alerts for important events
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'languages' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Language Support
                </CardTitle>
                <CardDescription>
                  Configure multi-language support settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Language</label>
                  <select
                    value={settings.languages.defaultLanguage}
                    onChange={(e) => updateSetting('languages', 'defaultLanguage', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="pl">Polish</option>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="es">Spanish</option>
                    <option value="it">Italian</option>
                    <option value="ru">Russian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fallback Language</label>
                  <select
                    value={settings.languages.fallbackLanguage}
                    onChange={(e) => updateSetting('languages', 'fallbackLanguage', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="en">English</option>
                    <option value="pl">Polish</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Language used when detection fails
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.languages.autoDetection}
                      onChange={(e) => updateSetting('languages', 'autoDetection', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Auto-detect Language</span>
                    <span className="text-xs text-gray-500 ml-2">
                      Automatically detect customer's language
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Supported Languages</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { code: 'pl', name: 'Polish' },
                      { code: 'en', name: 'English' },
                      { code: 'fr', name: 'French' },
                      { code: 'de', name: 'German' },
                      { code: 'es', name: 'Spanish' },
                      { code: 'it', name: 'Italian' },
                      { code: 'ru', name: 'Russian' }
                    ].map(lang => (
                      <label key={lang.code} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.languages.supported.includes(lang.code)}
                          onChange={(e) => {
                            const newSupported = e.target.checked
                              ? [...settings.languages.supported, lang.code]
                              : settings.languages.supported.filter(l => l !== lang.code);
                            updateSetting('languages', 'supported', newSupported);
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{lang.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'knowledge' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Knowledge Base
                </CardTitle>
                <CardDescription>
                  Configure knowledge base settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.knowledgeBase.autoUpdate}
                      onChange={(e) => updateSetting('knowledgeBase', 'autoUpdate', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Auto-update Knowledge Base</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.knowledgeBase.searchEnabled}
                      onChange={(e) => updateSetting('knowledgeBase', 'searchEnabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Enable Knowledge Search</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.knowledgeBase.categoriesEnabled}
                      onChange={(e) => updateSetting('knowledgeBase', 'categoriesEnabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Enable Categories</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Search Results</label>
                    <input
                      type="number"
                      value={settings.knowledgeBase.maxResults}
                      onChange={(e) => updateSetting('knowledgeBase', 'maxResults', parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg"
                      min="1"
                      max="50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Relevance Threshold</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={settings.knowledgeBase.relevanceThreshold}
                      onChange={(e) => updateSetting('knowledgeBase', 'relevanceThreshold', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {settings.knowledgeBase.relevanceThreshold}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'performance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Performance Settings
                </CardTitle>
                <CardDescription>
                  Configure performance and caching settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.performance.cacheEnabled}
                      onChange={(e) => updateSetting('performance', 'cacheEnabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Enable Caching</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.performance.rateLimiting}
                      onChange={(e) => updateSetting('performance', 'rateLimiting', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Enable Rate Limiting</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cache TTL (seconds)</label>
                    <input
                      type="number"
                      value={settings.performance.cacheTTL}
                      onChange={(e) => updateSetting('performance', 'cacheTTL', parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg"
                      min="60"
                      max="86400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Requests/Minute</label>
                    <input
                      type="number"
                      value={settings.performance.maxRequestsPerMinute}
                      onChange={(e) => updateSetting('performance', 'maxRequestsPerMinute', parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg"
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timeout (seconds)</label>
                  <input
                    type="number"
                    value={settings.performance.timeoutSeconds}
                    onChange={(e) => updateSetting('performance', 'timeoutSeconds', parseInt(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                    min="5"
                    max="300"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 
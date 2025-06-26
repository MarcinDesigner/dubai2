'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Phone, 
  Mail, 
  MessageSquare,
  TrendingUp,
  Filter,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';

export default function PurchaseAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    urgent: 0,
    high: 0,
    medium: 0,
    resolved: 0,
    totalValue: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/purchase-alerts?status=${filter}`);
      const data = await response.json();
      
      if (data.alerts) {
        setAlerts(data.alerts);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching purchase alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertAction = async (alertId, action, notes = '') => {
    try {
      const response = await fetch('/api/purchase-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, alertId, notes })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh alerts
        fetchAlerts();
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error('Error handling alert action:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertTypeIcon = (alertType) => {
    switch (alertType) {
      case 'PURCHASE_READY': return '🎯';
      case 'HIGH_VALUE': return '💎';
      case 'URGENT_RESPONSE': return '🚨';
      default: return '📊';
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${Math.round(value * 100)}%`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🎯 Alerty Zakupowe
        </h1>
        <p className="text-gray-600 mt-2">System wykrywania klientów gotowych do zakupu</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pilne</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            <p className="text-xs text-muted-foreground">Wymagają natychmiastowej akcji</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wysokie</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
            <p className="text-xs text-muted-foreground">Prawdopodobieństwo &gt;70%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Średnie</CardTitle>
            <Target className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
            <p className="text-xs text-muted-foreground">Prawdopodobieństwo 50-70%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wartość Potencjalna</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Śr. gotowość: {formatPercentage(stats.averageScore)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'active' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="inline w-4 h-4 mr-1" />
            Aktywne
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'urgent' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="inline w-4 h-4 mr-1" />
            Pilne
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'resolved' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="inline w-4 h-4 mr-1" />
            Rozwiązane
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 gap-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Brak alertów w tej kategorii
              </h3>
              <p className="text-gray-500">
                {filter === 'active' && "Wszystkie aktywne alerty zostały rozwiązane."}
                {filter === 'urgent' && "Brak pilnych alertów wymagających natychmiastowej akcji."}
                {filter === 'resolved' && "Brak rozwiązanych alertów."}
              </p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.priority === 'URGENT' ? 'border-l-red-500' :
              alert.priority === 'HIGH' ? 'border-l-orange-500' :
              'border-l-yellow-500'
            }`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getAlertTypeIcon(alert.alertType)}</span>
                      <CardTitle className="text-lg">
                        {alert.clientEmail}
                      </CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </div>
                    
                    {alert.email && (
                      <CardDescription className="text-sm">
                        📧 {alert.email.subject}
                      </CardDescription>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatPercentage(alert.readinessScore)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(alert.estimatedValue)}
                    </div>
                    <div className="text-xs text-gray-400">
                      ⏱️ {alert.estimatedCloseTime}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Ready Signals */}
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">🎯 Sygnały gotowości:</h4>
                  <div className="space-y-1">
                    {alert.readySignals.map((signal, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        {signal}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Immediate Actions */}
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">⚡ Natychmiastowe akcje:</h4>
                  <div className="space-y-1">
                    {alert.immediateActions.map((action, index) => (
                      <div key={index} className="text-sm text-blue-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        {action}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <button
                    onClick={() => window.open(`mailto:${alert.clientEmail}`, '_blank')}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  
                  <button
                    onClick={() => alert.email && navigator.clipboard.writeText(alert.clientEmail)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                  >
                    <Phone className="w-4 h-4" />
                    Telefon
                  </button>
                  
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Szczegóły
                  </button>

                  {filter !== 'resolved' && (
                    <>
                      <button
                        onClick={() => handleAlertAction(alert.id, 'resolve')}
                        className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Rozwiąż
                      </button>
                      
                      <button
                        onClick={() => handleAlertAction(alert.id, 'snooze')}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                      >
                        <EyeOff className="w-4 h-4" />
                        Wstrzymaj
                      </button>
                    </>
                  )}

                  {filter === 'resolved' && (
                    <button
                      onClick={() => handleAlertAction(alert.id, 'reactivate')}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reaktywuj
                    </button>
                  )}
                </div>

                {alert.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <strong>Notatki:</strong> {alert.notes}
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-400">
                  Utworzono: {new Date(alert.createdAt).toLocaleString('pl-PL')}
                  {alert.conversation && (
                    <span className="ml-4">
                      Język: {alert.conversation.language?.toUpperCase()} | 
                      Sentiment: {alert.conversation.sentiment}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Szczegóły Alertu</h2>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <strong>Klient:</strong> {selectedAlert.clientEmail}
                </div>
                <div>
                  <strong>Typ alertu:</strong> {selectedAlert.alertType}
                </div>
                <div>
                  <strong>Priorytet:</strong> {selectedAlert.priority}
                </div>
                <div>
                  <strong>Gotowość zakupu:</strong> {formatPercentage(selectedAlert.readinessScore)}
                </div>
                <div>
                  <strong>Szacowana wartość:</strong> {formatCurrency(selectedAlert.estimatedValue)}
                </div>
                <div>
                  <strong>Czas do decyzji:</strong> {selectedAlert.estimatedCloseTime}
                </div>
                
                {selectedAlert.email && (
                  <div>
                    <strong>Email:</strong> {selectedAlert.email.subject}
                    <br />
                    <span className="text-sm text-gray-600">
                      Od: {selectedAlert.email.from} | 
                      Data: {new Date(selectedAlert.email.createdAt).toLocaleString('pl-PL')}
                    </span>
                  </div>
                )}

                <div>
                  <strong>Sygnały gotowości:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {selectedAlert.readySignals.map((signal, index) => (
                      <li key={index} className="text-sm">{signal}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong>Rekomendowane akcje:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {selectedAlert.immediateActions.map((action, index) => (
                      <li key={index} className="text-sm">{action}</li>
                    ))}
                  </ul>
                </div>

                {selectedAlert.nextSteps && selectedAlert.nextSteps.length > 0 && (
                  <div>
                    <strong>Następne kroki:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {selectedAlert.nextSteps.map((step, index) => (
                        <li key={index} className="text-sm">{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
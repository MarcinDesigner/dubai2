'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Bot,
  Eye,
  Reply,
  Filter,
  Search,
  Calendar,
  Globe,
  TrendingUp,
  Heart,
  Meh,
  Frown
} from 'lucide-react';

export default function EmailsPage() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, [filter, searchTerm]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/emails?${params}`);
      const data = await response.json();
      setEmails(data.emails || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (emailId) => {
    try {
      const response = await fetch(`/api/emails/${emailId}/conversation`);
      const data = await response.json();
      setConversation(data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
    fetchConversation(email.id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESPONDED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ESCALATED': return 'bg-red-100 text-red-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <Heart className="w-4 h-4 text-green-600" />;
      case 'negative': return <Frown className="w-4 h-4 text-red-600" />;
      case 'frustrated': return <AlertTriangle className="w-4 h-4 text-red-700" />;
      case 'angry': return <AlertTriangle className="w-4 h-4 text-red-800" />;
      default: return <Meh className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  const formatPurchaseProbability = (probability) => {
    if (!probability) return 'N/A';
    return `${Math.round(probability * 100)}%`;
  };

  const fetchEmailsFromServer = async () => {
    setFetching(true);
    try {
      const response = await fetch('/api/email/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Sukces! Przetworzono ${result.emails.length} emaili`);
        await fetchEmails();
      } else {
        alert(`❌ Błąd: ${result.error}\n\n${result.details || ''}`);
      }
    } catch (error) {
      console.error('Error fetching emails from server:', error);
      alert(`❌ Błąd połączenia: ${error.message}`);
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zarządzanie Emailami</h1>
          <p className="text-gray-600 mt-2">Przeglądaj i zarządzaj wszystkimi emailami klientów</p>
        </div>
        
        <button
          onClick={fetchEmailsFromServer}
          disabled={fetching}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            fetching 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {fetching ? '🔄 Pobieranie...' : '📧 Pobierz nowe emaile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Wszystkie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Nowe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Odpowiedziane</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.responded || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Eskalowane</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.escalated || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="inline w-4 h-4 mr-1" />
            Wszystkie
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'PENDING' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="inline w-4 h-4 mr-1" />
            Oczekujące
          </button>
          <button
            onClick={() => setFilter('RESPONDED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'RESPONDED' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="inline w-4 h-4 mr-1" />
            Odpowiedziane
          </button>
          <button
            onClick={() => setFilter('ESCALATED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'ESCALATED' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="inline w-4 h-4 mr-1" />
            Eskalowane
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Szukaj po nadawcy, temacie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lista Emaili ({emails.length})</CardTitle>
              <CardDescription>Kliknij na email aby zobaczyć szczegóły konwersacji</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emails.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Brak emaili</h3>
                    <p className="text-gray-500">
                      {filter === 'all' 
                        ? "Nie ma jeszcze żadnych emaili w systemie."
                        : `Brak emaili ze statusem "${filter}".`
                      }
                    </p>
                  </div>
                ) : (
                  emails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => handleEmailSelect(email)}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedEmail?.id === email.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{email.subject}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {email.from}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                            {email.status}
                          </span>
                          <div className="text-xs text-gray-500">
                            <Calendar className="inline w-3 h-3 mr-1" />
                            {formatDate(email.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* AI Analysis Row */}
                      {email.conversation && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                          {email.conversation.language && (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              <Globe className="w-3 h-3" />
                              {email.conversation.language.toUpperCase()}
                            </span>
                          )}
                          
                          {email.conversation.sentiment && (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {getSentimentIcon(email.conversation.sentiment)}
                              {email.conversation.sentiment}
                            </span>
                          )}
                          
                          {email.conversation.priority && (
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(email.conversation.priority)} bg-gray-100`}>
                              {email.conversation.priority}
                            </span>
                          )}
                          
                          {email.conversation.purchaseProbability && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              email.conversation.purchaseProbability > 0.7 
                                ? 'bg-green-100 text-green-800'
                                : email.conversation.purchaseProbability > 0.4
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <TrendingUp className="inline w-3 h-3 mr-1" />
                              {formatPurchaseProbability(email.conversation.purchaseProbability)}
                            </span>
                          )}
                          
                          {email.conversation.escalated && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold">
                              🚨 ESKALACJA
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Szczegóły Konwersacji
              </CardTitle>
              <CardDescription>
                {selectedEmail ? `Konwersacja z ${selectedEmail.from}` : 'Wybierz email aby zobaczyć konwersację'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedEmail ? (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Wybierz email z listy aby zobaczyć szczegóły konwersacji</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Email Info */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 mb-1">Oryginalny Email</div>
                    <div className="text-sm text-gray-600">
                      <div><strong>Od:</strong> {selectedEmail.from}</div>
                      <div><strong>Do:</strong> {selectedEmail.to}</div>
                      <div><strong>Temat:</strong> {selectedEmail.subject}</div>
                      <div><strong>Data:</strong> {formatDate(selectedEmail.createdAt)}</div>
                    </div>
                  </div>

                  {/* Conversation Messages */}
                  {conversation ? (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-900">Konwersacja:</div>
                      {conversation.messages && conversation.messages.length > 0 ? (
                        conversation.messages.map((message, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${
                              message.sender === 'CLIENT'
                                ? 'bg-blue-50 border-l-4 border-blue-400'
                                : 'bg-green-50 border-l-4 border-green-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {message.sender === 'CLIENT' ? (
                                <User className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Bot className="w-4 h-4 text-green-600" />
                              )}
                              <span className="text-sm font-medium">
                                {message.sender === 'CLIENT' ? 'Klient' : 'AI Agent'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          Brak wiadomości w konwersacji
                        </div>
                      )}

                      {/* AI Response from Email */}
                      {selectedEmail.response && (
                        <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Reply className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Wygenerowana Odpowiedź AI (do wysłania)</span>
                          </div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {selectedEmail.response}
                          </div>
                        </div>
                      )}

                      {/* Email Content Preview */}
                      <div className="p-3 bg-gray-50 border-l-4 border-gray-400 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">Treść Oryginalnego Emaila</span>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {selectedEmail.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Ładowanie konwersacji...</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
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
  const [deleting, setDeleting] = useState(false);

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

  const deleteAllEmails = async () => {
    const confirmed = window.confirm(
      '⚠️ UWAGA!\n\nCzy na pewno chcesz usunąć WSZYSTKIE emaile z bazy danych?\n\nTa operacja jest nieodwracalna i usunie:\n- Wszystkie emaile\n- Wszystkie konwersacje\n- Wszystkie analizy AI\n\nKliknij OK aby kontynuować lub Anuluj aby przerwać.'
    );
    
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/emails', {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Sukces!\n\n${result.message}`);
        setSelectedEmail(null);
        setConversation(null);
        await fetchEmails();
      } else {
        alert(`❌ Błąd: ${result.error}\n\n${result.details || ''}`);
      }
    } catch (error) {
      console.error('Error deleting emails:', error);
      alert(`❌ Błąd połączenia: ${error.message}`);
    } finally {
      setDeleting(false);
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
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Zarządzanie Emailami</h1>
          <p className="text-sm text-gray-600 mt-1">Przeglądaj i zarządzaj wszystkimi emailami klientów</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={deleteAllEmails}
            disabled={deleting}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              deleting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {deleting ? '🗑️ Usuwanie...' : '🗑️ Usuń wszystkie'}
          </button>
          
          <button
            onClick={fetchEmailsFromServer}
            disabled={fetching}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              fetching 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {fetching ? '🔄 Pobieranie...' : '📧 Pobierz nowe'}
          </button>
        </div>
      </div>



      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex space-x-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="inline w-3 h-3 mr-1" />
            Wszystkie
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              filter === 'PENDING' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="inline w-3 h-3 mr-1" />
            Oczekujące
          </button>
          <button
            onClick={() => setFilter('RESPONDED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              filter === 'RESPONDED' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="inline w-3 h-3 mr-1" />
            Odpowiedziane
          </button>
          <button
            onClick={() => setFilter('ESCALATED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              filter === 'ESCALATED' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="inline w-3 h-3 mr-1" />
            Eskalowane
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <input
            type="text"
            placeholder="Szukaj po nadawcy, temacie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista Emaili - kompaktowa */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Lista Emaili ({emails.length})</CardTitle>
              <CardDescription className="text-xs">Kliknij na email aby zobaczyć szczegóły</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-3 pb-3">
                {emails.length === 0 ? (
                  <div className="text-center py-6">
                    <Mail className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-xs font-medium text-gray-900 mb-1">Brak emaili</h3>
                    <p className="text-xs text-gray-500">
                      {filter === 'all' 
                        ? "Nie ma jeszcze żadnych emaili w systemie."
                        : `Brak emaili ze statusem "${filter}".`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {emails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => handleEmailSelect(email)}
                        className={`compact-card ${
                          selectedEmail?.id === email.id ? 'selected' : ''
                        }`}
                      >
                        <div className="mb-1.5">
                          <div className="font-medium text-xs text-gray-900 mb-1 line-clamp-2">{email.subject}</div>
                          <div className="text-xs text-gray-600 flex items-center gap-1 mb-1.5">
                            <User className="w-2.5 h-2.5" />
                            <span className="truncate">{email.from}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`compact-badge ${getStatusColor(email.status)}`}>
                              {email.status}
                            </span>
                            <div className="text-xs text-gray-500">
                              {formatDate(email.createdAt).split(' ')[0]}
                            </div>
                          </div>
                        </div>

                        {/* Ultra kompaktowe AI Analysis */}
                        {email.conversation && (
                          <div className="flex flex-wrap gap-0.5 mt-1.5 pt-1.5 border-t border-gray-100">
                            {email.conversation.language && (
                              <span className="inline-flex items-center gap-0.5 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                {email.conversation.language === 'pl' ? '🇵🇱' : email.conversation.language === 'en' ? '🇬🇧' : '🌐'}
                              </span>
                            )}
                            
                            {email.conversation.sentiment && (
                              <span className="inline-flex items-center gap-0.5 text-xs bg-gray-100 text-gray-800 px-1 py-0.5 rounded">
                                {getSentimentIcon(email.conversation.sentiment)}
                              </span>
                            )}
                            
                            {email.conversation.purchaseProbability && (
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                email.conversation.purchaseProbability > 0.7 
                                  ? 'bg-green-100 text-green-800'
                                  : email.conversation.purchaseProbability > 0.4
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                <TrendingUp className="inline w-2 h-2 mr-0.5" />
                                {formatPurchaseProbability(email.conversation.purchaseProbability)}
                              </span>
                            )}
                            
                            {email.conversation.escalated && (
                              <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded font-bold">
                                🚨
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Podgląd Konwersacji - kompaktowy */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4" />
                Szczegóły Konwersacji
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedEmail ? `Konwersacja z ${selectedEmail.from}` : 'Wybierz email aby zobaczyć konwersację'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-3 pb-3">
                {!selectedEmail ? (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Wybierz email</h3>
                    <p className="text-xs text-gray-500">Kliknij na email z listy aby zobaczyć szczegóły konwersacji</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Email Info - kompaktowy nagłówek */}
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <div className="font-medium text-sm text-blue-900">Oryginalny Email</div>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ml-auto ${getStatusColor(selectedEmail.status)}`}>
                          {selectedEmail.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div><strong className="text-gray-700">Od:</strong> <span className="text-gray-900">{selectedEmail.from}</span></div>
                        <div><strong className="text-gray-700">Do:</strong> <span className="text-gray-900">{selectedEmail.to}</span></div>
                        <div className="md:col-span-2"><strong className="text-gray-700">Temat:</strong> <span className="text-gray-900">{selectedEmail.subject}</span></div>
                        <div><strong className="text-gray-700">Data:</strong> <span className="text-gray-900">{formatDate(selectedEmail.createdAt)}</span></div>
                        {selectedEmail.conversation && (
                          <div className="flex flex-wrap gap-1">
                            {selectedEmail.conversation.language && (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                {selectedEmail.conversation.language === 'pl' ? '🇵🇱' : selectedEmail.conversation.language === 'en' ? '🇬🇧' : '🌐'}
                                {selectedEmail.conversation.language.toUpperCase()}
                              </span>
                            )}
                            {selectedEmail.conversation.sentiment && (
                              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                                {getSentimentIcon(selectedEmail.conversation.sentiment)}
                                {selectedEmail.conversation.sentiment}
                              </span>
                            )}
                            {selectedEmail.conversation.priority && (
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getPriorityColor(selectedEmail.conversation.priority)} bg-gray-100`}>
                                {selectedEmail.conversation.priority}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Treść Oryginalnego Emaila - kompaktowa */}
                                         <div className="compact-section bg-gray-50 border-gray-400">
                       <div className="flex items-center gap-2 mb-2">
                         <Mail className="w-3 h-3 text-gray-600" />
                         <span className="font-medium text-xs text-gray-900">Treść Oryginalnego Emaila</span>
                       </div>
                       <div className="compact-content">
                         {selectedEmail.content}
                       </div>
                     </div>

                    {/* AI Response - kompaktowa */}
                    {selectedEmail.response && (
                                             <div className="compact-section bg-green-50 border-green-400">
                         <div className="flex items-center gap-2 mb-2">
                           <Reply className="w-3 h-3 text-green-600" />
                           <span className="font-medium text-xs text-green-900">Wygenerowana Odpowiedź AI</span>
                           <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full ml-auto">
                             Gotowa
                           </span>
                         </div>
                         <div className="compact-content">
                           {selectedEmail.response}
                         </div>
                       </div>
                    )}

                    {/* Conversation Messages - kompaktowe */}
                    {conversation ? (
                      <div className="space-y-2">
                        <div className="font-medium text-xs text-gray-900 flex items-center gap-2">
                          <MessageSquare className="w-3 h-3" />
                          Historia Konwersacji
                        </div>
                        {conversation.messages && conversation.messages.length > 0 ? (
                          <div className="space-y-2">
                            {conversation.messages.map((message, index) => (
                              <div
                                key={index}
                                className={`p-2 rounded-lg ${
                                  message.sender === 'CLIENT'
                                    ? 'bg-blue-50 border-l-4 border-blue-400'
                                    : 'bg-green-50 border-l-4 border-green-400'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  {message.sender === 'CLIENT' ? (
                                    <User className="w-3 h-3 text-blue-600" />
                                  ) : (
                                    <Bot className="w-3 h-3 text-green-600" />
                                  )}
                                  <span className="font-medium text-xs">
                                    {message.sender === 'CLIENT' ? 'Klient' : 'AI Agent'}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-auto">
                                    {formatDate(message.timestamp)}
                                  </span>
                                </div>
                                 <div className="compact-content">
                                   {message.content}
                                 </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <MessageSquare className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                            <div className="text-xs text-gray-500 italic">
                              Brak wiadomości w konwersacji
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-xs text-gray-500 mt-2">Ładowanie konwersacji...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
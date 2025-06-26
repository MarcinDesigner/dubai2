'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

export default function LearningPage() {
  const [learningEntries, setLearningEntries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [answer, setAnswer] = useState('');
  const [addToKnowledge, setAddToKnowledge] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchLearningEntries();
  }, [statusFilter]);

  const fetchLearningEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/learning?status=${statusFilter}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setLearningEntries(data.entries);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('❌ Błąd pobierania learning entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (learningId) => {
    if (!answer.trim()) {
      alert('Proszę podać odpowiedź');
      return;
    }

    try {
      const response = await fetch('/api/learning', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          learningId,
          answer: answer.trim(),
          addToKnowledgeBase: addToKnowledge
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Pytanie rozwiązane${addToKnowledge ? ' i dodane do bazy wiedzy' : ''}`);
        setSelectedEntry(null);
        setAnswer('');
        setAddToKnowledge(false);
        fetchLearningEntries();
      } else {
        alert('❌ Błąd rozwiązywania pytania');
      }
    } catch (error) {
      console.error('❌ Błąd resolving entry:', error);
      alert('❌ Błąd rozwiązywania pytania');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧠 System Uczenia AI
        </h1>
        <p className="text-gray-600">
          Zarządzaj pytaniami klientów, na które AI nie miało odpowiedzi
        </p>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">
            {stats.pending || 0}
          </div>
          <div className="text-sm text-gray-600">Oczekujące</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.resolved || 0}
          </div>
          <div className="text-sm text-gray-600">Rozwiązane</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-600">
            {stats.ignored || 0}
          </div>
          <div className="text-sm text-gray-600">Zignorowane</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {(stats.pending || 0) + (stats.resolved || 0) + (stats.ignored || 0)}
          </div>
          <div className="text-sm text-gray-600">Łącznie</div>
        </Card>
      </div>

      {/* Filtry */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['pending', 'resolved', 'ignored'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'pending' ? 'Oczekujące' : 
               status === 'resolved' ? 'Rozwiązane' : 'Zignorowane'}
              {stats[status] > 0 && (
                <span className="ml-1 text-xs">({stats[status]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lista pytań */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Ładowanie...</p>
        </div>
      ) : learningEntries.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">
            Brak pytań ze statusem "{statusFilter}"
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {learningEntries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(entry.priority)}`}>
                      {entry.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                      {entry.category.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                      {entry.language.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Od: {entry.customerEmail} | {formatDate(entry.createdAt)}
                  </p>
                </div>
                {entry.status === 'pending' && (
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Odpowiedz
                  </button>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <h4 className="font-medium text-gray-900 mb-1">Pytanie:</h4>
                <p className="text-gray-700">{entry.question}</p>
              </div>

              {entry.keywords && (
                <div className="mb-2">
                  <span className="text-xs text-gray-500">Słowa kluczowe: </span>
                  {JSON.parse(entry.keywords).map((keyword, idx) => (
                    <span key={idx} className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs mr-1">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {entry.answer && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">Odpowiedź:</h4>
                  <p className="text-green-700">{entry.answer}</p>
                  {entry.resolvedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      Rozwiązane: {formatDate(entry.resolvedAt)}
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal odpowiedzi */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                Odpowiedz na pytanie
              </h3>
              
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Pytanie klienta:</h4>
                <p className="text-gray-700">{selectedEntry.question}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Od: {selectedEntry.customerEmail} | Kategoria: {selectedEntry.category} | Język: {selectedEntry.language}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twoja odpowiedź:
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Napisz profesjonalną odpowiedź dla klienta..."
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={addToKnowledge}
                    onChange={(e) => setAddToKnowledge(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Dodaj tę odpowiedź do bazy wiedzy AI
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedEntry(null);
                    setAnswer('');
                    setAddToKnowledge(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => handleResolve(selectedEntry.id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Zapisz odpowiedź
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
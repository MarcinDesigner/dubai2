'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const categories = [
    { value: 'HOTELS', label: 'Hotele' },
    { value: 'ATTRACTIONS', label: 'Atrakcje' },
    { value: 'RESTAURANTS', label: 'Restauracje' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'WEATHER', label: 'Pogoda' },
    { value: 'GENERAL', label: 'Ogólne' },
    { value: 'FAQ', label: 'FAQ' }
  ];

  useEffect(() => {
    fetchKnowledge();
  }, [searchTerm, selectedCategory]);

  const fetchKnowledge = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/knowledge?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setKnowledge(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      
      // Set fallback data when database is not available
      setKnowledge([
        {
          id: 'demo-1',
          title: 'Baza danych niedostępna',
          content: 'Skonfiguruj DATABASE_URL w pliku .env.local aby zobaczyć rzeczywiste dane z bazy wiedzy. Skopiuj env-template.txt do .env.local i wypełnij odpowiednie dane.',
          category: 'GENERAL',
          tags: ['konfiguracja', 'baza-danych']
        },
        {
          id: 'demo-2',
          title: 'Przykładowa informacja o Dubaju',
          content: 'To jest przykładowa informacja, która będzie zastąpiona prawdziwymi danymi po skonfigurowaniu bazy danych.',
          category: 'GENERAL',
          tags: ['demo', 'przykład']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { ...formData, id: editingItem.id } : formData;

      const response = await fetch('/api/knowledge', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchKnowledge();
        setShowAddForm(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error saving knowledge:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Czy na pewno chcesz usunąć ten element?')) return;

    try {
      const response = await fetch(`/api/knowledge?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchKnowledge();
      }
    } catch (error) {
      console.error('Error deleting knowledge:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Ładowanie bazy wiedzy...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Baza Wiedzy</h1>
        <p className="text-gray-600 mt-2">Zarządzaj informacjami o Dubaju dla AI Assistant</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Szukaj w bazie wiedzy..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Wszystkie kategorie</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Dodaj
        </button>
      </div>

      {/* Knowledge Items */}
      <div className="grid grid-cols-1 gap-4">
        {Array.isArray(knowledge) && knowledge.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>
                    Kategoria: {categories.find(c => c.value === item.category)?.label}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowAddForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">{item.content}</p>
              {(() => {
                try {
                  const tags = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;
                  return Array.isArray(tags) && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  );
                } catch (e) {
                  return null;
                }
              })()}
            </CardContent>
          </Card>
        ))}
      </div>

      {knowledge.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brak elementów</h3>
          <p className="text-gray-600">Dodaj pierwszą informację do bazy wiedzy</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <KnowledgeForm
          item={editingItem}
          categories={categories}
          onSave={handleSave}
          onClose={() => {
            setShowAddForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

function KnowledgeForm({ item, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    content: item?.content || '',
    category: item?.category || 'GENERAL',
    tags: (() => {
      try {
        const tags = typeof item?.tags === 'string' ? JSON.parse(item.tags) : item?.tags;
        return Array.isArray(tags) ? tags.join(', ') : '';
      } catch (e) {
        return '';
      }
    })()
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">
          {item ? 'Edytuj' : 'Dodaj'} element bazy wiedzy
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tytuł</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Kategoria</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Treść</label>
            <textarea
              required
              rows={6}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tagi (oddzielone przecinkami)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="dubaj, hotel, atrakcje"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {item ? 'Zapisz zmiany' : 'Dodaj'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Plus,
  Trash2,
  Edit2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

export function ChatsPage() {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const list = await api.getConversations();
    setConversations(list);
  };

  const handleCreate = async () => {
    const newConv = await api.createConversation('Новый диалог');
    navigate(`/?c=${newConv.id}`);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Удалить этот диалог?')) {
      await api.deleteConversation(id);
      loadConversations();
    }
  };

  const handleRename = async (id, e) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    await api.updateConversation(id, { title: editTitle.trim() });
    setEditingId(null);
    loadConversations();
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">Чаты и история диалогов</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Все беседы с Kortex сохраняются локально и доступны для продолжения в любой момент
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold transition shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Новый диалог</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-6 max-w-4xl w-full mx-auto">
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по диалогам..."
            className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
          />
        </div>

        {/* Conversations List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl p-8">
            <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-300">Диалогов пока нет</p>
            <p className="text-xs text-neutral-500 mt-1">
              Нажмите «Новый диалог», чтобы начать общение с Kortex
            </p>
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-medium inline-flex items-center gap-2 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать первый диалог</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/?c=${conv.id}`)}
                className="group p-4 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700/80 transition flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>

                  <div className="truncate">
                    {editingId === conv.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-neutral-100 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={(e) => handleRename(conv.id, e)}
                          className="px-2 py-1 bg-neutral-100 text-neutral-950 rounded-lg text-xs font-semibold"
                        >
                          ОК
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-neutral-800 text-neutral-400 rounded-lg text-xs"
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xs font-semibold text-neutral-200 truncate group-hover:text-white transition">
                          {conv.title}
                        </h3>
                        <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                          <span>•</span>
                          <span>{conv.messageCount || 0} сообщений</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(conv.id);
                      setEditTitle(conv.title);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition"
                    title="Переименовать"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition"
                    title="Удалить"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 ml-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

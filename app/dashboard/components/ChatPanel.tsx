import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import CryptoJS from 'crypto-js';

interface ChatPanelProps {
  userId: string;
  openChatWithUserId?: string | null;
  onCloseChat?: () => void;
}

export default function ChatPanel({ userId, openChatWithUserId, onCloseChat }: ChatPanelProps) {
  const [chats, setChats] = useState<any[]>([]);
  const [partners, setPartners] = useState<{[chatId: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Open chat panel/select chat when openChatWithUserId changes
  useEffect(() => {
    const ensureChat = async () => {
      if (!openChatWithUserId) return;
      // Find the chat with this user
      let chat = chats.find(c =>
        (c.user_1_uid === userId && c.user_2_uid === openChatWithUserId) ||
        (c.user_2_uid === userId && c.user_1_uid === openChatWithUserId)
      );
      setOpen(true);
      if (chat) {
        setSelectedChat(chat);
      } else {
        // Auto-create chat if not exists
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('chats')
            .insert({ user_1_uid: userId, user_2_uid: openChatWithUserId })
            .select();
          if (error) throw error;
          // Refresh chats
          const { data: newChats, error: chatsError } = await supabase
            .from('chats')
            .select('*')
            .or(`user_1_uid.eq.${userId},user_2_uid.eq.${userId}`)
            .order('created_at', { ascending: false });
          if (chatsError) throw chatsError;
          setChats(newChats || []);
          // Find the new chat
          const created = (newChats || []).find(c =>
            (c.user_1_uid === userId && c.user_2_uid === openChatWithUserId) ||
            (c.user_2_uid === userId && c.user_1_uid === openChatWithUserId)
          );
          if (created) setSelectedChat(created);
        } catch (err: any) {
          setError(err.message || 'Could not create chat');
        } finally {
          setLoading(false);
        }
      }
    };
    if (openChatWithUserId) ensureChat();
  }, [openChatWithUserId, chats, userId]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [usernamesByUid, setUsernamesByUid] = useState<{ [uid: string]: string }>({});
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chats and partners
  // Fetch chats and partners
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .or(`user_1_uid.eq.${userId},user_2_uid.eq.${userId}`)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setChats(data || []);
        // Fetch partner info for each chat
        const userIds = (data || []).map((c: any) => c.user_1_uid === userId ? c.user_2_uid : c.user_1_uid);
        // Also include openChatWithUserId if not already in userIds
        if (openChatWithUserId && !userIds.includes(openChatWithUserId)) userIds.push(openChatWithUserId);
        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, username, profile_picture_url')
            .in('id', userIds);
          if (usersError) throw usersError;
          const partnersObj: {[chatId: string]: any} = {};
          (data || []).forEach((c: any) => {
            const partnerId = c.user_1_uid === userId ? c.user_2_uid : c.user_1_uid;
            partnersObj[c.chat_id] = users.find((u: any) => u.id === partnerId);
          });
          // Add openChatWithUserId as a special "pending" partner if not in any chat
          if (openChatWithUserId) {
            const pendingPartner = users.find((u: any) => u.id === openChatWithUserId);
            if (pendingPartner) partnersObj['pending'] = pendingPartner;
          }
          setPartners(partnersObj);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchChats();
  }, [userId, openChatWithUserId]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
      setMsgLoading(true);
      setMsgError(null);
      try {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', selectedChat.chat_id)
          .order('created_at', { ascending: true });
        setMessages(data || []);
        // Fetch usernames for all unique sender_uids
        const uniqueUids = Array.from(new Set((data || []).map((m: any) => m.sender_uid)));
        if (uniqueUids.length > 0) {
          const { data: usersData } = await supabase
            .from('users')
            .select('id,username')
            .in('id', uniqueUids);
          const map: { [uid: string]: string } = {};
          usersData?.forEach((u: any) => { map[u.id] = u.username; });
          setUsernamesByUid(map);
        }
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (err: any) {
        setMsgError(err.message);
      } finally {
        setMsgLoading(false);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  // Send a message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    setSending(true);
    try {
      // Encrypt message using SHA256(sender_uid + recipient_uid)
      const partnerId = selectedChat.user_1_uid === userId ? selectedChat.user_2_uid : selectedChat.user_1_uid;
      const key = CryptoJS.SHA256(userId + partnerId).toString();
      const encrypted = CryptoJS.AES.encrypt(newMessage, key).toString();
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.chat_id,
          sender_uid: userId,
          message: encrypted,
          image_url: null,
          created_at: new Date().toISOString(),
        });
      if (error) throw error;
      setNewMessage('');
      // Refresh messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', selectedChat.chat_id)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setMsgError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => {
        if (open) {
          setOpen(false);
          setSelectedChat(null);
          if (onCloseChat) onCloseChat();
        } else {
          setOpen(true);
        }
      }} className="bg-blue-600 text-white rounded-full p-3 shadow-lg">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4.39-1.02L3 21l1.12-3.72A7.978 7.978 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
      {open && (
        <div className="w-80 h-96 bg-white border rounded-lg shadow-lg p-4 mt-2 flex flex-col">
          <div className="font-bold mb-2 flex items-center">
            {selectedChat && (
              <button
                className="mr-2 text-blue-600 hover:underline text-xs"
                onClick={() => setSelectedChat(null)}
              >Back</button>
            )}
            {selectedChat ? (
              <>
                {partners[selectedChat.chat_id]?.id ? (
                  <Link href={`/dashboard/profile/${partners[selectedChat.chat_id].id}`} className="flex items-center gap-2 hover:underline">
                    {partners[selectedChat.chat_id]?.profile_picture_url ? (
                      <img
                        src={partners[selectedChat.chat_id].profile_picture_url}
                        alt={partners[selectedChat.chat_id].username}
                        className="w-7 h-7 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                        {partners[selectedChat.chat_id]?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="font-medium text-base">{partners[selectedChat.chat_id]?.username || 'Unknown'}</span>
                  </Link>
                ) : openChatWithUserId && partners['pending'] ? (
                  <div className="flex items-center gap-2">
                    {partners['pending'].profile_picture_url ? (
                      <img
                        src={partners['pending'].profile_picture_url}
                        alt={partners['pending'].username}
                        className="w-7 h-7 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                        {partners['pending'].username?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="font-medium text-base">{partners['pending'].username}</span>
                  </div>
                ) : (
                  <span>Chat with Unknown</span>
                )}
              </>
            ) : (
              <span>Chats</span>
            )}
          </div>
          {selectedChat ? (
            <React.Fragment>
              <div className="flex-1 overflow-auto space-y-2 mb-2">
                {msgLoading ? (
                  <div>Loading messages...</div>
                ) : msgError ? (
                  <div className="text-red-600">{msgError}</div>
                ) : messages.length === 0 ? (
                  <div className="text-gray-500">No messages yet.</div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={msg.message_id || idx} className={
                      'p-2 rounded ' + (msg.sender_uid === userId ? 'bg-blue-100 text-right ml-8' : 'bg-gray-100 mr-8')
                    }>
                      <div className="text-xs text-gray-500 mb-1">
                        {msg.sender_uid === userId ? 'You' : usernamesByUid[msg.sender_uid] || ''}
                      </div>
                      {msg.image_url ? (
                        <img
                          src={msg.image_url}
                          alt="Sent attachment"
                          className="max-w-[120px] max-h-[120px] rounded mb-1 inline-block"
                        />
                      ) : (
                        <div>{(() => {
                          try {
                            // Try both directions for key: sender+recipient and recipient+sender
                            const partnerId = selectedChat.user_1_uid === userId ? selectedChat.user_2_uid : selectedChat.user_1_uid;
                            let key = CryptoJS.SHA256(userId + partnerId).toString();
                            let bytes = CryptoJS.AES.decrypt(msg.message, key);
                            let decrypted = bytes.toString(CryptoJS.enc.Utf8);
                            if (!decrypted) {
                              // Try reverse order
                              key = CryptoJS.SHA256(partnerId + userId).toString();
                              bytes = CryptoJS.AES.decrypt(msg.message, key);
                              decrypted = bytes.toString(CryptoJS.enc.Utf8);
                            }
                            return decrypted || '[Encrypted]';
                          } catch {
                            return '[Encrypted]';
                          }
                        })()}</div>
                      )}
                      <div className="text-[10px] text-gray-400 mt-1">{new Date(msg.created_at).toLocaleString()}</div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef}></div>
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  disabled={sending}
                />
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                >Send</button>
              </div>
            </React.Fragment>
          ) : (
            <div className="flex-1 overflow-auto space-y-2">
              {loading && <div>Loading...</div>}
              {error && <div className="text-red-600">{error}</div>}
              {chats.length === 0 && !loading && <div className="text-gray-500">No open chats.</div>}
              {chats.map(chat => (
  <div
    key={chat.chat_id}
    className="p-2 border rounded cursor-pointer hover:bg-gray-100 flex items-center gap-2"
    onClick={() => setSelectedChat(chat)}
  >
    <Link
      href={partners[chat.chat_id]?.id ? `/profile/${partners[chat.chat_id].username}` : '#'}
      onClick={e => e.stopPropagation()}
      className="flex items-center gap-2"
    >
      {partners[chat.chat_id]?.profile_picture_url ? (
        <img
          src={partners[chat.chat_id].profile_picture_url}
          alt={partners[chat.chat_id].username}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
          {partners[chat.chat_id]?.username?.charAt(0).toUpperCase() || '?'}
        </div>
      )}
      <div>
        <div className="font-medium text-sm hover:underline">{partners[chat.chat_id]?.username || 'Unknown'}</div>
      </div>
    </Link>
    <div className="text-xs text-gray-500 ml-2">Chat ID: {chat.chat_id}</div>
  </div>
))}
</div>
          )}
        </div>
      )}
    </div>
  );
}


'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import CryptoJS from 'crypto-js';

const ChatPage = () => {
  const { chatid } = useParams();
  const [chat, setChat] = useState<any>(null);
  const [partners, setPartners] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [usernamesByUid, setUsernamesByUid] = useState<{ [uid: string]: string }>({});
  const [profilePicsByUid, setProfilePicsByUid] = useState<{ [uid: string]: string }>({});
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  // Fetch chat and messages
  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      try {
        let { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('chat_id', chatid)
          .maybeSingle();
        if (chatError) throw chatError;
        if (!chatData) {
          // Try to create the chat if partner_uid is provided
          const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const partner_uid = urlParams ? urlParams.get('partner_uid') : null;
          if (!userId || !partner_uid) {
            setError('Chat not found and cannot create chat (missing participants).');
            setLoading(false);
            return;
          }
          // Create the chat
          const { data: newChat, error: createError } = await supabase
            .from('chats')
            .insert({ user_1_uid: userId, user_2_uid: partner_uid, chat_id: chatid })
            .select()
            .single();
          if (createError) {
            setError('Could not create chat: ' + createError.message);
            setLoading(false);
            return;
          }
          chatData = newChat;
        }
        setChat(chatData);
        // Fetch partner info
        const partnerIds = [chatData.user_1_uid, chatData.user_2_uid];
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, username, profile_picture_url')
          .in('id', partnerIds);
        if (usersError) throw usersError;
        const partnersObj: any = {};
        const usernamesObj: any = {};
        const profilePicsObj: any = {};
        users.forEach((u: any) => {
          partnersObj[u.id] = u;
          usernamesObj[u.id] = u.username;
          profilePicsObj[u.id] = u.profile_picture_url;
        });
        setPartners(partnersObj);
        setUsernamesByUid(usernamesObj);
        setProfilePicsByUid(profilePicsObj);
        // Fetch messages
        const { data: msgs, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatid)
          .order('created_at', { ascending: true });
        if (msgError) throw msgError;
        setMessages(msgs || []);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (chatid) fetchChat();
  }, [chatid]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !chat) return;
    setSending(true);
    try {
      const partnerId = chat.user_1_uid === userId ? chat.user_2_uid : chat.user_1_uid;
      const key = CryptoJS.SHA256(userId + partnerId).toString();
      const encrypted = CryptoJS.AES.encrypt(newMessage, key).toString();
      const { error: sendError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatid,
          sender_uid: userId,
          message: encrypted,
          image_url: null,
          created_at: new Date().toISOString(),
        });
      if (sendError) throw sendError;
      setNewMessage('');
      // Refresh messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatid)
        .order('created_at', { ascending: true });
      setMessages(msgs || []);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8">Loading chat...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!chat) return <div className="p-8">Chat not found.</div>;

  return (
    <div className="max-w-lg mx-auto my-8 bg-white border rounded-lg shadow-lg p-4 flex flex-col min-h-[70vh]">
      <div className="font-bold mb-2 flex items-center gap-2">
        {Object.values(partners || {}).map((partner: any) => (
          <Link key={partner.id} href={`/profile/${partner.username}`} className="flex items-center gap-2 hover:underline">
            {partner.profile_picture_url ? (
              <img src={partner.profile_picture_url} alt={partner.username} className="w-7 h-7 rounded-full object-cover border" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                {partner.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <span className="font-medium text-base">{partner.username}</span>
          </Link>
        ))}
      </div>
      <div className="flex-1 overflow-auto space-y-2 mb-2">
        {messages.length === 0 ? (
          <div className="text-gray-500">No messages yet. <span className="text-blue-600">Say hi to start the conversation!</span></div>
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
                    const partnerId = chat.user_1_uid === userId ? chat.user_2_uid : chat.user_1_uid;
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
    </div>
  );
};

export default ChatPage;

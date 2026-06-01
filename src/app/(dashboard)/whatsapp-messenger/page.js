'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import Pusher from 'pusher-js';
import {
  Send,
  Search,
  MessageCircle,
  Phone,
  User,
  CheckCheck,
  Check,
  Clock,
  ArrowLeft,
  X,
  Loader,
  RefreshCw,
  ChevronLeft,
  Paperclip,
  Image,
  Smile,
  Mic,
  MoreVertical,
  Reply,
  Copy,
  Trash2,
  Pin,
  Flag,
  Download,
  Share2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react';
import LoadingSpin from '@/components/LoadingSpin';

const WhatsAppMessenger = () => {
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { token, user } = useAuth();
  const { selectedProjet } = useProjet();
  const searchParams = useSearchParams();
  const router = useRouter();
  const accesstoken = token || localStorage.getItem('accessToken');
  
  // États
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // États pour l'enregistrement vocal
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isMicRecording, setIsMicRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const micRecordingIntervalRef = useRef(null);
  
  // Refs
  const isLoadingMessagesRef = useRef(false);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  // Notre numéro WhatsApp
  const OUR_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_OUR_WHATSAPP_NUMBER;
  // Clé Pusher
  const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_WHATSAPP;
  
  // Update selected conversation's unread count immediately when selected
useEffect(() => {
  if (selectedConversation && selectedConversation.unread_count > 0) {
    // Mark as read immediately
    markMessagesAsRead(selectedConversation.phone_number);
    
    // Update local state immediately for UI
    setConversations(prev => prev.map(conv =>
      conv.phone_number === selectedConversation.phone_number
        ? { ...conv, unread_count: 0 }
        : conv
    ));
    
    setSelectedConversation(prev => 
      prev ? { ...prev, unread_count: 0 } : prev
    );
  }
}, [selectedConversation?.phone_number]); // Only run when conversation changes
  // Détecter l'écran mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fermer l'emoji picker en cliquant dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);
  
  // Lire les paramètres URL
  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    const projetIdParam = searchParams.get('projet_id');
    
    if (phoneParam && projetIdParam && selectedProjet?.id?.toString() === projetIdParam) {
      selectConversation({ phone_number: phoneParam });
      router.replace('/whatsapp-messenger', { shallow: true });
    }
  }, [searchParams, selectedProjet]);
  
  // Fonction pour mettre à jour les messages localement après le marquage comme lu
  const updateMessagesAsRead = useCallback((phoneNumber) => {
    if (selectedConversation?.phone_number !== phoneNumber) return;
    
    setMessages(prev => prev.map(msg => {
      if (msg.from_number !== OUR_WHATSAPP_NUMBER && msg.status !== 'read') {
        return { ...msg, status: 'read', read_at: new Date().toISOString() };
      }
      return msg;
    }));
  }, [selectedConversation, OUR_WHATSAPP_NUMBER]);
  
  // Initialiser Pusher
  const initPusher = useCallback(() => {
    if (!selectedProjet?.id) return;
    
    Pusher.logToConsole = true;
    
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: "eu",
      encrypted: true,
    });
    
    pusherRef.current = pusher;
    
    const channel = pusher.subscribe(`whatsapp-project.${selectedProjet.id}`);
    channelRef.current = channel;
    
    channel.bind('new-whatsapp-message', async (data) => {
      console.log("📨 Nouveau message reçu:", data);
      
      if (data.message?.from_number !== OUR_WHATSAPP_NUMBER && selectedConversation?.phone_number === data.phone_number) {
        console.log("🔄 Rechargement forcé de la conversation...");
        const freshMessages = await fetchMessages(data.phone_number);
        setMessages(freshMessages);
        scrollToBottom();
        markMessagesAsRead(data.phone_number);
      } else if (data.message?.status === 'read') {
        setMessages(prev => prev.map(msg => {
          if (msg.id === data.message.id) {
            return { ...msg, status: 'read', read_at: data.message.read_at };
          }
          return msg;
        }));
      } else {
        fetchConversationsSilently();
        if (selectedConversation?.phone_number !== data.phone_number) {
          updateUnreadCount();
          toast.success(`📱 Nouveau message de ${data.message?.profile_name || data.phone_number}`);
        }
      }
    });
    
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind('new-whatsapp-message');
        pusherRef.current?.unsubscribe(`whatsapp-project.${selectedProjet.id}`);
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [selectedProjet?.id, selectedConversation?.phone_number]);

  useEffect(() => {
    const cleanup = initPusher();
    return () => cleanup && cleanup();
  }, [initPusher]);
  
  // Calculer le nombre total de messages non lus
  const updateUnreadCount = useCallback(() => {
    const total = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
    setTotalUnreadCount(total);
    
    if (total > 0) {
      document.title = `(${total}) Messagerie`;
    } else {
      document.title = 'Messagerie';
    }
  }, [conversations]);
  
  useEffect(() => {
    updateUnreadCount();
  }, [conversations, updateUnreadCount]);
  
  // Récupérer les conversations
  const fetchConversations = useCallback(async (showLoader = true) => {
    if (!selectedProjet?.id) return;
    if (showLoader) setLoading(true);
    
    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/whatsapp/conversations/${selectedProjet.id}`,
        { headers: { Authorization: `Bearer ${accesstoken}` } }
      );
      
      if (response.data?.conversations) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [selectedProjet?.id, accesstoken]);
  
  const fetchConversationsSilently = useCallback(() => {
    fetchConversations(false);
  }, [fetchConversations]);
  
  // Récupérer les messages
  const fetchMessages = useCallback(async (phoneNumber) => {
    if (!selectedProjet?.id || !phoneNumber) return [];
    if (isLoadingMessagesRef.current) return [];
    
    isLoadingMessagesRef.current = true;
    
    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/whatsapp/conversation/${selectedProjet.id}/${encodeURIComponent(phoneNumber)}`,
        { headers: { Authorization: `Bearer ${accesstoken}` } }
      );
      
      if (response.data?.conversation?.messages) {
        return response.data.conversation.messages;
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    } finally {
      isLoadingMessagesRef.current = false;
    }
  }, [selectedProjet?.id, accesstoken]);
  
  // Upload et envoi de fichier audio
  const uploadAndSendFile = useCallback(async (file, type) => {
    if (!file || !selectedConversation) {
      console.log("❌ Pas de fichier ou de conversation sélectionnée");
      return;
    }
    
    console.log("📤 Début upload fichier:", file.name, file.size, "bytes");
    
    let tempMessageId = `temp_audio_${Date.now()}`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    try {
      console.log("📡 Envoi de la requête d'upload...");
      const uploadResponse = await axios.post(`${APIURL.ROOTV1}/upload/whatsapp-media`, formData, {
        headers: { 
          Authorization: `Bearer ${accesstoken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("✅ Upload réussi:", uploadResponse.data);
      const mediaUrl = uploadResponse.data.url;
      
      const tempMessage = {
        id: tempMessageId,
        from_number: OUR_WHATSAPP_NUMBER,
        to_number: selectedConversation.phone_number,
        message: `🎤 Message vocal`,
        media_url: mediaUrl,
        media_type: 'audio',
        profile_name: user?.name || 'Commercial',
        status: 'sending',
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempMessage]);
      scrollToBottom();
      
      console.log("📡 Envoi du message vocal via Twilio...");
      await axios.post(
        `${APIURL.ROOTV1}/whatsapp/reply/${selectedProjet.id}/${encodeURIComponent(selectedConversation.phone_number)}`,
        { media_url: mediaUrl, media_type: 'audio' },
        { headers: { Authorization: `Bearer ${accesstoken}` } }
      );
      
      setMessages(prev => prev.map(msg =>
        msg.id === tempMessageId ? { ...msg, status: 'sent' } : msg
      ));
      
      toast.success("Message vocal envoyé");
      
    } catch (error) {
      console.error('❌ Error sending audio:', error);
      console.error('❌ Détails:', error.response?.data);
      toast.error("Erreur lors de l'envoi du message vocal: " + (error.response?.data?.error || error.message));
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
    }
  }, [selectedConversation, accesstoken, selectedProjet, user]);
  
  // Démarrer l'enregistrement via microphone
  const startMicRecording = useCallback(async () => {
    try {
      console.log("🎤 Démarrage de l'enregistrement...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          console.log("📦 Chunk reçu:", e.data.size);
        }
      };
      
      recorder.onstop = async () => {
        console.log("🛑 Enregistrement arrêté, chunks:", chunks.length);
        
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        console.log("📊 Taille du blob:", audioBlob.size, "bytes");
        
        const formData = new FormData();
        formData.append('file', audioBlob, `voice_note_${Date.now()}.webm`);
        formData.append('type', 'audio');
        
        try {
          const uploadResponse = await axios.post(`${APIURL.ROOTV1}/upload/whatsapp-media`, formData, {
            headers: { 
              Authorization: `Bearer ${accesstoken}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          
          console.log("✅ Upload réussi:", uploadResponse.data);
          const mediaUrl = uploadResponse.data.url;
          
          await axios.post(
            `${APIURL.ROOTV1}/whatsapp/reply/${selectedProjet.id}/${encodeURIComponent(selectedConversation.phone_number)}`,
            { media_url: mediaUrl, media_type: 'audio' },
            { headers: { Authorization: `Bearer ${accesstoken}` } }
          );
          
          toast.success("Message vocal envoyé");
          
        } catch (error) {
          console.error('❌ Error:', error);
          toast.error("Erreur lors de l'envoi");
        } finally {
        }
        
        stream.getTracks().forEach(track => track.stop());
        setAudioChunks([]);
      };
      
      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsMicRecording(true);
      
      let seconds = 0;
      if (micRecordingIntervalRef.current) {
        clearInterval(micRecordingIntervalRef.current);
      }
      micRecordingIntervalRef.current = setInterval(() => {
        seconds++;
        setRecordingDuration(seconds);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Impossible d'accéder au microphone. Vérifiez les permissions.");
    }
  }, [accesstoken, selectedProjet, selectedConversation]);
  
  // Arrêter l'enregistrement et envoyer
  const stopMicRecording = useCallback(() => {
    console.log("🛑 Arrêt de l'enregistrement demandé");
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsMicRecording(false);
      if (micRecordingIntervalRef.current) {
        clearInterval(micRecordingIntervalRef.current);
        micRecordingIntervalRef.current = null;
      }
    }
  }, [mediaRecorder]);
  
  // Annuler l'enregistrement
  const cancelMicRecording = useCallback(() => {
    console.log("❌ Annulation de l'enregistrement");
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.onstop = () => {};
      mediaRecorder.stop();
      setIsMicRecording(false);
      if (micRecordingIntervalRef.current) {
        clearInterval(micRecordingIntervalRef.current);
        micRecordingIntervalRef.current = null;
      }
      setRecordingDuration(0);
      toast.info("Enregistrement annulé");
    }
  }, [mediaRecorder]);
  
  // Nettoyage
  useEffect(() => {
    return () => {
      if (micRecordingIntervalRef.current) {
        clearInterval(micRecordingIntervalRef.current);
      }
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);
  
  // Sélectionner une conversation
  const selectConversation = useCallback(async (conversation) => {
    if (selectedConversation?.phone_number === conversation.phone_number) return;
    
    console.log('📱 Chargement de la conversation:', conversation.phone_number);
    
    setSelectedConversation(conversation);
    setMessages([]);
    setReplyTo(null);
    setIsSelectionMode(false);
    setSelectedMessages([]);
    setLoadingMessages(true);
    
    const loadedMessages = await fetchMessages(conversation.phone_number);
    setMessages(loadedMessages);
    setLoadingMessages(false);
    
    scrollToBottom();
    await markMessagesAsRead(conversation.phone_number);
  }, [selectedConversation, fetchMessages]);
  
  // Marquer comme lu
const markMessagesAsRead = useCallback(async (phoneNumber) => {
  try {
    const response = await axios.post(
      `${APIURL.ROOTV1}/whatsapp/mark-read/${selectedProjet.id}/${encodeURIComponent(phoneNumber)}`,
      {},
      { headers: { Authorization: `Bearer ${accesstoken}` } }
    );
    
    if (response.data?.updated_count > 0) {
      // Update the conversations state
      setConversations(prev => prev.map(conv =>
        conv.phone_number === phoneNumber
          ? { ...conv, unread_count: 0 }
          : conv
      ));
      
      // Also update the selected conversation if it's the same
      setSelectedConversation(prev => 
        prev?.phone_number === phoneNumber 
          ? { ...prev, unread_count: 0 }
          : prev
      );
      
      // Update messages as read
      updateMessagesAsRead(phoneNumber);
      
      // Force re-render of the conversation list
      setConversations(prev => [...prev]);
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}, [selectedProjet?.id, accesstoken, updateMessagesAsRead]);
  // Envoyer un message
  const sendMessage = useCallback(async (replyToMsg = null) => {
    if (!newMessage.trim() || !selectedConversation || sending) return;
    
    setSending(true);
    const messageToSend = newMessage;
    setNewMessage('');
    setShowEmojiPicker(false);
    
    const tempMessage = {
      id: `temp_${Date.now()}`,
      from_number: OUR_WHATSAPP_NUMBER,
      to_number: selectedConversation.phone_number,
      message: messageToSend,
      profile_name: user?.name || 'Commercial',
      status: 'sending',
      created_at: new Date().toISOString(),
      reply_to: replyToMsg ? {
        id: replyToMsg.id,
        message: replyToMsg.message,
        profile_name: replyToMsg.profile_name
      } : null
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();
    
    try {
      const payload = { message: messageToSend };
      if (replyToMsg) {
        payload.reply_to_id = replyToMsg.id;
      }
      
      const response = await axios.post(
        `${APIURL.ROOTV1}/whatsapp/reply/${selectedProjet.id}/${encodeURIComponent(selectedConversation.phone_number)}`,
        payload,
        { headers: { Authorization: `Bearer ${accesstoken}` } }
      );
      
      if (response.data?.message_id) {
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? { ...msg, id: response.data.message_id, status: 'sent' } : msg
        ));
      } else {
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }
      
      setReplyTo(null);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Erreur lors de l'envoi du message");
      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
      ));
    } finally {
      setSending(false);
    }
  }, [newMessage, selectedConversation, sending, user, selectedProjet, accesstoken]);
  
  // Supprimer un message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      await axios.delete(
        `${APIURL.ROOTV1}/whatsapp/message/${selectedProjet.id}/${messageId}`,
        { headers: { Authorization: `Bearer ${accesstoken}` } }
      );
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message supprimé');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erreur lors de la suppression');
    }
  }, [selectedProjet?.id, accesstoken]);
  
  // Copier un message
  const copyMessage = useCallback((message) => {
    navigator.clipboard.writeText(message);
    toast.success('Message copié dans le presse-papier');
  }, []);
  
  // Toggle sélection de message
  const toggleMessageSelection = useCallback((messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  }, []);
  
  // Supprimer plusieurs messages
  const deleteSelectedMessages = useCallback(async () => {
    try {
      await axios.post(
        `${APIURL.ROOTV1}/whatsapp/delete-messages/${selectedProjet.id}`,
        { message_ids: selectedMessages },
        { headers: { Authorization: `Bearer ${accesstoken}` } }
      );
      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.id)));
      setSelectedMessages([]);
      setIsSelectionMode(false);
      toast.success(`${selectedMessages.length} message(s) supprimé(s)`);
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast.error('Erreur lors de la suppression');
    }
  }, [selectedMessages, selectedProjet?.id, accesstoken]);
  
  // Format time
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Scroll
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  }, []);
  
  // Chargement initial
  useEffect(() => {
    fetchConversations(true);
  }, [fetchConversations]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Rafraîchir
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations(false);
    if (selectedConversation) {
      const freshMessages = await fetchMessages(selectedConversation.phone_number);
      setMessages(freshMessages);
    }
    setRefreshing(false);
    toast.success('Conversations actualisées');
  }, [fetchConversations, fetchMessages, selectedConversation]);
  
  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return d.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };
  
  // Icône de statut
  const MessageStatusIcon = ({ status, isFromUs }) => {
    if (!isFromUs) return null;
    
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400 animate-spin" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <X className="h-3 w-3 text-red-500" />;
      default:
        return null;
      }
  };
  
  // Menu des messages
  const MessageMenu = ({ message, onClose }) => {
    const menuRef = useRef(null);
    
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          onClose();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);
    
    return (
      <div ref={menuRef} className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-50 py-1 min-w-[150px]">
        <button
          onClick={() => { copyMessage(message.message); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        >
          <Copy className="h-4 w-4" /> Copier
        </button>
        <button
          onClick={() => { setReplyTo(message); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        >
          <Reply className="h-4 w-4" /> Répondre
        </button>
      </div>
    );
  };
  
 /* const filteredConversations = conversations.filter(conv =>
    conv.phone_number?.includes(searchTerm) ||
    conv.prospect_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.profile_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );*/
  const filteredConversations = conversations.filter(conv => {
  // Exclure la conversation de notre propre numéro WhatsApp
  if (conv.phone_number === OUR_WHATSAPP_NUMBER) {
    return false;
  }
  
  // Exclure également par le nom "AGENT" (fallback)
  if (conv.profile_name === 'AGENT' || conv.prospect_nom === 'AGENT') {
    return false;
  }
  
  // Appliquer le filtre de recherche
  if (!searchTerm.trim()) {
    return true;
  }
  
  return conv.phone_number?.includes(searchTerm) ||
    conv.prospect_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.profile_name?.toLowerCase().includes(searchTerm.toLowerCase());
});
  
  
  // Emojis simples
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
  
  if (loading) {
    return <LoadingSpin />;
  }
  
  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-100 rounded-lg overflow-hidden shadow-lg">
      {/* Sidebar - Conversations */}
      <div className={`
        ${isMobile ? (selectedConversation ? 'hidden' : 'w-full') : 'w-96'} 
        bg-white border-r flex flex-col
      `}>
        <div className="p-4 border-b bg-green-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Messagerie</h2>
              {totalUnreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {totalUnreadCount}
                </span>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-green-700 rounded-full transition"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <MessageCircle className="h-12 w-12 mb-2" />
              <p>Aucune conversation</p>
              <p className="text-sm">En attente de messages entrants</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.phone_number}
                onClick={() => selectConversation(conv)}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b transition ${
                  selectedConversation?.phone_number === conv.phone_number
                    ? 'bg-green-50 border-l-4 border-l-green-500'
                    : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    {conv.profile_name ? (
                      <span className="font-bold text-green-600 text-lg">
                        {conv.profile_name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {conv.prospect_nom || conv.profile_name || conv.phone_number}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatDate(conv.last_message_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {conv.last_message_from_me && (
                      <CheckCheck className="h-3 w-3 text-gray-400" />
                    )}
                    <p className="text-sm text-gray-500 truncate flex-1">
                      {conv.last_message || 'Aucun message'}
                    </p>
                  </div>
                </div>
                
                {conv.unread_count > 0 && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Zone de conversation */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white">
            <div className="flex items-center gap-3">
              {isMobile && (
                <button onClick={() => setSelectedConversation(null)} className="p-2 hover:bg-green-700 rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="font-bold text-white">
                    {(selectedConversation.prospect_nom || selectedConversation.profile_name || selectedConversation.phone_number).charAt(0).toUpperCase()}
                  </span>
                </div>
                {selectedConversation.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-green-600"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {selectedConversation.prospect_nom || selectedConversation.profile_name || selectedConversation.phone_number}
                </h3>
                <p className="text-xs text-green-200">
                  {isTyping ? 'En train d\'écrire...' : selectedConversation.online ? ' ' : ' '}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSelectionMode && selectedMessages.length > 0 && (
                <button
                  onClick={deleteSelectedMessages}
                  className="p-2 hover:bg-green-700 rounded-full"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <a
                href={`https://wa.me/${selectedConversation.phone_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-green-700 rounded-full"
              >
                <Phone className="h-5 w-5" />
              </a>
              <button className="p-2 hover:bg-green-700 rounded-full">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Zone de réponse (reply-to) */}
          {replyTo && (
            <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500">Réponse à :</p>
                <p className="text-sm text-gray-700 truncate">{replyTo.message}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-gray-200 rounded">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader className="h-10 w-10 animate-spin text-green-500 mb-4" />
                <p className="text-gray-500">Chargement des messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="h-16 w-16 mb-4" />
                <p>Aucun message avec ce contact</p>
                <p className="text-sm">Envoyez un message pour commencer</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isFromUs = msg.from_number === OUR_WHATSAPP_NUMBER;
                const showDate = idx === 0 || 
                  new Date(msg.created_at).toDateString() !== new Date(messages[idx - 1]?.created_at).toDateString();
                
                return (
                  <div key={msg.id || idx}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          {new Date(msg.created_at).toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long' 
                          })}
                        </span>
                      </div>
                    )}
                    
                    {/* Message avec reply-to */}
                    {msg.reply_to && (
                      <div className={`ml-8 mb-1 text-xs text-gray-400 ${isFromUs ? 'text-right' : 'text-left'}`}>
                        <div className="inline-block bg-gray-100 px-2 py-1 rounded">
                          ⤷ Réponse à : {msg.reply_to.message.substring(0, 50)}...
                        </div>
                      </div>
                    )}
                    
                    <div 
                      className={`flex ${isFromUs ? 'justify-end' : 'justify-start'} group relative`}
                      onDoubleClick={() => toggleMessageSelection(msg.id)}
                    >
                      {isSelectionMode && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2">
                          <input
                            type="checkbox"
                            checked={selectedMessages.includes(msg.id)}
                            onChange={() => toggleMessageSelection(msg.id)}
                            className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg relative ${
                          isFromUs 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white text-gray-800 border shadow-sm'
                        } ${selectedMessages.includes(msg.id) ? 'ring-2 ring-green-500' : ''}`}
                      >
                        {/* Affichage du message vocal */}
                        {msg.media_url && msg.media_type === 'audio' && (
                          <div className="mb-2">
                            <audio controls className="w-full max-w-[250px] h-10">
                              <source src={msg.media_url} />
                              Votre navigateur ne supporte pas l{"'"}audio.
                            </audio>
                          </div>
                        )}
                        
                        <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                        <div className={`flex items-center gap-1 mt-1 text-xs ${isFromUs ? 'text-green-100' : 'text-gray-400'}`}>
                          <span>{formatDate(msg.created_at)}</span>
                          {isFromUs && <MessageStatusIcon status={msg.status} isFromUs={isFromUs} />}
                        </div>
                        
                        {/* Menu contextuel (hover) */}
                        {!isSelectionMode && (
                          <div className={`absolute top-0 ${isFromUs ? '-left-8' : '-right-8'} hidden group-hover:flex gap-1 bg-white rounded-lg shadow-lg p-1`}>
                            <button
                              onClick={() => copyMessage(msg.message)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Copier"
                            >
                              <Copy className="h-3 w-3 text-gray-500" />
                            </button>
                            <button
                              onClick={() => setReplyTo(msg)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Répondre"
                            >
                              <Reply className="h-3 w-3 text-gray-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 px-4 py-2 rounded-lg border shadow-sm">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-100">●</span>
                    <span className="animate-bounce delay-200">●</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input message */}
          <div className="p-4 bg-white border-t relative">
            {isRecording ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 flex items-center gap-2 bg-red-50 rounded-full px-4 py-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-500 font-medium">Enregistrement...</span>
                  <span className="text-gray-500">{formatTime(recordingTime)}</span>
                </div>
                <button
                  onClick={stopRecording}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  title="Emojis"
                >
                  <Smile className="h-5 w-5" />
                </button>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(replyTo)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={sending}
                />
                
                <button
                  onClick={() => sendMessage(replyTo)}
                  disabled={!newMessage.trim() || sending}
                  className={`p-2 rounded-full transition ${
                    newMessage.trim() && !sending
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {sending ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            )}
            
            {/* Emoji picker */}
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg border p-2 z-50 max-w-[300px]"
              >
                <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setShowEmojiPicker(false);
                        inputRef.current?.focus();
                      }}
                      className="text-2xl hover:bg-gray-100 p-1 rounded transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-400 text-center mt-2">
              Les messages sont envoyés via Messagerie
            </p>
          </div>
        </div>
      ) : (
        !isMobile && (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <MessageCircle className="h-24 w-24 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Messagerie</h3>
            <p className="text-gray-400">Sélectionnez une conversation pour commencer</p>
          </div>
        )
      )}
    </div>
  );
};

export default WhatsAppMessenger;
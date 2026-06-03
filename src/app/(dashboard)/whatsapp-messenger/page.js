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
  Download,  // ← Add this
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
  FileText,  // Add this
  File    ,   // Add this
  Share2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  PlusCircle,
  
} from 'lucide-react';
import LoadingSpin from '@/components/LoadingSpin';

const WhatsAppMessenger = () => {

  // Add dropdown menu state
const [showHeaderMenu, setShowHeaderMenu] = useState(false);
const headerMenuRef = useRef(null);
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
  
  // États pour nouvelle conversation
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationPhone, setNewConversationPhone] = useState('');
  const [newConversationMessage, setNewConversationMessage] = useState('');
  const [sendingNewConversation, setSendingNewConversation] = useState(false);
  
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
  const phoneInputRef = useRef(null);
  
  // Notre numéro WhatsApp
  const OUR_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_OUR_WHATSAPP_NUMBER|| '';
  // Clé Pusher
  const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_WHATSAPP|| '';

    
    // Add these with your other state variables
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchInConversation, setSearchInConversation] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [showSearchBar, setShowSearchBar] = useState(false);

  
  
    // Add these with your other state variables
const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
const [uploadingFile, setUploadingFile] = useState(false);
const fileInputRef = useRef(null);
const attachmentMenuRef = useRef(null);

  // Upload and send file (image, PDF, document)
const uploadAndSendMediaFile = useCallback(async (file) => {
  if (!file || !selectedConversation) {
    toast.error('Aucun fichier sélectionné');
    return;
  }

  // Validate file size (max 20MB)
  if (file.size > 20 * 1024 * 1024) {
    toast.error('Le fichier est trop volumineux (max 20MB)');
    return;
  }

  // Determine file type
  let fileType = 'document';
  if (file.type.startsWith('image/')) {
    fileType = 'image';
  } else if (file.type.startsWith('audio/')) {
    fileType = 'audio';
  } else if (file.type === 'application/pdf') {
    fileType = 'pdf';
  }

  setUploadingFile(true);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', fileType);

  try {
    // Upload file
    const uploadResponse = await axios.post(`${APIURL.ROOTV1}/upload/whatsapp-media`, formData, {
      headers: { 
        Authorization: `Bearer ${accesstoken}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (uploadResponse.data?.success) {
      const mediaUrl = uploadResponse.data.url;
      const mediaType = uploadResponse.data.type;

      // Create temp message
      const tempMessage = {
        id: `temp_${Date.now()}`,
        from_number: OUR_WHATSAPP_NUMBER,
        to_number: selectedConversation.phone_number,
        message: `📎 ${file.name}`,
        media_url: mediaUrl,
        media_type: mediaType,
        profile_name: user?.name || 'Commercial',
        status: 'sending',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);
      scrollToBottom();

      // Send message with media
      await axios.post(
        `${APIURL.ROOTV1}/whatsapp/reply/${selectedProjet.id}/${encodeURIComponent(selectedConversation.phone_number)}`,
        { 
          media_url: mediaUrl, 
          media_type: mediaType,
          message: file.name
        },
        { headers: { Authorization: `Bearer ${accesstoken}` } }
      );

      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id ? { ...msg, status: 'sent' } : msg
      ));

      toast.success('Fichier envoyé avec succès');
    }

  } catch (error) {
    console.error('Error sending file:', error);
    toast.error("Erreur lors de l'envoi du fichier");
  } finally {
    setUploadingFile(false);
    setShowAttachmentMenu(false);
  }
}, [selectedConversation, accesstoken, selectedProjet, user]);

// Handle file selection
// In your WhatsAppMessenger component, update the handleFileSelect function:
const handleFileSelect = useCallback(async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file size (max 20MB)
  if (file.size > 20 * 1024 * 1024) {
    toast.error('Le fichier est trop volumineux (max 20MB)');
    return;
  }

  // Determine file type
  let fileType = 'document';
  if (file.type.startsWith('image/')) {
    fileType = 'image';
  } else if (file.type.startsWith('audio/')) {
    fileType = 'audio';
  } else if (file.type === 'application/pdf') {
    fileType = 'pdf';
  }

  setUploadingFile(true);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', fileType);

  try {
    // Upload file first
    const uploadResponse = await axios.post(`${APIURL.ROOTV1}/upload/whatsapp-media`, formData, {
      headers: { 
        Authorization: `Bearer ${accesstoken}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (uploadResponse.data?.success) {
      const mediaUrl = uploadResponse.data.url;
      const mediaType = uploadResponse.data.type;

      // Create temp message
      const tempMessage = {
        id: `temp_${Date.now()}`,
        from_number: OUR_WHATSAPP_NUMBER,
        to_number: selectedConversation.phone_number,
        message: file.name,
        media_url: mediaUrl,
        media_type: mediaType,
        profile_name: user?.name || 'Commercial',
        status: 'sending',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);
      scrollToBottom();

      // Send message with media
      const payload = {
        message: file.name,
        media_url: mediaUrl,
        media_type: mediaType
      };
      
      console.log('Sending payload:', payload);

      const sendResponse = await axios.post(
        `${APIURL.ROOTV1}/whatsapp/reply/${selectedProjet.id}/${encodeURIComponent(selectedConversation.phone_number)}`,
        payload,
        { headers: { Authorization: `Bearer ${accesstoken}` } }
      );

      console.log('Send response:', sendResponse.data);

      if (sendResponse.data?.success) {
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? { 
            ...msg, 
            status: 'sent',
            id: sendResponse.data.message_id 
          } : msg
        ));
        toast.success('Fichier envoyé avec succès');
      }
    }

  } catch (error) {
    console.error('Error sending file:', error);
    toast.error("Erreur lors de l'envoi du fichier: " + (error.response?.data?.error || error.message));
  } finally {
    setUploadingFile(false);
    setShowAttachmentMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
}, [selectedConversation, accesstoken, selectedProjet, user]);
// Close attachment menu when clicking outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
      setShowAttachmentMenu(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

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

// Close header menu when clicking outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
      setShowHeaderMenu(false);
    }
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
// Export conversation as text file
const exportConversation = useCallback(async () => {
  if (!selectedConversation || messages.length === 0) {
    toast.error('Aucun message à exporter');
    return;
  }
  
  setExporting(true);
  
  try {
    // Format the conversation for export
    let exportText = `Conversation WhatsApp\n`;
    exportText += `===================\n`;
    exportText += `Contact: ${selectedConversation.prospect_nom || selectedConversation.profile_name || selectedConversation.phone_number}\n`;
    exportText += `Téléphone: ${selectedConversation.phone_number}\n`;
    exportText += `Date d'export: ${new Date().toLocaleString('fr-FR')}\n`;
    exportText += `===================\n\n`;
    
    // Group messages by date
    let currentDate = '';
    messages.forEach(msg => {
      const msgDate = new Date(msg.created_at).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      if (currentDate !== msgDate) {
        currentDate = msgDate;
        exportText += `\n📅 ${msgDate}\n`;
        exportText += `${'─'.repeat(50)}\n`;
      }
      
      const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const isFromUs = msg.from_number === OUR_WHATSAPP_NUMBER;
      const sender = isFromUs ? `👤 ${user?.name || 'Moi'}` : `👤 ${msg.profile_name || selectedConversation.prospect_nom || 'Client'}`;
      const status = isFromUs ? `✓✓` : '';
      
      exportText += `\n[${time}] ${sender}\n`;
      if (msg.message) {
        exportText += `${msg.message}\n`;
      }
      if (msg.media_url && msg.media_type === 'audio') {
        exportText += `[🎤 Message vocal] ${msg.media_url}\n`;
      }
      exportText += `${'─'.repeat(30)}\n`;
    });
    
    // Create and download file
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp_conversation_${selectedConversation.phone_number}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Conversation exportée avec succès');
    
  } catch (error) {
    console.error('Error exporting conversation:', error);
    toast.error('Erreur lors de l\'exportation');
  } finally {
    setExporting(false);
    setShowExportModal(false);
  }
}, [selectedConversation, messages, user]);

// Search in conversation
const searchInMessages = useCallback((searchTerm) => {
  if (!searchTerm.trim()) {
    setSearchResults([]);
    setCurrentSearchIndex(-1);
    return;
  }
  
  const results = [];
  messages.forEach((msg, index) => {
    if (msg.message && msg.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      results.push({
        index,
        messageId: msg.id,
        message: msg.message,
        from_number: msg.from_number,
        created_at: msg.created_at
      });
    }
  });
  
  setSearchResults(results);
  setCurrentSearchIndex(results.length > 0 ? 0 : -1);
  
  if (results.length > 0) {
    // Scroll to first result
    scrollToMessage(results[0].index);
   // toast.success(`${results.length} résultat(s) trouvé(s)`);
  } else {
   // toast.info('Aucun résultat trouvé');
  }
}, [messages]);

// Navigate to next/previous search result
const navigateSearchResult = useCallback((direction) => {
  if (searchResults.length === 0) return;
  
  let newIndex;
  if (direction === 'next') {
    newIndex = currentSearchIndex + 1 >= searchResults.length ? 0 : currentSearchIndex + 1;
  } else {
    newIndex = currentSearchIndex - 1 < 0 ? searchResults.length - 1 : currentSearchIndex - 1;
  }
  
  setCurrentSearchIndex(newIndex);
  scrollToMessage(searchResults[newIndex].index);
}, [searchResults, currentSearchIndex]);

// Scroll to a specific message by index
const scrollToMessage = useCallback((messageIndex) => {
  const messageElements = document.querySelectorAll('.message-item');
  if (messageElements[messageIndex]) {
    messageElements[messageIndex].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
    // Add highlight effect
    messageElements[messageIndex].classList.add('bg-yellow-100', 'transition-colors', 'duration-1000');
    setTimeout(() => {
      messageElements[messageIndex].classList.remove('bg-yellow-100');
    }, 2000);
  }
}, []);
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
    if (!PUSHER_KEY) {
      console.warn('Pusher key is missing. Real-time updates disabled.');
      return;
    }
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
        // Always refresh conversations list to show new conversations
       fetchConversationsSilently();
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
  }, [selectedProjet?.id, selectedConversation?.phone_number, PUSHER_KEY]);

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
      // Sort conversations by last_message_date (newest first)
      const sortedConversations = [...response.data.conversations].sort((a, b) => {
        if (!a.last_message_date) return 1;
        if (!b.last_message_date) return -1;
        return new Date(b.last_message_date) - new Date(a.last_message_date);
      });
      setConversations(sortedConversations);
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
  
  // Marquer comme lu
  const markMessagesAsRead = useCallback(async (phoneNumber) => {
    try {
      const response = await axios.post(
        `${APIURL.ROOTV1}/whatsapp/mark-read/${selectedProjet.id}/${encodeURIComponent(phoneNumber)}`,
        {},
        { headers: { Authorization: `Bearer ${accesstoken}` } }
      );
      
      if (response.data?.updated_count > 0) {
        updateMessagesAsRead(phoneNumber);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [selectedProjet?.id, accesstoken, updateMessagesAsRead]);
  
     // Sélectionner une conversation
// Sélectionner une conversation
const selectConversation = useCallback(async (conversation) => {
  // Normalize phone number for comparison
  const normalizePhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/^\+/, ''); // Remove + for comparison
  };
  
  const currentPhoneNormalized = normalizePhone(selectedConversation?.phone_number);
  const newPhoneNormalized = normalizePhone(conversation.phone_number);
  
  if (currentPhoneNormalized === newPhoneNormalized) return;
  
  console.log('📱 Chargement de la conversation:', conversation.phone_number);
  
  if (conversation.unread_count > 0) {
    setConversations(prev => prev.map(conv =>
      normalizePhone(conv.phone_number) === newPhoneNormalized
        ? { ...conv, unread_count: 0 }
        : conv
    ));
    conversation = { ...conversation, unread_count: 0 };
  }
  
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
}, [selectedConversation, fetchMessages, markMessagesAsRead]); 
   // Démarrer une nouvelle conversation

// Démarrer une nouvelle conversation
const startNewConversation = useCallback(async () => {
  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (!newConversationPhone.trim()) {
    toast.error('Veuillez entrer un numéro de téléphone');
    return;
  }
  
  if (!phoneRegex.test(newConversationPhone)) {
    toast.error('Numéro de téléphone invalide');
    return;
  }
  
  if (!newConversationMessage.trim()) {
    toast.error('Veuillez entrer un message');
    return;
  }
  
  setSendingNewConversation(true);
  
  try {
    // Format phone number
    let formattedPhone = newConversationPhone.replace(/\s/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('00')) {
        formattedPhone = formattedPhone.substring(2);
      } else {
        formattedPhone = formattedPhone;
      }
    }
    
    console.log('📱 Envoi vers:', formattedPhone);
    
    // Send the message
    await axios.post(
      `${APIURL.ROOTV1}/whatsapp/reply/${selectedProjet.id}/${encodeURIComponent(formattedPhone)}`,
      { message: newConversationMessage },
      { headers: { Authorization: `Bearer ${accesstoken}` } }
    );
    
    toast.success('Message envoyé avec succès');
    
    // Wait for backend to save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Refresh conversations list
    await fetchConversations(false);
    
    // Fetch messages for this specific phone number
    const messagesResponse = await axios.get(
      `${APIURL.ROOTV1}/whatsapp/conversation/${selectedProjet.id}/${encodeURIComponent(formattedPhone)}`,
      { headers: { Authorization: `Bearer ${accesstoken}` } }
    );
    
    // Create conversation object with the message
    const newConversationObj = {
      phone_number: formattedPhone,
      profile_name: formattedPhone,
      prospect_nom: formattedPhone,
      last_message: newConversationMessage,
      last_message_date: new Date().toISOString(),
      last_message_from_me: true,
      unread_count: 0
    };
    
    // Set messages
    if (messagesResponse.data?.conversation?.messages) {
      setMessages(messagesResponse.data.conversation.messages);
    } else {
      // Create temporary message if no messages returned
      const tempMessage = {
        id: `temp_${Date.now()}`,
        from_number: OUR_WHATSAPP_NUMBER,
        to_number: formattedPhone,
        message: newConversationMessage,
        profile_name: user?.name || 'Commercial',
        status: 'sent',
        created_at: new Date().toISOString()
      };
      setMessages([tempMessage]);
    }
    
    // Select the conversation
    setSelectedConversation(newConversationObj);
    setLoadingMessages(false);
    scrollToBottom();
    
    // Close modal and reset form
    setShowNewConversation(false);
    setNewConversationPhone('');
    setNewConversationMessage('');
    
  } catch (error) {
    console.error('Error starting new conversation:', error);
    toast.error("Erreur lors de l'envoi du message");
  } finally {
    setSendingNewConversation(false);
  }
}, [newConversationPhone, newConversationMessage, selectedProjet, accesstoken, fetchConversations, OUR_WHATSAPP_NUMBER, user]);





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
    
    // Update the conversation list to show this conversation at the top
    setConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.phone_number === selectedConversation.phone_number);
      const updatedConv = {
        ...selectedConversation,
        last_message: messageToSend,
        last_message_date: new Date().toISOString(),
        last_message_from_me: true,
        unread_count: 0
      };
      
      if (existingIndex !== -1) {
        // Remove existing and add at top
        const newConversations = [...prev];
        newConversations.splice(existingIndex, 1);
        return [updatedConv, ...newConversations];
      } else {
        // Add new conversation at top
        return [updatedConv, ...prev];
      }
    });
    
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

// Auto-refresh conversations when a message is sent successfully
useEffect(() => {
  if (!sending && selectedConversation) {
    // Refresh conversations list to update last message
    const refreshConversations = async () => {
      await fetchConversationsSilently();
    };
    refreshConversations();
  }
}, [sending, selectedConversation, fetchConversationsSilently]);

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
  
  const filteredConversations = conversations.filter(conv => {
    if (OUR_WHATSAPP_NUMBER && conv.phone_number === OUR_WHATSAPP_NUMBER) {
      return false;
    }
    
   
    
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewConversation(true)}
                className="p-2 hover:bg-green-700 rounded-full transition"
                title="Nouvelle conversation"
              >
                <PlusCircle className="h-5 w-5" />
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-green-700 rounded-full transition"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
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
              <p className="text-sm">Cliquez sur + pour démarrer une nouvelle conversation</p>
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
        {isTyping ? 'En train d\'écrire...' : selectedConversation.online ? 'En ligne' : ''}
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
    
    {/* Dropdown Menu Button */}
    <div className="relative" ref={headerMenuRef}>
      <button
        onClick={() => setShowHeaderMenu(!showHeaderMenu)}
        className="p-2 hover:bg-green-700 rounded-full transition"
        title="Menu"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      
      {/* Dropdown Menu */}
      {showHeaderMenu && (
        <div className="absolute right-0 top-full mt-2 text-gray-500 bg-white rounded-lg shadow-lg border z-50 min-w-[200px] overflow-hidden">
          {/* Search Option */}
          <button
            onClick={() => {
              setShowHeaderMenu(false);
              setShowSearchBar(true);
            }}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3 transition"
          >
            <Search className="h-4 w-4 text-gray-500" />
            <span>Rechercher dans la conversation</span>
          </button>
          
          {/* Export Option */}
          <button
            onClick={() => {
              setShowHeaderMenu(false);
              setShowExportModal(true);
            }}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3 transition border-t"
          >
            <Download className="h-4 w-4 text-gray-500" />
            <span>Exporter la conversation</span>
          </button>
        </div>
      )}
    </div>
  </div>
</div>

{/* Search bar in conversation */}
{/* Search bar in conversation - Enhanced */}
{showSearchBar && (
  <div className="bg-gray-50 border-b p-3 shadow-sm">
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchInConversation}
          onChange={(e) => {
            setSearchInConversation(e.target.value);
            searchInMessages(e.target.value);
          }}
          placeholder="Rechercher dans la conversation..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          autoFocus
        />
      </div>
      
      {/* Navigation Buttons */}
      {searchResults.length > 0 && (
        <div className="flex items-center gap-1 bg-white rounded-lg border px-2 py-1">
          <span className="text-xs text-gray-600 px-2">
            {currentSearchIndex + 1}/{searchResults.length}
          </span>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button
            onClick={() => navigateSearchResult('prev')}
            className="p-1 hover:bg-gray-100 rounded transition disabled:opacity-50"
            title="Précédent"
          >
            ↑
          </button>
          <button
            onClick={() => navigateSearchResult('next')}
            className="p-1 hover:bg-gray-100 rounded transition disabled:opacity-50"
            title="Suivant"
          >
            ↓
          </button>
        </div>
      )}
      
      <button
        onClick={() => {
          setShowSearchBar(false);
          setSearchInConversation('');
          setSearchResults([]);
          setCurrentSearchIndex(-1);
          // Remove all highlights
          document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight', 'bg-yellow-200');
          });
        }}
        className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
        title="Fermer"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
    
    {/* Search info */}
    {searchInConversation && searchResults.length === 0 && (
      <p className="text-xs text-gray-500 mt-2 text-center">
        Aucun message contenant "{searchInConversation}"
      </p>
    )}
    {searchResults.length > 0 && (
      <p className="text-xs text-gray-500 mt-2 text-center">
        {searchResults.length} résultat(s) trouvé(s)
      </p>
    )}
  </div>
)}
          {/* Rest of the conversation area remains the same */}
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
  
  // Highlight search term in message
  // In your message display, replace the highlightText function with this:
const highlightText = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-300 text-black rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

// For the scroll margin, add this CSS class
// You can add this to your global CSS file or use inline style
  
  const isHighlighted = searchResults.some(r => r.index === idx);
  
  return (
    <div 
      key={msg.id || idx}
      className={`message-item flex ${isFromUs ? 'justify-end' : 'justify-start'} group relative transition-all duration-300 ${
        isHighlighted && currentSearchIndex === searchResults.findIndex(r => r.index === idx) 
          ? 'ring-2 ring-green-500 ring-offset-2 rounded-lg' 
          : ''
      }`}
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
        {/* Audio message */}
          {msg.media_url && msg.media_type === 'image' && (
            <div className="mb-2">
              <img 
                src={msg.media_url} 
                alt="Image" 
                className="max-w-full rounded-lg cursor-pointer max-h-64 object-cover"
                onClick={() => window.open(msg.media_url, '_blank')}
              />
            </div>
          )}

          {/* PDF document */}
          {msg.media_url && msg.media_type === 'application/pdf' && (
            <div className="mb-2">
              <a 
                href={msg.media_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:text-blue-700 bg-gray-100 p-2 rounded-lg"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">Ouvrir le document PDF</span>
              </a>
            </div>
          )}

          {/* Audio message */}
          {msg.media_url && msg.media_type === 'audio' && (
            <div className="mb-2">
              <audio controls className="w-full max-w-[250px] h-10">
                <source src={msg.media_url} />
                Votre navigateur ne supporte pas l'audio.
              </audio>
            </div>
          )}
        
        {/* Message with search highlighting */}
        <p className="text-sm break-words whitespace-pre-wrap">
          {searchInConversation && msg.message 
            ? highlightText(msg.message, searchInConversation)
            : msg.message}
        </p>
        
        <div className={`flex items-center gap-1 mt-1 text-xs ${isFromUs ? 'text-green-100' : 'text-gray-400'}`}>
          <span>{formatDate(msg.created_at)}</span>
          {isFromUs && <MessageStatusIcon status={msg.status} isFromUs={isFromUs} />}
        </div>
        
        {/* Context menu on hover */}
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
              {/* Attachment Button */}
              {/* Attachment Button */}
<div className="relative" ref={attachmentMenuRef}>
  <button
    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
    title="Joindre un fichier"
    disabled={sending || uploadingFile}
  >
    <Paperclip className="h-5 w-5" />
  </button>
  
  {/* Attachment Menu */}
  {showAttachmentMenu && (
    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border z-50 min-w-[180px] overflow-hidden">
      <label className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3 transition cursor-pointer">
        <Image className="h-4 w-4 text-blue-500" />
        <span>Image / Photo</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>
      <label className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3 transition border-t cursor-pointer">
        <FileText className="h-4 w-4 text-red-500" />
        <span>Document (PDF)</span>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>
      <label className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3 transition border-t cursor-pointer">
        <File className="h-4 w-4 text-gray-500" />
        <span>Autre fichier</span>
        <input
          type="file"
          accept=".doc,.docx,.txt,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>
    </div>
  )}
</div>
              
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                title="Emojis"
                disabled={sending}
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
                disabled={sending || uploadingFile}
              />
              
              <button
                onClick={() => sendMessage(replyTo)}
                disabled={(!newMessage.trim() && !uploadingFile) || sending}
                className={`p-2 rounded-full transition ${
                  (newMessage.trim() || uploadingFile) && !sending
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {sending || uploadingFile ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
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
            <p className="text-gray-400">Sélectionnez une conversation ou cliquez sur + pour démarrer</p>
          </div>
        )
      )}

      {/* Modal Nouvelle Conversation */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white rounded-t-lg">
              <h3 className="text-lg font-semibold">Nouvelle conversation</h3>
              <button
                onClick={() => {
                  setShowNewConversation(false);
                  setNewConversationPhone('');
                  setNewConversationMessage('');
                }}
                className="p-1 hover:bg-green-700 rounded-full transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone *
                </label>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  value={newConversationPhone}
                  onChange={(e) => setNewConversationPhone(e.target.value)}
                  placeholder="212 6 12 34 56 78"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format international recommandé: 212XXXXXXXXX
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={newConversationMessage}
                  onChange={(e) => setNewConversationMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowNewConversation(false);
                    setNewConversationPhone('');
                    setNewConversationMessage('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={startNewConversation}
                  disabled={sendingNewConversation || !newConversationPhone.trim() || !newConversationMessage.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingNewConversation ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Export Conversation */}
{showExportModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white rounded-t-lg">
        <h3 className="text-lg font-semibold">Exporter la conversation</h3>
        <button
          onClick={() => setShowExportModal(false)}
          className="p-1 hover:bg-green-700 rounded-full transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            Exporter la conversation avec:
          </p>
          <p className="font-semibold text-green-600">
            {selectedConversation?.prospect_nom || selectedConversation?.profile_name || selectedConversation?.phone_number}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {messages.length} message(s) à exporter
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">
            Le fichier sera exporté au format TXT avec:
          </p>
          <ul className="text-xs text-gray-500 mt-2 space-y-1 list-disc list-inside">
            <li>Date et heure de chaque message</li>
            <li>Nom de l'expéditeur</li>
            <li>Contenu des messages</li>
            <li>Liens des médias (audio)</li>
          </ul>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowExportModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={exportConversation}
            disabled={exporting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Export...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exporter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default WhatsAppMessenger;
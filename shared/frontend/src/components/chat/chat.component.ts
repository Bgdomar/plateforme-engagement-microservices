import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ConversationDTO, MessageDTO, SendMessageRequest, CreateConversationRequest } from '../../services/chat.service';
import { environment } from '../../environments/environment';
import { HeaderStagiaireComponent } from '../stagiaire/header-stagiaire/header-stagiaire';
import { HeaderEncadrantComponent } from '../encadrant/header-encadrant/header-encadrant';

interface UserInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface TeamInfo {
  id: number;
  nom: string;
  sujet: string;
  encadrantId: number;
  memberIds: number[];
  memberCount: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderStagiaireComponent, HeaderEncadrantComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  conversations: ConversationDTO[] = [];
  selectedConversation: ConversationDTO | null = null;
  messages: MessageDTO[] = [];
  newMessage = '';
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  uploading = false;
  currentUser: UserInfo | null = null;
  allUsers: UserInfo[] = [];
  teams: TeamInfo[] = [];
  searchQuery = '';
  loading = false;
  loadingMessages = false;
  showNewChat = false;
  showMobileConversations = true;
  typingUser: string | null = null;
  activeTab: 'conversations' | 'contacts' = 'contacts';
  showCreateGroup = false;
  groupName = '';
  selectedMembers: Set<number> = new Set();

  private subs: Subscription[] = [];
  private typingTimeout: any = null;
  private pollingInterval: any = null;
  private shouldScrollBottom = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    if (this.currentUser) {
      this.loadConversations();
      this.chatService.connect(this.currentUser.id);
      this.setupWebSocketListeners();
      this.startPolling();
      this.loadAllUsers();
      this.loadUserTeams();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollBottom) {
      this.scrollToBottom();
      this.shouldScrollBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.chatService.disconnect();
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
  }

  private loadCurrentUser(): void {
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (!userId || !token) return;

    this.currentUser = {
      id: parseInt(userId),
      nom: '',
      prenom: '',
      email: email || '',
      role: role || ''
    };

    // Fetch full name from API
    fetch(`${environment.apiUrl}/api/profil/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then((profile: any) => {
        if (this.currentUser) {
          this.currentUser.nom = profile.nom || profile.lastName || '';
          this.currentUser.prenom = profile.prenom || profile.firstName || '';
        }
      })
      .catch(() => {});
  }

  loadConversations(): void {
    if (!this.currentUser) return;
    this.loading = true;
    this.chatService.getConversations(this.currentUser.id).subscribe({
      next: (convs) => {
        this.conversations = convs;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  selectConversation(conv: ConversationDTO): void {
    this.selectedConversation = conv;
    this.showMobileConversations = false;
    this.loadMessages(conv.id);
    this.chatService.subscribeToConversation(conv.id);
    if (this.currentUser) {
      this.chatService.markAsRead(conv.id, this.currentUser.id).subscribe(() => {
        conv.unreadCount = 0;
      });
    }
  }

  loadMessages(conversationId: number): void {
    this.loadingMessages = true;
    this.chatService.getMessages(conversationId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.loadingMessages = false;
        this.shouldScrollBottom = true;
      },
      error: () => { this.loadingMessages = false; }
    });
  }

  sendMessage(): void {
    if (this.selectedFile) {
      this.sendFile();
      return;
    }
    if (!this.newMessage.trim() || !this.selectedConversation || !this.currentUser) return;

    const req: SendMessageRequest = {
      conversationId: this.selectedConversation.id,
      senderId: this.currentUser.id,
      senderName: `${this.currentUser.prenom} ${this.currentUser.nom}`,
      content: this.newMessage.trim()
    };

    this.chatService.sendMessageWs(req);

    // Optimistic add
    const optimistic: MessageDTO = {
      id: Date.now(),
      conversationId: req.conversationId,
      senderId: req.senderId,
      senderName: req.senderName,
      content: req.content,
      type: 'TEXT',
      createdAt: new Date().toISOString(),
      read: false
    };
    this.messages.push(optimistic);
    this.newMessage = '';
    this.shouldScrollBottom = true;

    // Update conversation preview
    if (this.selectedConversation) {
      this.selectedConversation.lastMessage = optimistic.content;
      this.selectedConversation.lastMessageSender = optimistic.senderName;
      this.selectedConversation.lastMessageTime = optimistic.createdAt;
    }
  }

  // ── File upload ──

  triggerFileInput(): void {
    this.fileInput?.nativeElement?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 10 Mo)');
      return;
    }
    this.selectedFile = file;
    if (file.type.startsWith('image/')) {
      this.filePreviewUrl = URL.createObjectURL(file);
    } else {
      this.filePreviewUrl = null;
    }
  }

  cancelFile(): void {
    this.selectedFile = null;
    if (this.filePreviewUrl) {
      URL.revokeObjectURL(this.filePreviewUrl);
      this.filePreviewUrl = null;
    }
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  sendFile(): void {
    if (!this.selectedFile || !this.selectedConversation || !this.currentUser) return;
    this.uploading = true;
    const senderName = `${this.currentUser.prenom} ${this.currentUser.nom}`;
    this.chatService.uploadFile(
      this.selectedConversation.id,
      this.currentUser.id,
      senderName,
      this.selectedFile
    ).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.shouldScrollBottom = true;
        if (this.selectedConversation) {
          this.selectedConversation.lastMessage = msg.content;
          this.selectedConversation.lastMessageSender = msg.senderName;
          this.selectedConversation.lastMessageTime = msg.createdAt;
        }
        this.cancelFile();
        this.uploading = false;
      },
      error: () => {
        alert('Erreur lors de l\'envoi du fichier');
        this.uploading = false;
      }
    });
  }

  getFileUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl}${url}`;
  }

  isImage(msg: MessageDTO): boolean {
    return msg.type === 'IMAGE' || (!!msg.fileType && msg.fileType.startsWith('image/'));
  }

  openImage(url: string): void {
    window.open(url, '_blank');
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // ── New Conversation ──

  loadAllUsers(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${environment.apiUrl}/api/profil/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then((users: any[]) => {
        this.allUsers = users
          .filter(u => parseInt(u.userId) !== this.currentUser?.id)
          .map(u => ({
            id: parseInt(u.userId),
            nom: u.nom || '',
            prenom: u.prenom || '',
            email: u.email || '',
            role: u.typeCompte || ''
          }));
      })
      .catch(() => { });
  }

  get filteredUsers(): UserInfo[] {
    if (!this.searchQuery) return this.allUsers;
    const q = this.searchQuery.toLowerCase();
    return this.allUsers.filter(u =>
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  getContactsByRole(role: string): UserInfo[] {
    return this.filteredUsers.filter(u => u.role === role);
  }

  loadUserTeams(): void {
    if (!this.currentUser) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const role = this.currentUser.role;
    const id = this.currentUser.id;
    let url = '';

    if (role === 'STAGIAIRE') {
      url = `${environment.apiUrl}/api/equipes/stagiaire/${id}`;
    } else if (role === 'ENCADRANT') {
      url = `${environment.apiUrl}/api/equipes/encadrant/${id}`;
    }
    if (!url) return;

    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then((equipes: any[]) => {
        this.teams = equipes.map(e => ({
          id: e.id,
          nom: e.nom || 'Équipe',
          sujet: e.sujet || '',
          encadrantId: e.encadrantId,
          memberIds: [e.encadrantId, ...(e.membres || []).map((m: any) => m.stagiaireId)],
          memberCount: 1 + (e.membres || []).length
        }));
      })
      .catch(() => {});
  }

  startTeamChat(team: TeamInfo): void {
    if (!this.currentUser) return;
    const req: CreateConversationRequest = {
      name: team.nom,
      type: 'TEAM',
      teamId: team.id,
      participantIds: team.memberIds
    };
    this.chatService.createConversation(req).subscribe({
      next: (conv) => {
        this.activeTab = 'conversations';
        const existing = this.conversations.find(c => c.id === conv.id);
        if (!existing) this.conversations.unshift(conv);
        this.selectConversation(conv);
      }
    });
  }

  toggleMember(userId: number): void {
    if (this.selectedMembers.has(userId)) {
      this.selectedMembers.delete(userId);
    } else {
      this.selectedMembers.add(userId);
    }
  }

  cancelCreateGroup(): void {
    this.showCreateGroup = false;
    this.groupName = '';
    this.selectedMembers.clear();
  }

  createGroupChat(): void {
    if (!this.currentUser || !this.groupName.trim() || this.selectedMembers.size === 0) return;
    const participantIds = [this.currentUser.id, ...Array.from(this.selectedMembers)];
    const req: CreateConversationRequest = {
      name: this.groupName.trim(),
      type: 'TEAM',
      participantIds: participantIds
    };
    this.chatService.createConversation(req).subscribe({
      next: (conv) => {
        this.cancelCreateGroup();
        this.activeTab = 'conversations';
        const existing = this.conversations.find(c => c.id === conv.id);
        if (!existing) this.conversations.unshift(conv);
        this.selectConversation(conv);
      }
    });
  }

  startDirectChat(user: UserInfo): void {
    if (!this.currentUser) return;
    const req: CreateConversationRequest = {
      name: `${user.prenom} ${user.nom}`,
      type: 'DIRECT',
      participantIds: [this.currentUser.id, user.id]
    };
    this.chatService.createConversation(req).subscribe({
      next: (conv) => {
        this.showNewChat = false;
        this.activeTab = 'conversations';
        const existing = this.conversations.find(c => c.id === conv.id);
        if (!existing) this.conversations.unshift(conv);
        this.selectConversation(conv);
      }
    });
  }

  // ── WebSocket ──

  private setupWebSocketListeners(): void {
    const msgSub = this.chatService.newMessage$.subscribe(msg => {
      if (this.selectedConversation && msg.conversationId === this.selectedConversation.id) {
        const exists = this.messages.find(m => m.id === msg.id);
        if (!exists && msg.senderId !== this.currentUser?.id) {
          this.messages.push(msg);
          this.shouldScrollBottom = true;
        }
      }
      // Update conversation list
      const conv = this.conversations.find(c => c.id === msg.conversationId);
      if (conv) {
        conv.lastMessage = msg.content;
        conv.lastMessageSender = msg.senderName;
        conv.lastMessageTime = msg.createdAt;
        if (this.selectedConversation?.id !== msg.conversationId) {
          conv.unreadCount++;
        }
      }
    });
    this.subs.push(msgSub);

    const typeSub = this.chatService.typing$.subscribe(data => {
      if (data.userId !== this.currentUser?.id && data.conversationId === this.selectedConversation?.id) {
        this.typingUser = data.typing ? data.userName : null;
        if (data.typing) {
          if (this.typingTimeout) clearTimeout(this.typingTimeout);
          this.typingTimeout = setTimeout(() => { this.typingUser = null; }, 3000);
        }
      }
    });
    this.subs.push(typeSub);
  }

  private startPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.loadConversations();
      if (this.selectedConversation) {
        this.chatService.getMessages(this.selectedConversation.id).subscribe(msgs => {
          if (msgs.length > this.messages.length) {
            this.messages = msgs;
            this.shouldScrollBottom = true;
          }
        });
      }
    }, 5000);
  }

  // ── Helpers ──

  getConversationDisplayName(conv: ConversationDTO): string {
    if (conv.type === 'TEAM') return conv.name || 'Équipe';
    if (conv.name) return conv.name;
    return 'Conversation';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  isMyMessage(msg: MessageDTO): boolean {
    return msg.senderId === this.currentUser?.id;
  }

  formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "À l'instant";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  formatMessageTime(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  getTotalUnread(): number {
    return this.conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (e) { }
  }

  backToList(): void {
    this.showMobileConversations = true;
    this.selectedConversation = null;
  }
}

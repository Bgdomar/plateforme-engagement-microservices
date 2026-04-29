import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

export interface ConversationDTO {
  id: number;
  name: string;
  type: 'DIRECT' | 'TEAM';
  teamId: number | null;
  participantIds: number[];
  lastMessage: string | null;
  lastMessageSender: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface MessageDTO {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  createdAt: string;
  read: boolean;
}

export interface CreateConversationRequest {
  name?: string;
  type: 'DIRECT' | 'TEAM';
  teamId?: number;
  participantIds: number[];
}

export interface SendMessageRequest {
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {

  private baseUrl = `${environment.apiUrl}/api/chat`;
  private stompClient: any = null;
  private messageSubject = new Subject<MessageDTO>();
  private typingSubject = new Subject<{ conversationId: number; userId: number; userName: string; typing: boolean }>();
  private connected$ = new BehaviorSubject<boolean>(false);

  public newMessage$ = this.messageSubject.asObservable();
  public typing$ = this.typingSubject.asObservable();
  public isConnected$ = this.connected$.asObservable();

  constructor(private http: HttpClient) {}

  // ── REST API ──

  getConversations(userId: number): Observable<ConversationDTO[]> {
    return this.http.get<ConversationDTO[]>(`${this.baseUrl}/conversations?userId=${userId}`);
  }

  createConversation(req: CreateConversationRequest): Observable<ConversationDTO> {
    return this.http.post<ConversationDTO>(`${this.baseUrl}/conversations`, req);
  }

  getMessages(conversationId: number): Observable<MessageDTO[]> {
    return this.http.get<MessageDTO[]>(`${this.baseUrl}/messages/${conversationId}`);
  }

  sendMessageRest(req: SendMessageRequest): Observable<MessageDTO> {
    return this.http.post<MessageDTO>(`${this.baseUrl}/messages`, req);
  }

  markAsRead(conversationId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/messages/read?conversationId=${conversationId}&userId=${userId}`, {});
  }

  uploadFile(conversationId: number, senderId: number, senderName: string, file: File): Observable<MessageDTO> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId.toString());
    formData.append('senderId', senderId.toString());
    formData.append('senderName', senderName);
    return this.http.post<MessageDTO>(`${this.baseUrl}/messages/upload`, formData);
  }

  // ── WebSocket (STOMP over SockJS) ──

  connect(userId: number): void {
    if (this.stompClient && this.stompClient.connected) return;

    try {
      const SockJS = (window as any)['SockJS'];
      const Stomp = (window as any)['Stomp'];

      if (!SockJS || !Stomp) {
        console.warn('SockJS/Stomp not loaded, using REST polling fallback');
        this.connected$.next(false);
        return;
      }

      const socket = new SockJS(`${environment.apiUrl}/ws/chat`);
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = () => {};

      this.stompClient.connect({}, () => {
        this.connected$.next(true);
        console.log('WebSocket connected');
      }, (error: any) => {
        console.error('WebSocket error:', error);
        this.connected$.next(false);
      });
    } catch (e) {
      console.warn('WebSocket connection failed, using REST fallback');
      this.connected$.next(false);
    }
  }

  subscribeToConversation(conversationId: number): void {
    if (!this.stompClient || !this.stompClient.connected) return;

    this.stompClient.subscribe(`/topic/conversation.${conversationId}`, (msg: any) => {
      const message: MessageDTO = JSON.parse(msg.body);
      this.messageSubject.next(message);
    });

    this.stompClient.subscribe(`/topic/conversation.${conversationId}.typing`, (msg: any) => {
      this.typingSubject.next(JSON.parse(msg.body));
    });
  }

  sendMessageWs(req: SendMessageRequest): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/chat.send', {}, JSON.stringify(req));
    } else {
      this.sendMessageRest(req).subscribe(msg => this.messageSubject.next(msg));
    }
  }

  sendTyping(conversationId: number, userId: number, userName: string, typing: boolean): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/chat.typing', {}, JSON.stringify({ conversationId, userId, userName, typing }));
    }
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.connected$.next(false);
    }
  }
}

export type WebSocketMessageType = 
  | 'connected'
  | 'message_received'
  | 'ai_thinking'
  | 'ai_response'
  | 'ai_streaming'
  | 'error'
  | 'chat_created'

export interface WebSocketMessage {
  type: WebSocketMessageType
  message?: string
  partial_message?: string
  is_complete?: boolean
  chat_id?: number
  chat_name?: string
  message_id?: number
  timestamp?: string
  redirect?: string
}

export interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  isThinking?: boolean
  isStreaming?: boolean
}

export class WebSocketChatManager {
  private ws: WebSocket | null = null
  private token: string
  private chatId: number | null = null
  private onMessage: (message: ChatMessage) => void
  private onError: (error: string) => void
  private onConnected: (chatId: number) => void
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3

  constructor(
    token: string,
    onMessage: (message: ChatMessage) => void,
    onError: (error: string) => void,
    onConnected: (chatId: number) => void
  ) {
    this.token = token
    this.onMessage = onMessage
    this.onError = onError
    this.onConnected = onConnected
  }

  connect(chatId: number) {
    this.chatId = chatId
    this.connectWebSocket()
  }

  async createNewChat(): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.getWebSocketUrl(`/ws/new?token=${encodeURIComponent(this.token)}`)
      console.log('Creating new chat via WebSocket:', wsUrl)
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket for new chat connected')
      }

      ws.onmessage = (event) => {
        console.log('New chat WebSocket message:', event.data)
        const data: WebSocketMessage = JSON.parse(event.data)
        if (data.type === 'chat_created' && data.chat_id) {
          console.log('Chat created successfully:', data.chat_id)
          resolve(data.chat_id)
          ws.close()
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error during chat creation:', error)
        reject(new Error('Failed to create new chat'))
      }

      ws.onclose = (event) => {
        console.log('New chat WebSocket closed:', event.code, event.reason)
        if (event.code !== 1000) {
          reject(new Error('Connection closed unexpectedly'))
        }
      }
    })
  }

  private connectWebSocket() {
    if (!this.chatId || !this.token) {
      console.error('Cannot connect: missing chatId or token', { chatId: this.chatId, hasToken: !!this.token })
      return
    }

    const wsUrl = this.getWebSocketUrl(`/ws/${this.chatId}?token=${encodeURIComponent(this.token)}`)
    console.log('Connecting to WebSocket:', wsUrl)
    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      console.log('WebSocket connected successfully')
    }

    this.ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data)
        this.handleWebSocketMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        setTimeout(() => this.connectWebSocket(), 2000)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.onError('Ошибка соединения с сервером')
    }
  }

  private getWebSocketUrl(path: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    // В dev подключаемся напрямую к бэкенду, так как WebSocket прокси может не работать
    if (import.meta.env?.DEV) {
      return `${protocol}//localhost:8000${path}`
    }
    const host = window.location.host
    return `${protocol}//${host}${path}`
  }

  private handleWebSocketMessage(data: WebSocketMessage) {
    switch (data.type) {
      case 'connected':
        if (data.chat_id) {
          this.onConnected(data.chat_id)
        }
        break

      case 'message_received':
        // Добавляем сообщение пользователя
        if (data.message) {
          this.onMessage({
            id: `user_${Date.now()}`,
            content: data.message,
            isUser: true,
            timestamp: new Date()
          })
        }
        break

      case 'ai_thinking':
        // Показываем индикатор "печатает"
        this.onMessage({
          id: `thinking_${Date.now()}`,
          content: data.message || 'AI обрабатывает запрос...',
          isUser: false,
          timestamp: new Date(),
          isThinking: true
        })
        break

      case 'ai_streaming':
        // Обновляем стриминговое сообщение
        if (data.partial_message) {
          this.onMessage({
            id: `streaming_${Date.now()}`,
            content: data.partial_message,
            isUser: false,
            timestamp: new Date(),
            isStreaming: !data.is_complete
          })
        }
        break

      case 'ai_response':
        // Финальный ответ AI
        if (data.message) {
          this.onMessage({
            id: data.message_id ? `ai_${data.message_id}` : `ai_${Date.now()}`,
            content: data.message,
            isUser: false,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
          })
        }
        break

      case 'error':
        this.onError(data.message || 'Произошла ошибка')
        break
    }
  }

  sendMessage(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'user_message',
        message: message
      }))
    } else {
      this.onError('Соединение не установлено')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

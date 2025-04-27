export interface User {
  _id: string
  username: string
  email: string
  emotions: string
  avatar: string
}

export interface Group {
  _id: string
  name: string
  members: string[]
  totalMembers: number
  avatar: string
}

export interface Message {
  _id: string
  senderId: string
  receiverId?: string
  groupId?: string
  content: string
  status: "sent" | "delivered" | "read" | "undelivered"
  readBy?: {
    userId: string
    readAt: Date | null
  }[]
  sender: {
    _id: string
    username: string
    avatar: string
  }
  createdAt: Date
}

export interface MessageResponseWebsocket {
  success: boolean
  messageId: string
  content: string
  senderId: string
  status: "sent" | "delivered" | "read" | "undelivered"
  createdAt: Date
}

export interface MessageReadReceipt {
  messageId: string
  userId: string
}

export interface UserGroup {
  _id: string
  username: string
  email: string
  avatar: string
}
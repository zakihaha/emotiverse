export interface UserAPI {
  _id: string
  username: string
  email: string
  emotions: string
  avatar: string
}

export interface GroupAPI {
  _id: string
  name: string
  // members: User[]
  members: string[]
  totalMembers: number
  avatar: string
}

export interface MessageAPI {
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

export interface UserGroupAPI {
  id: string
  username: string
  email: string
  avatar: string
}
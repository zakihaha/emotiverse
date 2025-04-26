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

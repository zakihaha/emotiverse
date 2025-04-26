"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Check, CheckCheck, Users } from "lucide-react"
import type { GroupAPI, MessageAPI, UserAPI } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate } from "@/lib/utils"
import { Socket } from "socket.io-client"
import { useSocket } from "@/providers/SocketProvider"

export default function ChatPage() {
  const socket: Socket = useSocket();

  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get("userId")
  const friendId = searchParams.get("friendId")
  const groupId = searchParams.get("groupId")
  const chatType = searchParams.get("type")

  const [chatName, setChatName] = useState("")
  const [chatAvatar, setChatAvatar] = useState("")
  const [chatMembers, setChatMembers] = useState<any[]>([])

  const [friend, setFriend] = useState<UserAPI>({} as UserAPI)
  const [chatHistory, setChatHistory] = useState<MessageAPI[]>([])

  const [group, setGroup] = useState<GroupAPI>({} as any)

  const [content, setContent] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getFriend = async () => {
    if (!userId) {
      router.push("/")
      return
    }

    const response = await fetch(`http://localhost:4000/api/users/${friendId}`)
    const friend = await response.json()

    if (!friend) {
      router.push("/")
      return
    }
    console.log(friend);

    setFriend(friend)
    setChatName(friend.username)
    setChatAvatar(friend.avatar)
  }

  const getChatHistory = async () => {
    if ((!userId && !friendId) || (!userId && !groupId)) {
      router.push("/")
      return
    }

    let url = `http://localhost:4000/api/chat/${userId}/${friendId}`

    if (chatType === "group") {
      url = `http://localhost:4000/api/groups/${groupId}/chat`
    }

    const response = await fetch(url)
    const chatHistory = await response.json()
    console.log(chatHistory);

    setChatHistory(chatHistory)
  }

  const getGroup = async () => {
    if (!userId || !groupId) {
      router.push("/")
      return
    }

    const response = await fetch(`http://localhost:4000/api/groups/${groupId}`)
    const group = await response.json()
    if (!group) {
      router.push("/")
      return
    }
    setGroup(group)
    setChatName(group.name)
    setChatAvatar(group.avatar)
    setChatMembers(group.members)
  }

  useEffect(() => {
    // Load chat data
    if (chatType === "single") {
      getFriend()
    } else if (chatType === "group") {
      getGroup()
    }

    getChatHistory()
  }, [userId, friendId, groupId, chatType, router])

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (msg) => {
      console.log(`Receiving message:`, msg);

      if (msg.senderId !== userId) {
        setChatHistory((prev) => [...prev, msg]);
      }

      socket.emit('read_receipt', { messageId: msg._id, userId }, (res) => {
        console.log('✅ Message read:', res);
      })
    });

    socket.on('message_status_updated', (msg) => {
      console.log(`Message status updated:`, msg);

      setChatHistory((prev) => {
        const updatedMessages = prev.map((message) => {
          if (message._id === msg.messageId) {
            return { ...message, status: msg.status }
          }
          return message
        })
        return updatedMessages
      })
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_status_updated');
    };
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // if (!content || !friend._id) return;

    if (socket) {
      socket.emit('send_message', { senderId: userId, toUserId: friendId, groupId: groupId, content }, (res: any) => {
        if (res.success) {
          const newMsg: MessageAPI = {
            _id: res.messageId,
            content: res.content,
            senderId: res.senderId,
            status: res.status,
            createdAt: new Date(res.createdAt),
          }
          setChatHistory((prev) => [...prev, newMsg]);
          setContent('');
        }
      });
    }
  };

  const getMessageSender = (senderId: string) => {
    if (senderId === userId) {
      return "You"
    }

    if (chatType === "single") {
      return "Unknown"
    } else {
      return "Unknown"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <Check className="h-3 w-3 text-blue-500" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-rose-50 to-indigo-50">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b bg-white shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push(chatType === "single" ? `/dashboard/select-single?userId=${userId}` : `/dashboard/select-group?userId=${userId}`)
          }
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={chatAvatar} alt={chatName} />
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center">
            <h2 className="font-semibold">{chatName}</h2>
            {chatType === "group" && (
              <Badge className="ml-2 bg-indigo-500">
                <Users className="h-3 w-3 mr-1" />
                {chatMembers.length}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">{chatType === "single" ? "Online" : `${chatMembers.length} members`}</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatHistory.map((message) => {
          const isCurrentUser = message.senderId === userId
          return (
            <div key={message._id} className={`mb-4 ${isCurrentUser ? "text-right flex justify-end" : "text-left"}`}>
              {!isCurrentUser && chatType === "group" && (
                <p className="text-xs text-gray-500 mb-1">{getMessageSender(message.senderId)}</p>
              )}
              <div className="gap-2">
                {!isCurrentUser && chatType === "group" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={friend.avatar}
                      alt={friend.username}
                    />
                  </Avatar>
                )}
                <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                  <div className={`message-bubble ${isCurrentUser ? "sent" : "received"}`}>
                    <p>{message.content}</p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>{formatDate(message.createdAt)}</span>
                    {isCurrentUser && <span className="ml-1 flex items-center">{getStatusIcon(message.status)}</span>}
                  </div>
                  {chatType === "group" && message.readBy && message.readBy.length > 0 && isCurrentUser && (
                    <div className="flex -space-x-2 mt-1">
                      <TooltipProvider>
                        {message.readBy.map((userId, idx) => {
                          const reader = chatMembers.find((m) => m.id === userId)
                          if (!reader || reader.id === userId) return null
                          return (
                            <Tooltip key={idx}>
                              <TooltipTrigger asChild>
                                <Avatar className="h-5 w-5 border-2 border-white">
                                  <AvatarImage src={reader.avatar || "/placeholder.svg"} alt={reader.name} />
                                  <AvatarFallback>{reader.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Read by {reader.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t">
        <div className="flex items-center gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!content.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}

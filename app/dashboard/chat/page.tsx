"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react"
import type { Message, MessageReadReceipt, MessageResponseWebsocket, User, UserGroup } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate } from "@/lib/utils"
import { Socket } from "socket.io-client"
import { useSocket } from "@/providers/SocketProvider"

export default function ChatPage() {
  const socket: Socket = useSocket();

  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get("userId") || ""
  const friendId = searchParams.get("friendId")
  const groupId = searchParams.get("groupId")
  const chatType = searchParams.get("type")

  const [chatName, setChatName] = useState("")
  const [chatAvatar, setChatAvatar] = useState("")
  const [chatMembers, setChatMembers] = useState<UserGroup[]>([])

  const [friend, setFriend] = useState<User>({} as User)
  const [chatHistory, setChatHistory] = useState<Message[]>([])

  const [content, setContent] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getFriend = async () => {
    if (!userId) {
      router.push("/")
      return
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${friendId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    const friend = await response.json()

    if (!friend) {
      router.push("/")
      return
    }

    setFriend(friend)
    setChatName(friend.username)
    setChatAvatar(friend.avatar)
  }

  const getChatHistory = async () => {
    if ((!userId && !friendId) || (!userId && !groupId)) {
      router.push("/")
      return
    }

    let url = `${process.env.NEXT_PUBLIC_API_URL}/chat/${userId}/${friendId}`

    if (chatType === "group") {
      url = `${process.env.NEXT_PUBLIC_API_URL}/groups/${groupId}/chat`
    }

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    const chatHistory = await response.json()

    console.log("📂 Getting history chat from API");

    setChatHistory(chatHistory)
  }

  const getGroup = async () => {
    if (!userId || !groupId) {
      router.push("/")
      return
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${groupId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    const group = await response.json()
    if (!group) {
      router.push("/")
      return
    }

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
      console.log(`🎉 Receiving message:`, msg);

      if (msg.senderId !== userId) {
        const validGroupChat = chatType === "group" && msg.receiverId === null && msg.groupId === groupId
        const validSingleChat = chatType === "single" && msg.groupId === null && msg.senderId === friendId

        if (validGroupChat || validSingleChat) {
          setChatHistory((prev) => [...prev, msg]);

          socket.emit('read_receipt', { messageId: msg._id, userId }, (res: MessageReadReceipt) => {
            console.log('✅ Message read:', res);
          })
        }
      }
    });

    socket.on('message_status_updated', (msg) => {
      console.log(`🍀 Message status updated:`, msg);

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

    socket.on('user_joined', (msg) => {
      console.log(`🙋🏻‍♂️ User joined:`, msg);
      setChatMembers((prev) => [...prev, msg.user]);
    });

    socket.on('user_left', (msg) => {
      console.log(`🫤 User left:`, msg);
      setChatMembers((prev) => prev.filter((member) => member._id !== msg.userId));
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_status_updated');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (socket) {
      socket.emit('send_message', { senderId: userId, toUserId: friendId, groupId: groupId, content }, (res: MessageResponseWebsocket) => {
        if (res.success) {
          const newMsg: Message = {
            _id: res.messageId,
            content: res.content,
            senderId: res.senderId,
            status: res.status,
            createdAt: new Date(res.createdAt),
            sender: {
              _id: userId,
              username: chatName,
              avatar: chatAvatar,
            }
          }
          setChatHistory((prev) => [...prev, newMsg]);
          setContent('');
        }
      });
    }
  };

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

  const leaveGroup = () => {
    if (socket) {
      socket.emit("leave_group", { userId, groupId }, (res: any) => {
        if (res.success) {
          console.log("✋🏻 Leaving group");
          router.push(`/dashboard/select-group?userId=${userId}`)
        }
      })
    }
  }

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-rose-50 to-indigo-50">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
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
              </div>
              {chatType === "group" && <p className="text-xs text-gray-500">{`${chatMembers.length} members`}</p>}
            </div>
          </div>
          <div>
            {
              chatType === "group" && (
                <Button
                  variant={"destructive"}
                  size="sm"
                  onClick={leaveGroup}
                >
                  Leave
                </Button>
              )
            }
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatHistory.map((message) => {
          const isCurrentUser = message.senderId === userId
          return (
            <div key={message._id} className={`mb-4 ${isCurrentUser ? "text-right flex justify-end" : "text-left"}`}>
              {!isCurrentUser && chatType === "group" && (
                <p className="text-xs text-gray-500 mb-1">{message.sender.username}</p>
              )}
              <div className="gap-2">
                {!isCurrentUser && chatType === "group" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={message.sender.avatar}
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
                          const reader = chatMembers.find((m) => m._id === userId.userId)
                          if (!reader || reader._id === userId.userId) return null
                          return (
                            <Tooltip key={idx}>
                              <TooltipTrigger asChild>
                                <Avatar className="h-5 w-5 border-2 border-white">
                                  <AvatarImage src={reader.avatar || "/placeholder.svg"} alt={reader.username} />
                                  <AvatarFallback>{reader.username.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Read by {reader.username}</p>
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

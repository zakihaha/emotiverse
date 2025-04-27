"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { User } from "@/lib/types"

export default function SelectSinglePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get("userId")

  const [friends, setFriends] = useState<User[]>([])

  const getFriends = async () => {
    if (!userId) {
      router.push("/")
      return
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?except=${userId}`)
    const friends = await response.json()

    if (!friends) {
      router.push("/")
      return
    }

    setFriends(friends)
  }

  useEffect(() => {
    getFriends()
  }, [userId, router])

  const handleSelectFriend = (friendId: string) => {
    router.push(`/dashboard/chat?userId=${userId}&friendId=${friendId}&type=single`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-rose-50 to-indigo-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/chat-mode?userId=${userId}`)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-rose-600">Select a Friend</h1>
            <p className="text-gray-600">Choose someone to start chatting with</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {friends.map((friend) => (
            <Card
              key={friend._id}
              className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer py-0"
              onClick={() => handleSelectFriend(friend._id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={friend.avatar} alt={friend.username} />
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{friend.username}</h3>
                      {/* <span className="text-xs text-gray-500">{friend.lastSeen}</span> */}
                    </div>
                    <div>
                      <Badge
                        className="text-white bg-sky-500"
                        variant="secondary"
                      >
                        {friend.emotions}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

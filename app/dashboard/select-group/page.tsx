"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users } from "lucide-react"
import { Group } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Socket } from "socket.io-client"
import { useSocket } from "@/providers/SocketProvider"

export default function SelectGroupPage() {
  const socket: Socket = useSocket();

  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get("userId")

  const [joinedGroups, setJoinedGroups] = useState<Group[]>([])
  const [availableGroups, setAvailableGroups] = useState<Group[]>([])

  const getUser = async () => {
    if (!userId) {
      router.push("/")
      return
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    const user = await response.json()

    if (!user) {
      router.push("/")
      return
    }
  }

  const getMyGroups = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/groups`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    const myGroups = await response.json()

    setJoinedGroups(myGroups)
  }

  const getAvailableGroups = async () => {
    if (!userId) {
      router.push("/")
      return
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/available-groups/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
    const availableGroups = await response.json()
    setAvailableGroups(availableGroups)
  }

  const handleSelectGroup = (groupId: string) => {
    router.push(`/dashboard/chat?userId=${userId}&groupId=${groupId}&type=group`)
  }

  const handleJoinGroup = async (groupId: string) => {
    if (socket) {
      socket.emit("join_group", { userId, groupId }, (res: any) => {
        if (res.success) {
          router.push(`/dashboard/chat?userId=${userId}&groupId=${groupId}&type=group`)
        }
      })
    }
  }

  useEffect(() => {
    getUser()
    getMyGroups()
    getAvailableGroups()
  }, [userId, router])

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
            <h1 className="text-2xl font-bold tracking-tight text-indigo-600">Select a Group</h1>
            <p className="text-gray-600">Join a conversation or start a new one</p>
          </div>
        </div>

        <Tabs defaultValue="joined" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="joined">My Groups</TabsTrigger>
            <TabsTrigger value="available">Available Groups</TabsTrigger>
          </TabsList>
          <TabsContent value="joined" className="mt-4">
            {joinedGroups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You haven't joined any groups yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {joinedGroups.map((group) => (
                  <Card
                    key={group._id}
                    className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer py-0"
                    onClick={() => handleSelectGroup(group._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={group.avatar} alt={group.name} />
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{group.name}</h3>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">
                              <Users className="inline h-3 w-3 mr-1" />
                              {group.members.length} members
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="available" className="mt-4">
            {availableGroups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No available groups to join.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {availableGroups.map((group) => (
                  <Card
                    key={group._id}
                    className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer py-0"
                    onClick={() => handleJoinGroup(group._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={group.avatar} alt={group.name} />
                          <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{group.name}</h3>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">
                              <Users className="inline h-3 w-3 mr-1" />
                              {group.members.length} members
                            </p>
                            <Badge className="ml-2 bg-indigo-500">Join</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

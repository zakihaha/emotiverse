"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserRound } from "lucide-react"
import { useEffect, useState } from "react"

export default function ChatModePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get("userId")
  const [userName, setUserName] = useState("")

  const getUser = async () => {
    if (!userId) {
      router.push("/")
      return
    }

    const response = await fetch(`http://localhost:4000/api/users/${userId}`)
    const user = await response.json()

    if (!user) {
      router.push("/")
      return
    }

    setUserName(user.username)
  }

  useEffect(() => {
    getUser()
  }, [userId, router])

  const handleSelectMode = (mode: "single" | "group") => {
    router.push(`/dashboard/select-${mode}?userId=${userId}`)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-rose-600">
            Emoti<span className="text-indigo-600">Verse</span>
          </h1>
          <p className="mt-2 text-gray-600">Welcome, {userName}! Choose your chat mode</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card
            className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer py-0 gap-0"
            onClick={() => handleSelectMode("single")}
          >
            <CardHeader className="bg-gradient-to-r from-rose-500 to-rose-600 text-white py-6">
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-6 w-6" />
                Single Chat
              </CardTitle>
              <CardDescription className="text-rose-100">Chat one-on-one with your friends</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600">
                Start a private conversation with any of your friends. Perfect for personal discussions and catching up.
              </p>
            </CardContent>
          </Card>

          <Card
            className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer py-0 gap-0"
            onClick={() => handleSelectMode("group")}
          >
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-6">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Group Chat
              </CardTitle>
              <CardDescription className="text-indigo-100">Chat with multiple people at once</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600">
                Join existing group conversations or create new ones. Great for team discussions, planning events, or
                just hanging out.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => router.push("/")} className="text-gray-600">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}

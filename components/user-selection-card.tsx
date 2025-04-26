"use client"

import type { UserAPI } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { setCookie } from 'cookies-next';

interface UserSelectionCardProps {
  user: UserAPI
}

export function UserSelectionCard({ user }: UserSelectionCardProps) {
  const router = useRouter()

  const handleSelectUser = async () => {
    const response = await fetch(`http://localhost:4000/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email, password: "password" }),
    })

    const data = await response.json()
    if (!data) {
      router.push("/")
      return
    }

    setCookie('token', data.token, {
      maxAge: 60 * 60 * 24, // Set the cookie to expire in 1 day
      path: '/',            // Available throughout the site
    });

    window.location.href = `/dashboard/chat-mode?userId=${user._id}`;
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={handleSelectUser}
    >
      <CardContent className="p-6 flex flex-col items-center">
        <div className="relative">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={user.avatar} alt={user.username} />
          </Avatar>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-lg">{user.username}</h3>
          <Badge
            className="mt-2 bg-sky-500"
          >
            {user.emotions}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

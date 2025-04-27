import { UserSelectionCard } from "@/components/user-selection-card"
import { User } from "@/lib/types"

export default async function Home() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`)
  const users = await response.json()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-indigo-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-rose-600">
            Emoti<span className="text-indigo-600">Verse</span>
          </h1>
          <p className="mt-2 text-gray-600">Select your profile to get started</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {users.map((user: User, idx: number) => (
            <UserSelectionCard key={idx} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
}

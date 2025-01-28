"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface User {
  publicKey: string
  isAuthenticated: boolean
}

export default function BlockExplorer() {
  const [searchKey, setSearchKey] = useState("")

  const users: User[] = [
    { publicKey: "user1PublicKey", isAuthenticated: true },
    { publicKey: "user2PublicKey", isAuthenticated: false },
    // Add more user objects as needed
  ]

  const filteredUsers = users.filter((user) =>
    user.publicKey.toLowerCase().includes(searchKey.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Authentication Explorer
          </h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                Authentication Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                <Input
                  type="text"
                  placeholder="Search by public key"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  className="flex-grow"
                />
                <Button className="w-full sm:w-auto">Search</Button>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                A total of authenticated records found
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2">Public Key</TableHead>
                      <TableHead>Authentication Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.publicKey}>
                        <TableCell className="font-mono break-all">
                          {user.publicKey}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              user.isAuthenticated
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isAuthenticated
                              ? "Authenticated"
                              : "Not Authenticated"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No records found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm sm:text-base text-gray-500">
          © 2023 Authentication Explorer. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

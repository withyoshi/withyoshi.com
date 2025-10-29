"use client";

import {
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Globe,
  Hash,
  Lock,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ChatSession {
  id: string;
  date: string;
  userName: string;
  duration: number;
  totalTokens: number;
  ip: string;
  country: string;
  summary: string;
  cost: number;
}

interface GlobalStats {
  totalSessions: number;
  totalTokens: number;
  cachedInputTokens: number;
  chargedTokens: number;
  promptTokens: number;
  completionTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

interface ChatLogDetail {
  session: ChatSession;
  transcript: {
    chatSessionId: string;
    messages: any[];
  } | null;
}

export default function CvLogsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatLogDetail | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);

  const fetchLogs = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/cv/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
        setGlobalStats(data.globalStats);
      } else {
        localStorage.removeItem("admin_token");
        setIsAuthenticated(false);
      }
    } catch {
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
      fetchLogs(token);
    }
  }, [fetchLogs]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cv/logs", {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
        setGlobalStats(data.globalStats);
        setIsAuthenticated(true);
        localStorage.setItem("admin_token", password);
        setPassword("");
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`/api/cv/logs/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedSession(data);
        setShowModal(true);
      }
    } catch {
      setError("Failed to fetch session details");
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  const formatCost = (cost: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(cost);

  const formatLocation = (country: string, ip: string) => {
    if (country === "Unknown" && ip === "Unknown") {
      return "Unknown";
    }
    return `${country} (${ip})`;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div className="mb-8 text-center">
            <Lock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h1 className="font-bold text-2xl text-gray-900">Admin Access</h1>
            <p className="mt-2 text-gray-600">
              Enter password to view chat logs
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-mint-500 focus:ring-2 focus:ring-mint-500"
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                type="password"
                value={password}
              />
            </div>

            {error && (
              <div className="text-center text-red-600 text-sm">{error}</div>
            )}

            <button
              className="w-full rounded-lg bg-mint-600 py-3 text-white hover:bg-mint-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-bold text-3xl text-gray-900">
            Chat Logs Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Monitor CV chatbot interactions</p>
        </div>

        {globalStats && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="font-medium text-gray-600 text-sm">
                    Total Sessions
                  </p>
                  <p className="font-bold text-2xl text-gray-900">
                    {formatNumber(globalStats.totalSessions)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="font-medium text-gray-600 text-sm">
                    Total Tokens
                  </p>
                  <p className="font-bold text-2xl text-gray-900">
                    {formatNumber(globalStats.totalTokens)}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatNumber(globalStats.cachedInputTokens)} cached
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="font-medium text-gray-600 text-sm">
                    Charged Tokens
                  </p>
                  <p className="font-bold text-2xl text-gray-900">
                    {formatNumber(globalStats.chargedTokens)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Cost */}
            <div className="rounded-lg border-2 border-green-200 bg-white p-6 shadow">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="font-medium text-gray-600 text-sm">
                    Total Cost
                  </p>
                  <p className="font-bold text-2xl text-gray-900">
                    {formatCost(globalStats.totalCost)}
                  </p>
                  <p className="text-gray-500 text-xs">GPT-4o-mini pricing</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-white shadow">
          <div className="border-gray-200 border-b px-6 py-4">
            <h2 className="font-medium text-gray-900 text-lg">
              Recent Sessions
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-mint-600 border-b-2" />
              <p className="mt-2 text-gray-600">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No chat sessions found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <div className="p-6 hover:bg-gray-50" key={session.id}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center space-x-4 text-gray-500 text-sm">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(session.date)}
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1 h-4 w-4" />
                          {session.userName}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {formatDuration(session.duration)}
                        </div>
                        <div className="flex items-center">
                          <Hash className="mr-1 h-4 w-4" />
                          {formatNumber(session.totalTokens)} tokens (
                          {formatCost(session.cost)})
                        </div>
                        <div className="flex items-center">
                          <Globe className="mr-1 h-4 w-4" />
                          {formatLocation(session.country, session.ip)}
                        </div>
                      </div>

                      {session.summary && (
                        <p className="mt-2 line-clamp-2 text-gray-700 text-sm">
                          {session.summary}
                        </p>
                      )}
                    </div>

                    <button
                      className="ml-4 flex cursor-pointer items-center rounded-md px-3 py-2 text-mint-600 text-sm transition-colors hover:bg-mint-50 hover:text-mint-700"
                      onClick={() => fetchSessionDetails(session.id)}
                      type="button"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[80vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-gray-200 border-b px-6 py-4">
              <h3 className="font-medium text-gray-900 text-lg">
                Chat Log - {selectedSession.session.userName}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowModal(false)}
                type="button"
              >
                <svg
                  aria-label="Close"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Close</title>
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedSession.transcript ? (
                <div className="space-y-4">
                  {selectedSession.transcript.messages.map(
                    (message: any, index: number) => (
                      <div
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                        key={index}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === "user"
                              ? "bg-mint-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="mb-1 font-medium text-sm">
                            {message.role === "user" ? "User" : "Assistant"}
                          </div>
                          <div className="text-sm">
                            {message.parts
                              ?.filter((part: any) => part.type === "text")
                              .map((part: any) => part.text)
                              .join("") ||
                              message.content ||
                              ""}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  Full transcript not available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

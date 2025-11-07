"use client";

import {
  CheckSquare,
  DollarSign,
  Lock,
  Square,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { getCountryName } from "@/lib/utils/country-names";
import { MessageItem } from "../chatbot/message-item";

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
  session: ChatSession & {
    conversationState?: {
      userName?: string;
      userIntro?: string;
      contact?: string;
      userType?: "guest" | "pro" | "vip" | null;
      lastActivity?: number;
    };
  };
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

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
      }
    } catch {
      setError("Failed to fetch session details");
    }
  };

  const formatDuration = (seconds: number) => {
    const sec = Number.isFinite(seconds) ? seconds : 0;
    if (sec < 60) {
      return `${Math.round(sec)}s`;
    }
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = Math.round(sec % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const formatNumber = (num: number) => {
    const n = Number.isFinite(num) ? num : 0;
    return new Intl.NumberFormat().format(n);
  };

  const formatTokens = (n: number) => {
    const num = Number.isFinite(n) ? n : 0;
    if (num >= 1000) {
      const k = Math.floor(num / 1000);
      const remainder = num % 1000;
      if (remainder >= 100) {
        return `${k}.${Math.floor(remainder / 100)}k`;
      }
      return `${k}k`;
    }
    return num.toString();
  };

  const formatCost = (cost: number) => {
    const c = Number.isFinite(cost) ? cost : 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(c);
  };

  const formatLocation = (country: string, ip: string) => {
    if (country === "Unknown" && ip === "Unknown") {
      return "Unknown";
    }
    const countryName = getCountryName(country);
    return { countryCode: country, countryName, ip };
  };

  const handleToggleSelect = (sessionId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) {
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/cv/logs/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove from selected if it was selected
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
        // Refresh the list
        await fetchLogs(token);
      } else {
        setError("Failed to delete session");
      }
    } catch {
      setError("Failed to delete session");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.size} session(s)?`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch("/api/cv/logs", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (response.ok) {
        setSelectedIds(new Set());
        // Refresh the list
        await fetchLogs(token);
      } else {
        setError("Failed to delete sessions");
      }
    } catch {
      setError("Failed to delete sessions");
    } finally {
      setDeleting(false);
    }
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Chat Sessions List */}
      <div className="flex w-80 flex-col border-l border-r border-gray-200 bg-white shadow-2xl overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200 px-4 py-4">
          <h1 className="font-bold text-xl text-gray-900">Chat Logs</h1>
          <p className="mt-1 text-gray-600 text-sm">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {error && (
          <div className="flex-shrink-0 border-b border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-red-800 text-xs">{error}</p>
              <button
                aria-label="Close error"
                className="text-red-600 hover:text-red-800"
                onClick={() => setError(null)}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 text-sm">
                {selectedIds.size} selected
              </span>
              <button
                className="flex items-center rounded-md bg-red-600 px-3 py-1.5 text-white text-xs transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={deleting}
                onClick={handleBulkDelete}
                type="button"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-mint-600 border-b-2" />
              <p className="mt-2 text-gray-600 text-xs">Loading...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No sessions found
            </div>
          ) : (
            <div>
              {sessions.map((session) => {
                const isSelected = selectedSession?.session.id === session.id;
                return (
                  <div
                    className={`flex w-full items-start transition-colors ${
                      isSelected
                        ? "bg-mint-50 border-l-[3px] border-mint-600 border-b-0"
                        : "hover:bg-gray-50 border-b border-gray-100"
                    }`}
                    key={session.id}
                  >
                    <button
                      className="flex-shrink-0 px-3 py-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(session.id);
                      }}
                      type="button"
                    >
                      {selectedIds.has(session.id) ? (
                        <CheckSquare className="h-4 w-4 text-mint-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      className="flex-1 cursor-pointer text-left"
                      onClick={() => fetchSessionDetails(session.id)}
                      type="button"
                    >
                      <div className="py-3 pr-4">
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate font-medium text-gray-900 text-sm">
                            {session.userName || "Anonymous"}
                          </span>
                          <span className="flex-shrink-0 text-gray-500 text-xs whitespace-nowrap">
                            {formatDuration(session.duration)}
                          </span>
                        </div>
                        {session.summary && (
                          <p className="mb-1.5 line-clamp-2 text-gray-600 text-xs leading-relaxed">
                            {session.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <span>
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Zap className="h-3 w-3 text-purple-600" />
                            {formatTokens(session.totalTokens)}
                          </span>
                          {session.country && session.country !== "Unknown" && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <ReactCountryFlag
                                  countryCode={session.country}
                                  style={{
                                    width: "0.875em",
                                    height: "0.875em",
                                  }}
                                  svg
                                  title={getCountryName(session.country)}
                                />
                                <span>{session.country}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global stats footer */}
        {globalStats && (
          <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-blue-600" />
                  <span className="text-gray-600">Total Sessions</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatNumber(globalStats.totalSessions)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-purple-600" />
                  <span className="text-gray-600">Total Tokens</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatNumber(globalStats.totalTokens)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-red-600" />
                  <span className="text-gray-600">Charged Tokens</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatNumber(globalStats.chargedTokens)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  <span className="text-gray-600">Total Cost</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatCost(globalStats.totalCost)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Message View */}
      <div className="flex flex-1 flex-col border-r border-gray-200 bg-gray-50 shadow-2xl overflow-hidden">
        {selectedSession ? (
          <>
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-gray-900 text-lg">
                    {selectedSession.session.userName || "Anonymous"}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-gray-500 text-sm">
                    <span>{formatDate(selectedSession.session.date)}</span>
                    <span>•</span>
                    <span>
                      {formatDuration(selectedSession.session.duration)}
                    </span>
                    <span>•</span>
                    <span>
                      {formatNumber(selectedSession.session.totalTokens)} tokens
                    </span>
                    <span>•</span>
                    <span>{formatCost(selectedSession.session.cost)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      {(() => {
                        const location = formatLocation(
                          selectedSession.session.country,
                          selectedSession.session.ip
                        );
                        if (location === "Unknown") {
                          return "Unknown";
                        }
                        return (
                          <>
                            <ReactCountryFlag
                              countryCode={location.countryCode}
                              style={{
                                width: "1em",
                                height: "1em",
                              }}
                              svg
                              title={location.countryName}
                            />
                            <span>
                              {location.countryName} ({location.countryCode})
                            </span>
                            <span className="text-gray-400">
                              ({location.ip})
                            </span>
                          </>
                        );
                      })()}
                    </span>
                  </div>
                </div>
                <button
                  className="flex cursor-pointer items-center rounded-md px-3 py-2 text-red-600 text-sm transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={deleting}
                  onClick={() =>
                    handleDeleteSession(selectedSession.session.id)
                  }
                  type="button"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>

            {/* Messages and Conversation State */}
            <div className="flex flex-1 overflow-hidden">
              {/* Messages Column */}
              <div className="relative flex-1 overflow-hidden">
                {/* Fixed gradient background */}
                <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top_left,#d1fae5,transparent)]" />
                <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_right,#f0fdf4,transparent)]" />
                {/* Scrollable content wrapper */}
                <div className="relative z-20 h-full overflow-y-auto bg-white/5 backdrop-blur-sm backdrop-brightness-95 backdrop-contrast-80 px-6 py-4">
                  {selectedSession.transcript ? (
                    <div className="mx-auto max-w-3xl space-y-4">
                      {selectedSession.transcript.messages.map(
                        (message: any, index: number) => {
                          const sessionStartTime = new Date(
                            selectedSession.session.date
                          ).getTime();
                          // Estimate timestamp: assume messages are evenly spaced or use createdAt if available
                          const messageTime =
                            message.createdAt ||
                            message.timestamp ||
                            new Date(
                              sessionStartTime + index * 30_000
                            ).toISOString(); // Rough estimate: 30s per message

                          const prevMessage =
                            index > 0
                              ? selectedSession.transcript?.messages[index - 1]
                              : null;
                          const prevMessageTime = prevMessage
                            ? prevMessage.createdAt ||
                              prevMessage.timestamp ||
                              new Date(
                                sessionStartTime + (index - 1) * 30_000
                              ).toISOString()
                            : null;

                          const showTimestamp =
                            index === 0 ||
                            (prevMessageTime &&
                              new Date(messageTime).getTime() -
                                new Date(prevMessageTime).getTime() >
                                60_000); // Show if > 1 minute difference

                          return (
                            <div key={message.id || index}>
                              {showTimestamp && (
                                <div className="my-4 text-center">
                                  <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-600 text-xs">
                                    {new Date(messageTime).toLocaleString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </span>
                                </div>
                              )}
                              <MessageItem
                                conversationState={
                                  selectedSession.session
                                    .conversationState as any
                                }
                                enableTypewriter={false}
                                message={{
                                  id: message.id || `msg-${index}`,
                                  role: message.role,
                                  content: message.content,
                                  parts: message.parts,
                                }}
                              />
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      Full transcript not available
                    </div>
                  )}
                </div>
              </div>

              {/* Conversation State Column */}
              <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
                <div className="p-6">
                  <h3 className="mb-4 font-medium text-gray-900 text-sm">
                    Conversation State
                  </h3>
                  <div className="space-y-4">
                    {/* User Name */}
                    <div>
                      <div className="mb-1 text-gray-600 text-xs font-bold">
                        User Name
                      </div>
                      <div className="text-gray-700 text-sm">
                        {selectedSession.session.conversationState?.userName ||
                          "—"}
                      </div>
                    </div>

                    {/* User Intro */}
                    <div>
                      <div className="mb-1 text-gray-600 text-xs font-bold">
                        User Introduction
                      </div>
                      <div className="text-gray-700 text-sm whitespace-pre-wrap">
                        {selectedSession.session.conversationState?.userIntro ||
                          "—"}
                      </div>
                    </div>

                    {/* Contact */}
                    <div>
                      <div className="mb-1 text-gray-600 text-xs font-bold">
                        Contact
                      </div>
                      <div className="text-gray-700 text-sm whitespace-pre-wrap">
                        {selectedSession.session.conversationState?.contact ||
                          "—"}
                      </div>
                    </div>

                    {/* User Type */}
                    <div>
                      <div className="mb-1 text-gray-600 text-xs font-bold">
                        User Type
                      </div>
                      <div className="text-gray-700 text-sm">
                        {selectedSession.session.conversationState?.userType ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-mint-100 text-mint-800">
                            {selectedSession.session.conversationState.userType.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-gray-400">GUEST</span>
                        )}
                      </div>
                    </div>

                    {/* Last Activity */}
                    {selectedSession.session.conversationState
                      ?.lastActivity && (
                      <div>
                        <div className="mb-1 text-gray-600 text-xs font-bold">
                          Last Activity
                        </div>
                        <div className="text-gray-700 text-sm">
                          {new Date(
                            selectedSession.session.conversationState
                              .lastActivity
                          ).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">
                Select a session to view messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiError {
  error: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as ApiError).error || "Something went wrong");
  }

  return data as T;
}

export const api = {
  register: (input: { name: string; email: string; password: string }) =>
    request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  login: (input: { email: string; password: string }) =>
    request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  me: () => request<{ user: any }>("/auth/me"),

  rooms: {
  list: () => request<{ rooms: any[] }>("/rooms"),

  create: (input: { name: string; language?: string }) =>
    request<{ room: any }>("/rooms", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  join: (joinCode: string) =>
    request<{ room: any }>("/rooms/join", {
      method: "POST",
      body: JSON.stringify({ joinCode }),
    }),

  getOne: (id: string) => request<{ room: any }>(`/rooms/${id}`),

  getMessages: (id: string) => request<{ messages: any[] }>(`/rooms/${id}/messages`),

  execute: (id: string, stdin?: string) =>
    request<{ result: any }>(`/rooms/${id}/execute`, {
      method: "POST",
      body: JSON.stringify({ stdin }),
    }),
},
};
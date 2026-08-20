const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiError {
  error: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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
  // -------------------------
  // AUTH
  // -------------------------

  register: (input: {
    name: string;
    email: string;
    password: string;
  }) =>
    request<{ user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  login: (input: {
    email: string;
    password: string;
  }) =>
    request<{ user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  logout: () =>
    request<{ ok: boolean }>("/auth/logout", {
      method: "POST",
    }),

  me: () =>
    request<{ user: any }>("/auth/me"),

  // -------------------------
  // ROOMS
  // -------------------------

  rooms: {
    list: () =>
      request<{ rooms: any[] }>("/rooms"),

    create: (input: {
      name: string;
      language?: string;
    }) =>
      request<{ room: any }>("/rooms", {
        method: "POST",
        body: JSON.stringify(input),
      }),

    join: (joinCode: string) =>
      request<{ room: any }>("/rooms/join", {
        method: "POST",
        body: JSON.stringify({ joinCode }),
      }),

    getOne: (id: string) =>
      request<{ room: any }>(`/rooms/${id}`),

    getMessages: (id: string) =>
      request<{ messages: any[] }>(
        `/rooms/${id}/messages`
      ),

    execute: (id: string, stdin?: string) =>
      request<{ result: any }>(`/rooms/${id}/execute`, {
        method: "POST",
        body: JSON.stringify({ stdin }),
      }),
  },
};
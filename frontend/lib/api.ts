const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiError {
  error?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await res.text();

  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    console.error("Non-JSON API response:", {
      path,
      status: res.status,
      response: text.slice(0, 500),
    });

    throw new Error(
      `Server returned ${res.status}: ${text.slice(0, 200)}`
    );
  }

  console.log("API response:", {
    path,
    status: res.status,
    data,
  });

  if (!res.ok) {
    const errorData = data as ApiError;

    throw new Error(
      errorData.error || "Something went wrong"
    );
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
    request<{ user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  login: (input: {
    email: string;
    password: string;
  }) =>
    request<{ user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  logout: () =>
    request<{ ok: boolean }>("/api/auth/logout", {
      method: "POST",
    }),

  me: () =>
    request<{ user: any }>("/api/auth/me"),

  // -------------------------
  // ROOMS
  // -------------------------

  rooms: {
    list: () =>
      request<{ rooms: any[] }>("/api/rooms"),

    create: (input: {
      name: string;
      language?: string;
    }) =>
      request<{ room: any }>("/api/rooms", {
        method: "POST",
        body: JSON.stringify(input),
      }),

    join: (joinCode: string) =>
      request<{ room: any }>("/api/rooms/join", {
        method: "POST",
        body: JSON.stringify({ joinCode }),
      }),

    getOne: (id: string) =>
      request<{ room: any }>(`/api/rooms/${id}`),

    getMessages: (id: string) =>
      request<{ messages: any[] }>(
        `/api/rooms/${id}/messages`
      ),

    execute: (id: string, stdin?: string) =>
      request<{ result: any }>(
        `/api/rooms/${id}/execute`,
        {
          method: "POST",
          body: JSON.stringify({ stdin }),
        }
      ),

    review: (id: string) =>
      request<{ result: any }>(
        `/api/rooms/${id}/review`,
        {
          method: "POST",
        }
      ),
  },
};
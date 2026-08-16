interface PresentUser {
  userId: string;
  name: string;
}

interface PresenceListProps {
  users: PresentUser[];
}

export function PresenceList({ users }: PresenceListProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-gray-400">
        In this room ({users.length + 1})
      </h2>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-green-900 text-green-200 rounded-full px-3 py-1">
          You
        </span>
        {users.map((user) => (
          <span
            key={user.userId}
            className="text-xs bg-gray-800 text-gray-200 rounded-full px-3 py-1"
          >
            {user.name}
          </span>
        ))}
      </div>
    </div>
  );
}
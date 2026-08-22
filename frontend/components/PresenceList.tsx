interface PresentUser {
  userId: string;
  name: string;
}

interface PresenceListProps {
  users: PresentUser[];
}

export function PresenceList({ users }: PresenceListProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2">
        {/* Current user */}
        <div
          title="You"
          className="h-7 w-7 rounded-full bg-indigo-600 border-2 border-[#0d121c] flex items-center justify-center text-[9px] font-semibold text-white"
        >
          You
        </div>

        {/* Other users */}
        {users.map((user) => (
          <div
            key={user.userId}
            title={user.name}
            className="h-7 w-7 rounded-full bg-[#232b3d] border-2 border-[#0d121c] flex items-center justify-center text-xs font-medium text-gray-200"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>

      <span className="text-xs text-gray-500 ml-1">
        {users.length + 1}
      </span>
    </div>
  );
}
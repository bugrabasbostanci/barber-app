"use client";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export function Avatar({ name, size = "md", onClick }: AvatarProps) {
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold hover:bg-blue-700 transition-colors`}
    >
      {getInitials(name)}
    </button>
  );
}

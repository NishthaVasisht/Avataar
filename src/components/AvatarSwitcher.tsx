import { useState } from "react";
import "./styles/avatarSwitcher.css";

interface AvatarSwitcherProps {
  onSwitch: (avatar: "my-avatar" | "character") => void;
}

const AvatarSwitcher = ({ onSwitch }: AvatarSwitcherProps) => {
  const [activeAvatar, setActiveAvatar] = useState<"my-avatar" | "character">("my-avatar");

  const handleSwitch = (avatar: "my-avatar" | "character") => {
    setActiveAvatar(avatar);
    onSwitch(avatar);
    // Reload page to apply changes
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="avatar-switcher">
      <button
        className={`avatar-btn ${activeAvatar === "my-avatar" ? "active" : ""}`}
        onClick={() => handleSwitch("my-avatar")}
      >
        Your Avatar
      </button>
      <button
        className={`avatar-btn ${activeAvatar === "character" ? "active" : ""}`}
        onClick={() => handleSwitch("character")}
      >
        Original Avatar
      </button>
    </div>
  );
};

export default AvatarSwitcher;
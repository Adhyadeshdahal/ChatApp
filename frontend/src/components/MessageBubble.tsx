import { Message } from "../types";

interface Props {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: Props) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} mb-2`}>
      {!isOwn && (
        <span className="text-xs text-gray-500 font-medium mb-1 ml-1">{message.senderName}</span>
      )}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isOwn
            ? "bg-blue-500 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
        }`}
      >
        {message.content}
      </div>
      <span className="text-[11px] text-gray-400 mt-0.5 mx-1">{time}</span>
    </div>
  );
}
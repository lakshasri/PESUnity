const MessageBubble = ({ message }) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <span className="font-medium text-sm">
          {message.sender.name}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="text-gray-800">{message.text}</p>
      </div>
    </div>
  );
};

export default MessageBubble; 
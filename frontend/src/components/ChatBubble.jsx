const ChatBubble = ({ text, senderName, mine }) => {
  return (
    <div
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        backgroundColor: mine ? "#00e0ff" : "#2d2d44",
        color: mine ? "#0e0f1a" : "#ffffff",
        borderRadius: "12px",
        padding: "10px 14px",
        marginBottom: "10px",
        maxWidth: "70%",
      }}
    >
      {!mine && <div style={{ fontSize: "0.85rem", marginBottom: 4, color: "#aaa" }}>{senderName}</div>}
      {text}
    </div>
  );
};

export default ChatBubble;

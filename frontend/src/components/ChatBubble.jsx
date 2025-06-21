const ChatBubble = ({ senderName, text, mine }) => (
    <div style={{ textAlign: mine ? "right" : "left", margin: "10px 0" }}>
      <small>{senderName}</small>
      <div
        style={{
          display: "inline-block",
          background: mine ? "#dcf8c6" : "#eaeaea",
          padding: "8px 14px",
          borderRadius: 12,
          maxWidth: "60%",
        }}
      >
        {text}
      </div>
    </div>
  );
  
  export default ChatBubble;
  
import React, { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import "./AnnouncementViewer.css";

const AnnouncementViewer = () => {
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [announcement, setAnnouncement] = useState(null);
  const connectionRef = useRef(null);

  const startConnection = async () => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5080/announcement", { withCredentials: false })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.on("ReceiveAnnouncement", (data) => {
      if (data && Object.keys(data).length > 0) {
        setAnnouncement(data);
      } else {
        setAnnouncement(null);
      }
    });

  connection.onreconnecting((error) => {
    console.warn("Reconnecting...", error);
    setConnectionStatus("🔄 Reconnecting...");
  });

  connection.onreconnected((connectionId) => {
    console.log("Reconnected:", connectionId);
    setConnectionStatus("✅ Reconnected");
  });

    try {
      await connection.start();
      setConnectionStatus("✅ Connected");
    } catch (err) {
      console.error("Connection error:", err);
      setConnectionStatus("❌ Connection Failed");
    }
  };

  useEffect(() => {
    startConnection();

    return () => {
      connectionRef.current?.stop();
    };
  }, []);

  return (
    <div className="viewer-container">
      <h2 className="viewer-title">📢 Live Announcement Viewer</h2>
      <div className={`status-badge pulse ${connectionStatus.includes("❌") ? "fail" : "ok"}`}>
        {connectionStatus}
      </div>

      {connectionStatus.includes("❌") && (
        <button className="reconnect-btn fade-in" onClick={startConnection}>
          🔄 Reconnect
        </button>
      )}

      {announcement && Object.keys(announcement).length > 0 ? (
        <div className="announcement-card animate-card">
          <h3 className="announcement-title">🗓 Announcement #{announcement.id}</h3>
          <p className="fade-in"><strong>📣 Message:</strong> {announcement.message}</p>
          {announcement.messageBody && (
            <p className="fade-in"><strong>📝 Body:</strong> {announcement.messageBody}</p>
          )}
          <p className="fade-in"><strong>🕐 Effective:</strong> {announcement.messageEffectiveFrom} → {announcement.messageEffectiveTo}</p>

          {announcement.isDeployment && (
            <div className="section fade-in">
              <p><strong>🚀 Deployment:</strong></p>
              <ul>
                <li>Start: {announcement.deploymentStartTime}</li>
                <li>End: {announcement.deploymentEndTime}</li>
                <li>Status: {announcement.isDeploymentStarted ? "✅ Started" : "❌ Not Started"}</li>
                <li>Deployed: {announcement.isDeployed ? "✅ Yes" : "❌ No"}</li>
              </ul>
            </div>
          )}

          <div className="section fade-in">
            <p><strong>🔔 Reminder:</strong></p>
            <ul>
              <li>Duration: {announcement.timerDuration} min</li>
              <li>Send SMS: {announcement.sendSmsOnReminder ? "Yes" : "No"}</li>
              <li>Send Email: {announcement.sendMailOnReminder ? "Yes" : "No"}</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="no-announcement fade-in">
          📭 No announcement received yet.
        </div>
      )}
    </div>
  );
};

export default AnnouncementViewer;

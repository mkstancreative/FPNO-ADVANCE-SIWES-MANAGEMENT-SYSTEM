# Notifications System Integration Guide

This guide explains how to integrate the WebSocket-based notifications system into your CIMS application.

## System Overview

The notifications system consists of:

1. **WebSocket Service** - Real-time notification delivery
2. **API Service** - Fetch, mark as read, and delete notifications
3. **Context & Hook** - Global state management
4. **Popup Component** - Toast-style notifications (auto-dismissing)
5. **Notification Center** - Full notification list with pagination
6. **Notification Icon** - Header button with unread badge

## Installation Steps

### 1. Update `App.tsx`

Wrap your application with the `NotificationsProvider`:

```tsx
import { NotificationsProvider } from "./context";
import { NotificationPopupContainer } from "./components/ui/NotificationPopup";

function App() {
  return (
    <NotificationsProvider>
      {/* Your existing providers and routes */}
      <NotificationPopupContainer />
      {/* Rest of your app */}
    </NotificationsProvider>
  );
}
```

### 2. Add Notification Icon to TopBar/Header

Update your [src/components/layout/TopBar.tsx](src/components/layout/TopBar.tsx) to include the notification icon:

```tsx
import { NotificationIcon } from "../ui/NotificationCenter";

export const TopBar: React.FC = () => {
  return (
    <div className="topbar">
      {/* Your existing topbar content */}
      <div className="topbar-right">
        <NotificationIcon />
        {/* Other icons/components */}
      </div>
    </div>
  );
};
```

### 3. Create a Notifications Page (Optional)

You can create a dedicated notifications page:

```tsx
import { NotificationCenter } from "../components/ui/NotificationCenter";

export const NotificationsPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <NotificationCenter />
    </div>
  );
};
```

Then add to your routes:

```tsx
import { NotificationsPage } from "./pages/NotificationsPage";

// In your routes configuration
<Route path="/notifications" element={<NotificationsPage />} />;
```

## Usage in Components

### Using the `useNotifications` Hook

```tsx
import { useNotifications } from "../context/useNotifications";

export const MyComponent: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
  } = useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <p>Connected: {isConnected ? "Yes" : "No"}</p>

      <button onClick={() => handleMarkAllAsRead()}>Mark All as Read</button>

      {notifications.map((notif) => (
        <div key={notif._id}>
          <h4>{notif.title}</h4>
          <p>{notif.message}</p>
          <button onClick={() => handleMarkAsRead(notif._id)}>
            Mark as Read
          </button>
          <button onClick={() => handleDeleteNotification(notif._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Environment Configuration

### Add to your `.env` file:

```
VITE_WS_URL=ws://localhost:3000  # Your WebSocket server URL
```

### Update `vite.config.ts` if needed:

```ts
export default defineConfig({
  define: {
    "import.meta.env.VITE_WS_URL": JSON.stringify(process.env.VITE_WS_URL),
  },
});
```

## Backend WebSocket Implementation

Your backend needs to:

1. **Emit notifications** to connected clients when new notifications are created:

```javascript
// Example: Socket.io
io.to(userId).emit("notification", {
  _id: notificationId,
  title: "Notification Title",
  message: "Notification message",
  type: "info",
  isRead: false,
  createdAt: new Date().toISOString(),
});
```

2. **Implement these endpoints:**
   - `GET /notifications?page=1&limit=5` - Fetch paginated notifications
   - `PUT /notifications/:id/read` - Mark single as read
   - `PUT /notifications/read-all` - Mark all as read
   - `DELETE /notifications/:id` - Delete notification

## Notification Types

Supported types with their styling:

- `info` - Blue (ℹ icon)
- `success` - Green (✓ icon)
- `warning` - Amber (⚠ icon)
- `error` - Red (✕ icon)

## Features

### Popup Notifications

- Automatically displayed when new notifications arrive
- Auto-dismiss after 5 seconds
- Stack up to 5 popups
- Animated slide-in effect
- Manual close button

### Notification Center

- Paginated list (5 items per page)
- Mark individual as read
- Mark all as read
- Delete individual notifications
- Shows unread badge count
- Relative time display (e.g., "5m ago")
- WebSocket connection status indicator

### Auto-Reconnection

- Automatically reconnects on disconnect
- Maximum 5 reconnection attempts
- 3-second delay between attempts

## Styling

All components use Tailwind-compatible CSS. You can customize colors by editing:

- [src/components/ui/NotificationPopup/NotificationPopup.css](src/components/ui/NotificationPopup/NotificationPopup.css)
- [src/components/ui/NotificationCenter/NotificationCenter.css](src/components/ui/NotificationCenter/NotificationCenter.css)

## Troubleshooting

### WebSocket not connecting

1. Check that `VITE_WS_URL` is correctly set in your `.env`
2. Verify your backend WebSocket server is running
3. Check browser console for connection errors

### Notifications not updating

1. Ensure `NotificationsProvider` wraps your app
2. Verify auth token is stored in `localStorage` under `authToken` key
3. Check network tab for API calls

### Popups not showing

1. Ensure `NotificationPopupContainer` is rendered in your app root
2. Check that z-index CSS is not being overridden

## Context API Reference

### NotificationsContextType

```typescript
interface NotificationsContextType {
  notifications: Notification[]; // All fetched notifications
  unreadCount: number; // Count of unread notifications
  isLoading: boolean; // Loading state
  error: string | null; // Error message
  currentPage: number; // Current page number
  totalPages: number; // Total pages available
  isConnected: boolean; // WebSocket connection status
  popupNotifications: Notification[]; // Notifications in popup queue

  fetchNotifications: (page?: number) => Promise<void>;
  handleMarkAsRead: (id: string) => Promise<void>;
  handleMarkAllAsRead: () => Promise<void>;
  handleDeleteNotification: (id: string) => Promise<void>;
  dismissPopup: (id: string) => void;
}
```

## Next Steps

1. Update your `App.tsx` with the NotificationsProvider
2. Add NotificationIcon to your TopBar component
3. Configure `VITE_WS_URL` in your environment
4. Test the WebSocket connection
5. Verify notifications are received and displayed

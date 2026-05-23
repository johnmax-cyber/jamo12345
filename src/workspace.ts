// REST API Integration helpers for Google Workspace Services

// 1. Google Drive Integrations: Create an archive of Susan's Closet Catalog or Orders
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export async function uploadFileToDrive(
  accessToken: string,
  fileName: string,
  fileContent: string,
  mimeType: string = "text/plain"
): Promise<GoogleDriveFile> {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
  };

  // Construct a multipart body for raw upload + metadata
  const boundary = "XXXX_susans_company_boundary_XXXX";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    fileContent +
    closeDelimiter;

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: body,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Drive upload failed: ${response.statusText}. Details: ${errText}`);
  }

  return response.json();
}

// Fetch files from Google Drive
export async function listDriveBackupFiles(accessToken: string): Promise<any[]> {
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=name contains 'Susan_Company' or mimeType = 'text/plain'&orderBy=createdTime desc&pageSize=10",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to list Drive files: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
}

// 2. Gmail Integration: Send formal email receipts and alerts
// Utility to encode unicode strings into base64 safe for web/MIME
function base64UrlEncode(str: string): string {
  // Convert binary/unicode characters correctly
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = "";
  utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function sendGmailMessage(
  accessToken: string,
  toEmail: string,
  subject: string,
  htmlContent: string
): Promise<any> {
  const emailLines = [
    `To: ${toEmail}`,
    `Subject: =?utf-8?B?${base64UrlEncode(subject)}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    htmlContent,
  ];

  const emailRaw = emailLines.join("\r\n");
  const rawBase64 = base64UrlEncode(emailRaw);

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: rawBase64,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail API failed: ${response.statusText}. Details: ${errorText}`);
  }

  return response.json();
}

// 3. Google Calendar: Schedule appointments, fittings, and deliveries
export interface CalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEvent
): Promise<any> {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Calendar booking failed: ${response.statusText}. Details: ${errText}`);
  }

  return response.json();
}

export async function fetchCalendarEvents(accessToken: string): Promise<any[]> {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&maxResults=15",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to download Calendar schedules: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items || [];
}

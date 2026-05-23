// REST API Integration helpers for Google Workspace Services (Stubbed)

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export async function uploadFileToDrive(
  _accessToken: string,
  fileName: string,
  _fileContent: string,
  mimeType: string = "text/plain"
): Promise<GoogleDriveFile> {
  console.log("Mock upload to Google Drive");
  return {
    id: "mock-drive-id",
    name: fileName,
    mimeType: mimeType
  };
}

// Fetch files from Google Drive
export async function listDriveBackupFiles(_accessToken: string): Promise<any[]> {
  return [];
}

export async function sendGmailMessage(
  _accessToken: string,
  _toEmail: string,
  _subject: string,
  _htmlContent: string
): Promise<any> {
  console.log("Mock send Gmail message");
  return { status: "sent" };
}

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
  _accessToken: string,
  _event: CalendarEvent
): Promise<any> {
  console.log("Mock create Calendar event");
  return { id: "mock-calendar-id" };
}

export async function fetchCalendarEvents(_accessToken: string): Promise<any[]> {
  return [];
}

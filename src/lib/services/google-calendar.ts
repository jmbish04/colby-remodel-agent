

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

interface CalendarServiceOptions {
  clientEmail: string;
  privateKey: string;
  calendarId: string;
}

interface EventDetails {
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

export class GoogleCalendarService {
  private jwtClient: JWT;
  private calendarId: string;

  constructor(options: CalendarServiceOptions) {
    this.calendarId = options.calendarId;
    this.jwtClient = new google.auth.JWT(
      options.clientEmail,
      undefined,
      options.privateKey.replace(/\\n/g, '\n'), // Ensure newlines are correctly formatted
      ['https://www.googleapis.com/auth/calendar']
    );
  }

  private get calendar() {
    return google.calendar({ version: 'v3', auth: this.jwtClient });
  }

  async createEvent(eventDetails: EventDetails) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: eventDetails,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw new Error('Failed to create calendar event.');
    }
  }

  async updateEvent(eventId: string, eventDetails: Partial<EventDetails>) {
    try {
      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId: eventId,
        requestBody: eventDetails,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw new Error('Failed to update calendar event.');
    }
  }

  async deleteEvent(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw new Error('Failed to delete calendar event.');
    }
  }
}

// This function would be used in the API route to initialize the service
export const getCalendarService = (env: any) => {
  if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY || !env.GOOGLE_CALENDAR_ID) {
    throw new Error('Google Calendar environment variables are not set.');
  }
  return new GoogleCalendarService({
    clientEmail: env.GOOGLE_CLIENT_EMAIL,
    privateKey: env.GOOGLE_PRIVATE_KEY,
    calendarId: env.GOOGLE_CALENDAR_ID,
  });
};


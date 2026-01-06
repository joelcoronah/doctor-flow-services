import { DataSource } from 'typeorm';
import { Notification, NotificationType } from '../notifications/entities/notification.entity';

export async function seedNotifications(dataSource: DataSource): Promise<void> {
  const notificationRepository = dataSource.getRepository(Notification);

  const notifications = [
    {
      title: 'Appointment Reminder',
      message: 'You have an appointment scheduled for tomorrow at 9:00 AM. Please arrive 10 minutes early.',
      type: NotificationType.REMINDER,
      read: false,
    },
    {
      title: 'Appointment Confirmed',
      message: 'Your appointment on December 21, 2024 at 10:30 AM has been confirmed.',
      type: NotificationType.APPOINTMENT,
      read: false,
    },
    {
      title: 'Treatment Update',
      message: 'Your recent treatment has been completed successfully. Please schedule a follow-up in 2 weeks.',
      type: NotificationType.INFO,
      read: true,
    },
    {
      title: 'Important Alert',
      message: 'Your insurance claim has been processed. Please check your email for details.',
      type: NotificationType.ALERT,
      read: false,
    },
    {
      title: 'Appointment Cancelled',
      message: 'Your appointment scheduled for December 25, 2024 has been cancelled. Please reschedule at your convenience.',
      type: NotificationType.APPOINTMENT,
      read: false,
    },
    {
      title: 'Reminder: Follow-up Required',
      message: 'You have a follow-up appointment scheduled for January 15, 2025. Please confirm your attendance.',
      type: NotificationType.REMINDER,
      read: false,
    },
    {
      title: 'New Test Results Available',
      message: 'Your recent test results are now available. Please contact the office to review them.',
      type: NotificationType.INFO,
      read: false,
    },
    {
      title: 'Payment Reminder',
      message: 'Your account has an outstanding balance. Please contact billing to arrange payment.',
      type: NotificationType.ALERT,
      read: true,
    },
    {
      title: 'Holiday Hours',
      message: 'Our office will be closed on December 25-26 for the holidays. We will resume normal hours on December 27.',
      type: NotificationType.INFO,
      read: false,
    },
    {
      title: 'Appointment Rescheduled',
      message: 'Your appointment has been rescheduled to January 20, 2025 at 10:00 AM. Please confirm if this time works for you.',
      type: NotificationType.APPOINTMENT,
      read: false,
    },
  ];

  for (const notificationData of notifications) {
    const existingNotification = await notificationRepository.findOne({
      where: {
        title: notificationData.title,
        message: notificationData.message,
      },
    });

    if (!existingNotification) {
      const notification = notificationRepository.create(notificationData);
      await notificationRepository.save(notification);
      console.log(`✓ Seeded notification: ${notificationData.title}`);
    } else {
      console.log(`⊘ Notification already exists: ${notificationData.title}`);
    }
  }
}


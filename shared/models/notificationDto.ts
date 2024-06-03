import {NotificationsList} from './notificationsList';

export interface NotificationDto {
  total: number,
  totalRead: number,
  notifications: NotificationsList[]
}

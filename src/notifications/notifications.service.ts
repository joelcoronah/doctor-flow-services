import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Create a new notification (multi-tenant - filtered by doctorId)
   */
  async create(createNotificationDto: CreateNotificationDto, doctorId: string): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      doctorId, // Set the current doctor's ID
    });
    return await this.notificationRepository.save(notification);
  }

  /**
   * Find all notifications with filters (multi-tenant - filtered by doctorId)
   */
  async findAll(queryDto: QueryNotificationDto, doctorId: string) {
    const { read, type, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

    // Filter by doctor (multi-tenant)
    queryBuilder.where('notification.doctorId = :doctorId', { doctorId });

    if (read !== undefined) {
      queryBuilder.andWhere('notification.read = :read', { read });
    }

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('notification.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Find a notification by ID (multi-tenant - filtered by doctorId)
   */
  async findOne(id: string, doctorId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, doctorId }, // Ensure notification belongs to this doctor
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  /**
   * Mark notification as read (multi-tenant - filtered by doctorId)
   */
  async markAsRead(id: string, doctorId: string): Promise<Notification> {
    const notification = await this.findOne(id, doctorId); // Verify ownership
    notification.read = true;
    return await this.notificationRepository.save(notification);
  }

  /**
   * Mark all notifications as read (multi-tenant - filtered by doctorId)
   */
  async markAllAsRead(doctorId: string): Promise<{ count: number }> {
    const result = await this.notificationRepository.update(
      { doctorId, read: false }, // Only this doctor's unread notifications
      { read: true },
    );
    return { count: result.affected || 0 };
  }

  /**
   * Delete a notification (multi-tenant - filtered by doctorId)
   */
  async remove(id: string, doctorId: string): Promise<void> {
    const notification = await this.findOne(id, doctorId); // Verify ownership
    await this.notificationRepository.remove(notification);
  }
}

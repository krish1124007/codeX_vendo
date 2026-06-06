import { prisma } from "@/lib/db/prisma";
import type { NotificationType } from "@prisma/client";

export async function getUserNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function createNotification(data: {
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type || "INFO",
      title: data.title,
      message: data.message,
      read: false,
    },
  });
}

export async function createManyNotifications(data: {
  userIds: string[];
  type?: NotificationType;
  title: string;
  message: string;
}) {
  const notifications = data.userIds.map((userId) => ({
    userId,
    type: data.type || "INFO",
    title: data.title,
    message: data.message,
    read: false,
  }));

  return prisma.notification.createMany({
    data: notifications,
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  return prisma.notification.update({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

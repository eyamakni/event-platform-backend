import { Injectable } from "@nestjs/common"
import  { UsersService } from "../users/users.service"
import  { EventsService } from "../events/events.service"
import  { RegistrationsService } from "../registrations/registrations.service"

@Injectable()
export class DashboardService {
  constructor(
    private usersService: UsersService,
    private eventsService: EventsService,
    private registrationsService: RegistrationsService,
  ) {}

  async getAdminOverview() {
    const userStats = await this.usersService.getUserStats()
    const registrationStats = await this.registrationsService.getRegistrationStats()
    const allEvents = await this.eventsService.findAll()

    const activeEvents = allEvents.filter((event) => event.isActive).length
    const totalEvents = allEvents.length
    const upcomingEvents = allEvents.filter((event) => new Date(event.startDate) > new Date()).length

    const totalRevenue = allEvents
      .filter((event) => !event.isFree)
      .reduce((sum, event) => {
        const eventRegistrations = event.registrations?.length || 0
        return sum + eventRegistrations * (Number(event.price) || 0)
      }, 0)

    return {
      users: userStats,
      events: {
        total: totalEvents,
        active: activeEvents,
        upcoming: upcomingEvents,
        inactive: totalEvents - activeEvents,
      },
      registrations: registrationStats,
      revenue: {
        total: totalRevenue,
        currency: "USD",
      },
    }
  }

  async getRecentActivity() {
    const recentEvents = await this.eventsService.findAll()
    const recentRegistrations = await this.registrationsService.findAll()

    return {
      recentEvents: recentEvents.slice(0, 5).map((event) => ({
        id: event.id,
        title: event.title,
        type: event.type,
        startDate: event.startDate,
        registrationsCount: event.registrations?.length || 0,
        createdAt: event.createdAt,
      })),
      recentRegistrations: recentRegistrations.slice(0, 10).map((reg) => ({
        id: reg.id,
        userName: `${reg.user.firstName} ${reg.user.lastName}`,
        eventTitle: reg.event.title,
        status: reg.status,
        registeredAt: reg.registeredAt,
      })),
    }
  }

  async getEventAnalytics() {
    const allEvents = await this.eventsService.findAll()

    const eventsByType = allEvents.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const popularEvents = allEvents
      .map((event) => ({
        id: event.id,
        title: event.title,
        type: event.type,
        registrationsCount: event.registrations?.length || 0,
        maxParticipants: event.maxParticipants,
        fillRate: event.maxParticipants ? ((event.registrations?.length || 0) / event.maxParticipants) * 100 : null,
      }))
      .sort((a, b) => b.registrationsCount - a.registrationsCount)
      .slice(0, 10)

    return {
      eventsByType,
      popularEvents,
      totalRegistrations: allEvents.reduce((sum, event) => sum + (event.registrations?.length || 0), 0),
    }
  }

  async getUserAnalytics() {
    const users = await this.usersService.findAll()

    const usersByMonth = users.reduce(
      (acc, user) => {
        const month = new Date(user.createdAt).toISOString().slice(0, 7)
        acc[month] = (acc[month] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      usersByMonth,
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive).length,
    }
  }
}

import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { EventsService } from "../events/events.service";
import { RegistrationsService } from "../registrations/registrations.service";

@Injectable()
export class DashboardService {
  constructor(
    private usersService: UsersService,
    private eventsService: EventsService,
    private registrationsService: RegistrationsService
  ) {}

  /** === OVERVIEW PRINCIPAL === */
  async getAdminOverview() {
    const userStats = await this.usersService.getUserStats();
    const registrationStats = await this.registrationsService.getRegistrationStats();
    const allEvents = await this.eventsService.findAll();

    const activeEvents = allEvents.filter((event) => event.isActive).length;
    const totalEvents = allEvents.length;
    const upcomingEvents = allEvents.filter(
      (event) => new Date(event.startDate) > new Date()
    ).length;

    const totalRevenue = allEvents
      .filter((event) => !event.isFree)
      .reduce((sum, event) => {
        const eventRegistrations = event.registrations?.length || 0;
        return sum + eventRegistrations * (Number(event.price) || 0);
      }, 0);

    // 🔹 Données mensuelles correctes (format local)
    const monthlyUsers = await this.getMonthlyCountsFromUsers();
    const monthlyEvents = await this.getMonthlyCountsFromEvents();

    return {
      totalUsers: userStats.totalUsers,
      totalEvents,
      totalRegistrations: registrationStats.totalRegistrations,
      upcomingEvents,
      revenue: {
        total: totalRevenue,
        currency: "USD",
      },
      monthlyUsers,
      monthlyEvents,
    };
  }

  /** === ACTIVITÉS RÉCENTES === */
  async getRecentActivity() {
    const recentEvents = await this.eventsService.findAll();
    const recentRegistrations = await this.registrationsService.findAll();

    const eventActivities = recentEvents.slice(0, 5).map((event) => ({
      id: event.id,
      message: `New event created: ${event.title}`,
      type: "event",
      date: event.createdAt,
    }));

    const registrationActivities = recentRegistrations.slice(0, 5).map((reg) => ({
      id: reg.id,
      message: `${reg.user.firstName} ${reg.user.lastName} registered for ${reg.event.title}`,
      type: "registration",
      date: reg.registeredAt,
    }));

    const activities = [...eventActivities, ...registrationActivities].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { activities };
  }

  /** === ANALYTICS ÉVÉNEMENTS === */
  async getEventAnalytics() {
    const allEvents = await this.eventsService.findAll();

    const eventsByType = allEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularEvents = allEvents
      .map((event) => ({
        id: event.id,
        title: event.title,
        type: event.type,
        registrationsCount: event.registrations?.length || 0,
        maxParticipants: event.maxParticipants,
        fillRate: event.maxParticipants
          ? ((event.registrations?.length || 0) / event.maxParticipants) * 100
          : null,
      }))
      .sort((a, b) => b.registrationsCount - a.registrationsCount)
      .slice(0, 10);

    return {
      eventsByType,
      popularEvents,
      totalRegistrations: allEvents.reduce(
        (sum, event) => sum + (event.registrations?.length || 0),
        0
      ),
    };
  }

  /** === ANALYTICS UTILISATEURS === */
  async getUserAnalytics() {
    const users = await this.usersService.findAll();

    const usersByMonth = users.reduce((acc, user) => {
      const key = this.formatMonthKey(new Date(user.createdAt));
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      usersByMonth,
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive).length,
    };
  }

  /** === DÉRIVÉS POUR LA COURBE === */
  private async getMonthlyCountsFromUsers(): Promise<number[]> {
    const userAnalytics = await this.getUserAnalytics();
    const months = this.generateMonths();
    return months.map((m) => userAnalytics.usersByMonth[m] || 0);
  }

  private async getMonthlyCountsFromEvents(): Promise<number[]> {
    const allEvents = await this.eventsService.findAll();
    const months = this.generateMonths();

    const countsByMonth = allEvents.reduce((acc, event) => {
      const key = this.formatMonthKey(new Date(event.createdAt));
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return months.map((m) => countsByMonth[m] || 0);
  }

  /** 🔹 Génère les 12 derniers mois pour le graphique (format local, pas UTC) */
  private generateMonths(): string[] {
    const now = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(this.formatMonthKey(d));
    }
    return months;
  }

  /** 🔹 Formate une date sous forme YYYY-MM (locale) */
  private formatMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
}

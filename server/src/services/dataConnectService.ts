import { getDataConnectClient } from './dataConnectClient.js';

export class DataConnectService {
  async getUserById(id: string) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($id: String!) {
        user(where: { id: $id }) { id email name role isEmailVerified createdAt updatedAt }
      }
    `;
    const res = await client.request(query, { id });
    return (res as any)?.user ?? null;
  }

  async getUserByEmail(email: string) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($email: String!) {
        users(where: { email: { equals: $email } }, take: 1) { id email name role isEmailVerified createdAt updatedAt }
      }
    `;
    const res = await client.request(query, { email });
    const users = (res as any)?.users ?? [];
    return users[0] ?? null;
  }

  async createUser(data: { email: string; name?: string; role?: string; isEmailVerified?: boolean }) {
    const client = await getDataConnectClient();
    const mutation = /* GraphQL */ `
      mutation ($data: UserCreateInput!) {
        createOneUser(data: $data) { id email name role isEmailVerified createdAt updatedAt }
      }
    `;
    const payload = { data: { email: data.email, name: data.name, role: (data.role ?? 'USER'), isEmailVerified: data.isEmailVerified ?? false } };
    const res = await client.request(mutation, payload);
    return (res as any)?.createOneUser;
  }

  // Subscriptions
  async getSubscriptionById(id: string) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($id: String!) {
        subscription(where: { id: $id }) {
          id userId tier status stripeSubscriptionId stripeCustomerId stripePriceId seats pricePerSeat
          currentPeriodStart currentPeriodEnd cancelledAt cancelAtPeriodEnd trialStart trialEnd createdAt updatedAt
        }
      }
    `;
    const res = await client.request(query, { id });
    return (res as any)?.subscription ?? null;
  }

  async getSubscriptionsByUserId(userId: string) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($userId: String!) {
        subscriptions(where: { userId: { equals: $userId } }) {
          id userId tier status stripeSubscriptionId stripeCustomerId stripePriceId seats pricePerSeat
          currentPeriodStart currentPeriodEnd cancelledAt cancelAtPeriodEnd trialStart trialEnd createdAt updatedAt
        }
      }
    `;
    const res = await client.request(query, { userId });
    return (res as any)?.subscriptions ?? [];
  }

  async createSubscription(data: any) {
    const client = await getDataConnectClient();
    const mutation = /* GraphQL */ `
      mutation ($data: SubscriptionCreateInput!) {
        createOneSubscription(data: $data) { id userId tier status seats pricePerSeat currentPeriodEnd }
      }
    `;
    const res = await client.request(mutation, { data });
    return (res as any)?.createOneSubscription;
  }

  async updateSubscription(id: string, updates: any) {
    const client = await getDataConnectClient();
    const mutation = /* GraphQL */ `
      mutation ($id: String!, $data: SubscriptionUpdateInput!) {
        updateOneSubscription(where: { id: $id }, data: $data) { id }
      }
    `;
    await client.request(mutation, { id, data: updates });
  }

  async deleteSubscription(id: string) {
    const client = await getDataConnectClient();
    const mutation = /* GraphQL */ `
      mutation ($id: String!) { deleteOneSubscription(where: { id: $id }) { id } }
    `;
    await client.request(mutation, { id });
  }

  // Licenses
  async getLicenseById(id: string) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($id: String!) { license(where: { id: $id }) { id key userId subscriptionId status tier activatedAt expiresAt deviceInfo ipAddress activationCount maxActivations features createdAt updatedAt } }
    `;
    const res = await client.request(query, { id });
    return (res as any)?.license ?? null;
  }

  async getLicenseByKey(key: string) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($key: String!) { licenses(where: { key: { equals: $key } }, take: 1) { id key userId subscriptionId status tier activatedAt expiresAt deviceInfo ipAddress activationCount maxActivations features createdAt updatedAt } }
    `;
    const res = await client.request(query, { key });
    return (res as any)?.licenses?.[0] ?? null;
  }

  async getLicensesByUserId(userId: string) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($userId: String!) { licenses(where: { userId: { equals: $userId } }) { id key userId subscriptionId status tier activatedAt expiresAt deviceInfo ipAddress activationCount maxActivations features createdAt updatedAt } }
    `;
    const res = await client.request(query, { userId });
    return (res as any)?.licenses ?? [];
  }

  async getLicensesBySubscriptionId(subscriptionId: string) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($subscriptionId: String!) { licenses(where: { subscriptionId: { equals: $subscriptionId } }) { id key userId subscriptionId status tier activatedAt expiresAt deviceInfo activationCount maxActivations features createdAt updatedAt } }
    `;
    const res = await client.request(query, { subscriptionId });
    return (res as any)?.licenses ?? [];
  }

  async updateLicense(id: string, updates: any) {
    const client = await getDataConnectClient();
    const mutation = /* GraphQL */ `
      mutation ($id: String!, $data: LicenseUpdateInput!) { updateOneLicense(where: { id: $id }, data: $data) { id } }
    `;
    await client.request(mutation, { id, data: updates });
  }

  async deleteLicense(id: string) {
    const client = await getDataConnectClient();
    const mutation = /* GraphQL */ `
      mutation ($id: String!) { deleteOneLicense(where: { id: $id }) { id } }
    `;
    await client.request(mutation, { id });
  }

  // Payments
  async createPayment(data: any) {
    const client = await getDataConnectClient();
    const mutation = /* GraphQL */ `
      mutation ($data: PaymentCreateInput!) { createOnePayment(data: $data) { id } }
    `;
    const res = await client.request(mutation, { data });
    return (res as any)?.createOnePayment;
  }

  async getPaymentsBySubscriptionId(subscriptionId: string) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($subscriptionId: String!) { payments(where: { subscriptionId: { equals: $subscriptionId } }) { id userId subscriptionId amount currency status description receiptUrl taxAmount createdAt } }
    `;
    const res = await client.request(query, { subscriptionId });
    return (res as any)?.payments ?? [];
  }

  async getPaymentsPageBySubscriptionId(subscriptionId: string, page: number, limit: number) {
    const all = await this.getPaymentsBySubscriptionId(subscriptionId);
    const total = all.length;
    const start = (page - 1) * limit;
    const payments = all.slice(start, start + limit);
    return { payments, total };
  }

  async getPaymentById(id: string) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($id: String!) { payment(where: { id: $id }) { id userId subscriptionId amount currency status description receiptUrl stripeInvoiceId stripePaymentIntentId createdAt } }
    `;
    const res = await client.request(query, { id });
    return (res as any)?.payment ?? null;
  }

  async updatePayment(id: string, updates: any) {
    const client = await getDataConnectClient();
    const mutation = /* GraphQL */ `
      mutation ($id: String!, $data: PaymentUpdateInput!) { updateOnePayment(where: { id: $id }, data: $data) { id } }
    `;
    await client.request(mutation, { id, data: updates });
  }

  // Analytics
  async getUsageAnalyticsByLicense(licenseId: string, since?: Date) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($licenseId: String!, $since: DateTime) {
        usageAnalytics(
          where: { licenseId: { equals: $licenseId }, ...( $since ? { timestamp: { gte: $since } } : {} ) }
        ) { id userId licenseId event metadata ipAddress userAgent timestamp }
      }
    ` as any; // Inline conditional not supported; kept for type compatibility. We'll filter client-side.
    const res = await client.request(query, { licenseId });
    const all = (res as any)?.usageAnalytics ?? [];
    if (!since) return all;
    return all.filter((r: any) => new Date(r.timestamp).getTime() >= since.getTime());
  }

  async getUsageAnalyticsByUser(userId: string) {
    const client = await getDataConnectClient();
    const query = /* GraphQL */ `
      query ($userId: String!) { usageAnalytics(where: { userId: { equals: $userId } }, orderBy: { timestamp: desc }) { id userId licenseId event metadata ipAddress userAgent timestamp } }
    `;
    const res = await client.request(query, { userId });
    return (res as any)?.usageAnalytics ?? [];
  }

  // Broad scans used in admin/debug
  async getAllUsers() {
    const client = await getDataConnectClient();
    const res = await client.request(/* GraphQL */ `query { users { id email role createdAt } }`);
    return (res as any)?.users ?? [];
  }
  async getAllSubscriptions() {
    const client = await getDataConnectClient();
    const res = await client.request(/* GraphQL */ `query { subscriptions { id userId tier status seats pricePerSeat createdAt } }`);
    return (res as any)?.subscriptions ?? [];
  }
  async getAllPayments() {
    const client = await getDataConnectClient();
    const res = await client.request(/* GraphQL */ `query { payments { id userId subscriptionId amount currency status createdAt stripeInvoiceId } }`);
    return (res as any)?.payments ?? [];
  }
  async getAllLicenses() {
    const client = await getDataConnectClient();
    const res = await client.request(/* GraphQL */ `query { licenses { id key userId subscriptionId status tier createdAt } }`);
    return (res as any)?.licenses ?? [];
  }

  // Health
  async ping(): Promise<{ ok: boolean; error?: string }> {
    try {
      // Minimal query to validate connectivity
      await this.getAllUsers();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Unknown Data Connect error' };
    }
  }
}

export const dataConnectService = new DataConnectService();



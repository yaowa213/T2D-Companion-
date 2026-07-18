
import { store } from './store';
import { logger } from './logger';

export interface AuditEvent {
  eventName: string;
  occurredAtISO: string;
  [key: string]: any;
}

/**
 * Writes an audit event to local storage for compliance records.
 */
export const auditLocal = async (eventName: string, data: Record<string, any>) => {
  // Fix: occurredAtISO must use a Date object to call toISOString(). 
  // Removed incorrect usage of new Error().toISOString().
  const event: AuditEvent = {
    eventName,
    occurredAtISO: new Date().toISOString(),
    ...data
  };

  try {
    const existingAudits = await store.get<AuditEvent[]>('local_audits') || [];
    existingAudits.push(event);
    await store.set('local_audits', existingAudits);
    logger.info(`Audit logged: ${eventName}`);
  } catch (err) {
    logger.error(`Failed to write audit event: ${eventName}`, err);
  }
};

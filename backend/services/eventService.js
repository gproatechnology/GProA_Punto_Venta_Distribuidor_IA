/**
 * GProA - Event Service
 * backend/services/eventService.js
 */

const Event = require('../models/Event');
const logger = require('../utils/logger');

class EventService {
    // Registrar evento
    async log(tenantId, data) {
        const event = await Event.log({
            tenantId,
            ...data
        });
        
        logger.audit(
            data.action,
            data.entity,
            data.entityId,
            data.user,
            data.details
        );
        
        return event;
    }

    // Obtener eventos por entidad
    async getByEntity(tenantId, entity, entityId) {
        return Event.findByEntity(entity, entityId, tenantId);
    }

    // Obtener eventos recientes
    async getRecent(tenantId, limit = 50) {
        return Event.findRecent(tenantId, limit);
    }

    // Obtener eventos por usuario
    async getByUser(tenantId, userId, limit = 50) {
        return Event.find({ tenantId, user: userId })
            .sort({ timestamp: -1 })
            .limit(limit);
    }

    // Obtener eventos por período
    async getByPeriod(tenantId, startDate, endDate) {
        return Event.find({ tenantId })
            .where('timestamp').gte(startDate).lte(endDate)
            .sort({ timestamp: -1 });
    }

    // Actividad por día
    async getActivityByDay(tenantId, date) {
        return Event.getActivityByDay(date);
    }

    // Obtener auditoría
    async getAuditTrail(tenantId, entity, entityId) {
        return Event.find({ tenantId, entity, entityId })
            .populate('user', 'firstName lastName email')
            .sort({ timestamp: -1 });
    }
}

module.exports = new EventService();
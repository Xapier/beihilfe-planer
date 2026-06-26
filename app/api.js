/**
 * Beihilfe-Planer API-Client
 * Ersetzt localStorage durch REST-API Aufrufe
 */

// API-Basis-URL: Im Browser-Kontext zeigt /api/ auf nginx-Proxy → Backend
const API_BASE = '/api';

/**
 * Hilfsfunktion für HTTP-Anfragen
 */
async function request(method, path, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${path}`, options);

    if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
            const err = await response.json();
            errorMsg = err.error || err.message || errorMsg;
            if (err.details) {
                errorMsg += '\n\n' + err.details;
            }
        } catch (_) {}
        throw new Error(errorMsg);
    }

    if (response.status === 204) return null;
    return response.json();
}

// =========================================================================
// PATIENTEN
// =========================================================================

const API = {

    patients: {
        getAll: () => request('GET', '/patients'),
        getById: (id) => request('GET', `/patients/${id}`),
        create: (data) => request('POST', '/patients', data),
        update: (id, data) => request('PUT', `/patients/${id}`, data),
        delete: (id) => request('DELETE', `/patients/${id}`),
        hasAufwendungen: (id) => request('GET', `/patients/${id}/aufwendungen-count`)
    },

    // =========================================================================
    // KONTAKTE
    // =========================================================================

    contacts: {
        getAll: () => request('GET', '/contacts'),
        getById: (id) => request('GET', `/contacts/${id}`),
        create: (data) => request('POST', '/contacts', data),
        update: (id, data) => request('PUT', `/contacts/${id}`, data),
        delete: (id) => request('DELETE', `/contacts/${id}`)
    },

    // =========================================================================
    // AUFWENDUNGEN
    // =========================================================================

    aufwendungen: {
        getAll: () => request('GET', '/aufwendungen'),
        getById: (id) => request('GET', `/aufwendungen/${id}`),
        getByPatient: (patientId) => request('GET', `/aufwendungen/patient/${patientId}`),
        create: (data) => request('POST', '/aufwendungen', data),
        update: (id, data) => request('PUT', `/aufwendungen/${id}`, data),
        delete: (id) => request('DELETE', `/aufwendungen/${id}`)
    }
};

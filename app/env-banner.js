/**
 * Beihilfe-Planer – DEV-Umgebungs-Banner
 *
 * Fragt /api/health ab und blendet bei NODE_ENV=development einen roten
 * Hinweis im Kopfbereich ein. In Production (oder bei Fehler) wird nichts
 * angezeigt.
 */
(function () {
    'use strict';

    function injectBanner() {
        // Doppelte Einbindung verhindern
        if (document.getElementById('dev-env-banner')) return;

        const style = document.createElement('style');
        style.textContent = `
            #dev-env-banner {
                position: sticky;
                top: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                background: #c0392b;
                color: #fff;
                text-align: center;
                font-weight: 700;
                font-size: 14px;
                letter-spacing: 0.5px;
                padding: 8px 16px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
        `;
        document.head.appendChild(style);

        const banner = document.createElement('div');
        banner.id = 'dev-env-banner';
        banner.textContent = '⚠️ DEV-Umgebung – Testdaten, nicht für den produktiven Einsatz';
        document.body.insertBefore(banner, document.body.firstChild);
    }

    async function checkEnvironment() {
        try {
            const response = await fetch('/api/health');
            if (!response.ok) return;
            const data = await response.json();
            if (data && data.environment === 'development') {
                injectBanner();
            }
        } catch (_) {
            // Bei Netzwerkfehlern kein Banner anzeigen
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkEnvironment);
    } else {
        checkEnvironment();
    }
})();

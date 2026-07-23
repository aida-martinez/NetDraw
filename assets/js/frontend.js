(function() {
    'use strict';

    // Helper function for translations
    function __(key, defaultVal) {
        if (window.netdrawFrontData && window.netdrawFrontData.strings && window.netdrawFrontData.strings[key]) {
            return window.netdrawFrontData.strings[key];
        }
        return defaultVal;
    }

    // Global renderer function called with a container element and bracketData
    window.netdrawRenderInstance = function(container, bracketData) {
        if (!container) return;

        // Clear loading indicator
        container.innerHTML = '';

        if (!bracketData || !bracketData.matches || Object.keys(bracketData.matches).length === 0) {
            container.innerHTML = '<div class="netdraw-error">' + escapeHtml(__('no_data', 'No bracket data available.')) + '</div>';
            return;
        }

        const size = parseInt(bracketData.size, 10);
        const totalRounds = Math.log2(size);

        // Header for Tournament Info
        const header = document.createElement('div');
        header.className = 'netdraw-frontend-header';
        header.innerHTML = `
            <div class="netdraw-bracket-meta">
                <span class="netdraw-badge">${escapeHtml(__('knockout_draw', '%d Player Knockout Draw').replace('%d', size))}</span>
            </div>
        `;
        container.appendChild(header);

        // Scroll wrapper for mobile / large brackets
        const scrollWrapper = document.createElement('div');
        scrollWrapper.className = 'netdraw-scroll-wrapper';
        
        const bracketTree = document.createElement('div');
        bracketTree.className = 'netdraw-bracket-tree';

        // Start recursive tree rendering from the Finals (root node)
        // Finals is round = totalRounds, matchNum = 1
        const rootNode = buildTreeNode(totalRounds, 1, totalRounds, bracketData.matches);
        bracketTree.appendChild(rootNode);
        
        scrollWrapper.appendChild(bracketTree);
        container.appendChild(scrollWrapper);

        // Add interactive hover effects for player path highlighting
        addPathHighlighting(container);
    };

    /**
     * Recursively builds tree nodes (Finals down to Round 1)
     */
    function buildTreeNode(round, matchNum, totalRounds, matches) {
        const matchId = `r${round}_m${matchNum}`;
        const match = matches[matchId] || { p1: '', p2: '', score: '', winner: '' };

        const node = document.createElement('div');
        node.className = 'netdraw-node';

        const matchCard = document.createElement('div');
        matchCard.className = `netdraw-card ${match.winner ? 'has-winner' : ''}`;
        
        // Clean player names
        const p1Name = match.p1 ? escapeHtml(match.p1) : '';
        const p2Name = match.p2 ? escapeHtml(match.p2) : '';

        const p1Class = match.winner === 'p1' ? 'is-winner' : (match.winner ? 'is-loser' : '');
        const p2Class = match.winner === 'p2' ? 'is-winner' : (match.winner ? 'is-loser' : '');

        const p1Tbd = !p1Name ? 'is-tbd' : '';
        const p2Tbd = !p2Name ? 'is-tbd' : '';

        // Player 1 DOM
        const p1Html = `
            <div class="netdraw-player p1-slot ${p1Class} ${p1Tbd}" data-player-name="${p1Name}">
                <span class="netdraw-pname">${p1Name || escapeHtml(__('tbd', 'TBD'))}</span>
            </div>
        `;

        // Player 2 DOM
        const p2Html = `
            <div class="netdraw-player p2-slot ${p2Class} ${p2Tbd}" data-player-name="${p2Name}">
                <span class="netdraw-pname">${p2Name || escapeHtml(__('tbd', 'TBD'))}</span>
            </div>
        `;

        // Match Score DOM
        const scoreHtml = match.score 
            ? `<div class="netdraw-score-row" title="${escapeHtml(__('match_score', 'Match Score'))}">${escapeHtml(match.score)}</div>` 
            : '';

        // Match Datetime DOM
        const datetimeHtml = match.datetime 
            ? `<div class="netdraw-datetime-row" title="${escapeHtml(__('match_datetime', 'Match Date & Time'))}">${escapeHtml(match.datetime)}</div>` 
            : '';

        matchCard.innerHTML = `
            ${datetimeHtml}
            <div class="netdraw-players-container">
                ${p1Html}
                <div class="netdraw-divider"></div>
                ${p2Html}
            </div>
            ${scoreHtml}
        `;

        node.appendChild(matchCard);

        // If not Round 1, create children container and recurse
        if (round > 1) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'netdraw-children';

            // Top feeder: previous round, match odd (2 * m - 1)
            const topChild = buildTreeNode(round - 1, 2 * matchNum - 1, totalRounds, matches);
            // Bottom feeder: previous round, match even (2 * m)
            const bottomChild = buildTreeNode(round - 1, 2 * matchNum, totalRounds, matches);

            childrenContainer.appendChild(topChild);
            childrenContainer.appendChild(bottomChild);
            node.appendChild(childrenContainer);
        }

        return node;
    }

    /**
     * Interactivity: Path Highlighting
     */
    function addPathHighlighting(container) {
        container.addEventListener('mouseover', function(e) {
            const playerSlot = e.target.closest('.netdraw-player');
            if (!playerSlot) return;

            const playerName = playerSlot.getAttribute('data-player-name');
            if (!playerName || playerName === 'TBD') return;

            const allSlots = container.querySelectorAll(`.netdraw-player[data-player-name="${CSS.escape(playerName)}"]`);
            allSlots.forEach(slot => {
                slot.classList.add('highlight-path');
                slot.closest('.netdraw-card').classList.add('highlight-card');
            });
        });

        container.addEventListener('mouseout', function(e) {
            const playerSlot = e.target.closest('.netdraw-player');
            if (!playerSlot) return;

            const playerName = playerSlot.getAttribute('data-player-name');
            if (!playerName || playerName === 'TBD') return;

            const allSlots = container.querySelectorAll('.netdraw-player.highlight-path');
            allSlots.forEach(slot => {
                slot.classList.remove('highlight-path');
                slot.closest('.netdraw-card').classList.remove('highlight-card');
            });
        });
    }

    /**
     * Simple HTML Escaping utility
     */
    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Auto-bootstrap any bracket containers present in the DOM
    function bootstrap() {
        const containers = document.querySelectorAll('.netdraw-bracket-container');
        containers.forEach(container => {
            const rawData = container.getAttribute('data-bracket');
            if (rawData) {
                try {
                    const bracketData = JSON.parse(rawData);
                    window.netdrawRenderInstance(container, bracketData);
                } catch (e) {
                    console.error("NetDraw parsing error:", e);
                    container.innerHTML = '<div class="netdraw-error">' + escapeHtml(__('error_parsing', 'Error parsing bracket data.')) + '</div>';
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();

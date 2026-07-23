document.addEventListener('DOMContentLoaded', function() {
    const sizeSelect = document.getElementById('netdraw_bracket_size');
    const dataInput = document.getElementById('netdraw_bracket_data_input');
    const gridContainer = document.getElementById('netdraw_admin_grid_container');

    if (!sizeSelect || !dataInput || !gridContainer) {
        return;
    }

    // Helper function for translations
    function __(key, defaultVal) {
        if (typeof netdrawAdminData !== 'undefined' && netdrawAdminData.strings && netdrawAdminData.strings[key]) {
            return netdrawAdminData.strings[key];
        }
        return defaultVal;
    }

    // Load initial data
    let bracketData = { size: 8, matches: {} };
    if (typeof netdrawAdminData !== 'undefined' && netdrawAdminData.bracketData) {
        bracketData = netdrawAdminData.bracketData;
        if (!bracketData.matches) {
            bracketData.matches = {};
        }
    }

    // Initialize/sync matches based on selected size
    function syncBracketData(size) {
        bracketData.size = parseInt(size, 10);
        const rounds = Math.log2(bracketData.size);
        const newMatches = {};

        for (let r = 1; r <= rounds; r++) {
            const matchCount = bracketData.size / Math.pow(2, r);
            for (let m = 1; m <= matchCount; m++) {
                const matchId = `r${r}_m${m}`;
                if (bracketData.matches[matchId]) {
                    newMatches[matchId] = bracketData.matches[matchId];
                } else {
                    newMatches[matchId] = { p1: '', p2: '', score: '', winner: '', datetime: '' };
                }
            }
        }
        bracketData.matches = newMatches;
        propagateWinners();
    }

    // Propagate winners from round to round
    function propagateWinners() {
        const rounds = Math.log2(bracketData.size);
        
        // Clear all subsequent rounds' player names first, we will rebuild them
        for (let r = 2; r <= rounds; r++) {
            const matchCount = bracketData.size / Math.pow(2, r);
            for (let m = 1; m <= matchCount; m++) {
                const matchId = `r${r}_m${m}`;
                bracketData.matches[matchId].p1 = '';
                bracketData.matches[matchId].p2 = '';
            }
        }

        // Forward propagation loop
        for (let r = 1; r < rounds; r++) {
            const matchCount = bracketData.size / Math.pow(2, r);
            for (let m = 1; m <= matchCount; m++) {
                const matchId = `r${r}_m${m}`;
                const match = bracketData.matches[matchId];
                
                let winnerName = '';
                if (match.winner === 'p1') {
                    winnerName = match.p1;
                } else if (match.winner === 'p2') {
                    winnerName = match.p2;
                }

                if (winnerName) {
                    const nextRound = r + 1;
                    const nextMatch = Math.ceil(m / 2);
                    const nextMatchId = `r${nextRound}_m${nextMatch}`;
                    const slot = (m % 2 !== 0) ? 'p1' : 'p2';

                    if (bracketData.matches[nextMatchId]) {
                        bracketData.matches[nextMatchId][slot] = winnerName;
                    }
                }
            }
        }

        // Clean up invalid winners (e.g. if winner is set but the name became empty)
        for (let matchId in bracketData.matches) {
            const match = bracketData.matches[matchId];
            if (match.winner === 'p1' && !match.p1) {
                match.winner = '';
            } else if (match.winner === 'p2' && !match.p2) {
                match.winner = '';
            }
        }

        updateHiddenInput();
    }

    function updateHiddenInput() {
        dataInput.value = JSON.stringify(bracketData);
    }

    // Get round display name
    function getRoundName(r, totalRounds) {
        if (r === totalRounds) {
            return __('finals', 'Finals');
        } else if (r === totalRounds - 1) {
            return __('semifinals', 'Semifinals');
        } else if (r === totalRounds - 2) {
            return __('quarterfinals', 'Quarterfinals');
        }
        return __('round_n', 'Round %d').replace('%d', r);
    }

    // Render the grid editor UI
    function renderEditor() {
        gridContainer.innerHTML = '';
        const rounds = Math.log2(bracketData.size);

        for (let r = 1; r <= rounds; r++) {
            const roundCol = document.createElement('div');
            roundCol.className = 'netdraw-admin-round-col';
            
            const roundHeader = document.createElement('div');
            roundHeader.className = 'netdraw-admin-round-header';
            roundHeader.innerHTML = `<h3>${getRoundName(r, rounds)}</h3><span class="netdraw-round-info">${__('round_n', 'Round %d').replace('%d', r)}</span>`;
            roundCol.appendChild(roundHeader);

            const matchesList = document.createElement('div');
            matchesList.className = 'netdraw-admin-matches-list';

            const matchCount = bracketData.size / Math.pow(2, r);
            for (let m = 1; m <= matchCount; m++) {
                const matchId = `r${r}_m${m}`;
                const match = bracketData.matches[matchId];

                const matchBox = document.createElement('div');
                matchBox.className = `netdraw-admin-match-box ${match.winner ? 'has-winner' : ''}`;
                matchBox.dataset.matchId = matchId;

                const matchTitle = document.createElement('div');
                matchTitle.className = 'netdraw-admin-match-title';
                matchTitle.innerText = __('match_n', 'Match %d').replace('%d', m);
                matchBox.appendChild(matchTitle);

                // Player 1 Row
                const p1Row = document.createElement('div');
                p1Row.className = `netdraw-admin-player-row ${match.winner === 'p1' ? 'is-winner' : ''}`;
                
                const p1Input = document.createElement('input');
                p1Input.type = 'text';
                p1Input.value = match.p1 || '';
                p1Input.placeholder = r === 1 ? __('player_n', 'Player %d').replace('%d', 1) : __('tbd', 'TBD');
                if (r > 1) {
                    p1Input.readOnly = true;
                    p1Input.className = 'netdraw-readonly-input';
                } else {
                    p1Input.addEventListener('input', function(e) {
                        bracketData.matches[matchId].p1 = e.target.value;
                        propagateWinners();
                        // Update downstream matches dynamically without full re-render
                        updateDownstreamNames();
                    });
                }
                p1Row.appendChild(p1Input);

                const p1WinBtn = document.createElement('button');
                p1WinBtn.type = 'button';
                p1WinBtn.className = `netdraw-win-btn ${match.winner === 'p1' ? 'active' : ''}`;
                p1WinBtn.innerHTML = '&#10004;'; // Checkmark
                p1WinBtn.title = __('mark_winner_n', 'Mark Player %d as Winner').replace('%d', 1);
                p1WinBtn.addEventListener('click', function() {
                    toggleWinner(matchId, 'p1');
                });
                p1Row.appendChild(p1WinBtn);
                matchBox.appendChild(p1Row);

                // Player 2 Row
                const p2Row = document.createElement('div');
                p2Row.className = `netdraw-admin-player-row ${match.winner === 'p2' ? 'is-winner' : ''}`;

                const p2Input = document.createElement('input');
                p2Input.type = 'text';
                p2Input.value = match.p2 || '';
                p2Input.placeholder = r === 1 ? __('player_n', 'Player %d').replace('%d', 2) : __('tbd', 'TBD');
                if (r > 1) {
                    p2Input.readOnly = true;
                    p2Input.className = 'netdraw-readonly-input';
                } else {
                    p2Input.addEventListener('input', function(e) {
                        bracketData.matches[matchId].p2 = e.target.value;
                        propagateWinners();
                        updateDownstreamNames();
                    });
                }
                p2Row.appendChild(p2Input);

                const p2WinBtn = document.createElement('button');
                p2WinBtn.type = 'button';
                p2WinBtn.className = `netdraw-win-btn ${match.winner === 'p2' ? 'active' : ''}`;
                p2WinBtn.innerHTML = '&#10004;';
                p2WinBtn.title = __('mark_winner_n', 'Mark Player %d as Winner').replace('%d', 2);
                p2WinBtn.addEventListener('click', function() {
                    toggleWinner(matchId, 'p2');
                });
                p2Row.appendChild(p2WinBtn);
                matchBox.appendChild(p2Row);

                // Score Row
                const scoreRow = document.createElement('div');
                scoreRow.className = 'netdraw-admin-score-row';
                
                const scoreInput = document.createElement('input');
                scoreInput.type = 'text';
                scoreInput.value = match.score || '';
                scoreInput.placeholder = __('score_placeholder', 'Score (e.g. 6-4 6-2)');
                scoreInput.className = 'netdraw-score-input';
                scoreInput.addEventListener('input', function(e) {
                    bracketData.matches[matchId].score = e.target.value;
                    updateHiddenInput();
                });
                
                scoreRow.appendChild(scoreInput);
                matchBox.appendChild(scoreRow);

                // Datetime Row
                const dtRow = document.createElement('div');
                dtRow.className = 'netdraw-admin-datetime-row';
                
                const dtInput = document.createElement('input');
                dtInput.type = 'text';
                dtInput.value = match.datetime || '';
                dtInput.placeholder = __('datetime_placeholder', 'Date & Time (e.g. Sat 10:00 AM)');
                dtInput.className = 'netdraw-datetime-input';
                dtInput.addEventListener('input', function(e) {
                    bracketData.matches[matchId].datetime = e.target.value;
                    updateHiddenInput();
                });
                
                dtRow.appendChild(dtInput);
                matchBox.appendChild(dtRow);

                matchesList.appendChild(matchBox);
            }
            roundCol.appendChild(matchesList);
            gridContainer.appendChild(roundCol);
        }
    }

    // Toggle winner setting
    function toggleWinner(matchId, playerSlot) {
        const match = bracketData.matches[matchId];
        
        // Check if player slot has a name populated
        const playerName = playerSlot === 'p1' ? match.p1 : match.p2;
        if (!playerName) {
            alert(__('cannot_set_winner', 'Cannot set winner for an empty player slot.'));
            return;
        }

        if (match.winner === playerSlot) {
            match.winner = ''; // Deselect
        } else {
            match.winner = playerSlot;
        }

        propagateWinners();
        renderEditor(); // Full re-render to update classes and read-only names correctly
    }

    // Fast helper to update read-only names in the DOM without complete reconstruction on keystrokes
    function updateDownstreamNames() {
        for (let matchId in bracketData.matches) {
            const match = bracketData.matches[matchId];
            const matchBox = document.querySelector(`[data-match-id="${matchId}"]`);
            if (matchBox) {
                const inputs = matchBox.querySelectorAll('input');
                if (inputs.length >= 2) {
                    if (inputs[0].readOnly) {
                        inputs[0].value = match.p1 || '';
                    }
                    if (inputs[1].readOnly) {
                        inputs[1].value = match.p2 || '';
                    }
                }
            }
        }
    }

    // Handle size change
    sizeSelect.addEventListener('change', function(e) {
        if (confirm(__('confirm_size_change', 'Changing the tournament size will reset progression matches that fall out of the new boundaries. Do you want to proceed?'))) {
            syncBracketData(e.target.value);
            renderEditor();
        } else {
            // Revert dropdown value
            sizeSelect.value = bracketData.size.toString();
        }
    });

    // PDF/Print Download Action
    const printBtn = document.getElementById('netdraw_print_pdf');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            const titleInput = document.getElementById('title');
            const title = titleInput && titleInput.value ? titleInput.value : __('tournament_bracket', 'Tournament Bracket');
            
            const printWindow = window.open('', '_blank', 'width=1200,height=800');
            if (!printWindow) {
                alert(__('allow_popups', 'Please allow popups to print the bracket.'));
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${title}</title>
                    <link rel="stylesheet" href="${netdrawAdminData.frontendCssUrl}">
                    <style>
                        body {
                            background: #ffffff !important;
                            padding: 20px;
                            margin: 0;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        }
                        .netdraw-bracket-container {
                            border: none !important;
                            box-shadow: none !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            max-width: 100% !important;
                            width: 100% !important;
                        }
                        .netdraw-scroll-wrapper {
                            padding: 10px 0 !important;
                        }
                        @media print {
                            html, body {
                                height: auto;
                                overflow: visible !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            body {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            .netdraw-frontend-header {
                                margin-bottom: 8px !important;
                                padding-bottom: 4px !important;
                                border-bottom: 1px solid #cbd5e1 !important;
                            }
                            .netdraw-frontend-header h2 {
                                font-size: 16px !important;
                                margin: 0 !important;
                            }
                            .netdraw-badge {
                                font-size: 10px !important;
                                padding: 2px 8px !important;
                            }
                            .netdraw-bracket-container {
                                border: none !important;
                                box-shadow: none !important;
                                padding: 10px !important;
                                margin: 0 !important;
                                max-width: 100% !important;
                                width: 100% !important;
                                page-break-inside: avoid !important;
                                break-inside: avoid !important;
                            }
                            .netdraw-scroll-wrapper {
                                overflow: visible !important;
                                display: block !important;
                                width: 100% !important;
                                padding: 0 !important;
                                page-break-inside: avoid !important;
                                break-inside: avoid !important;
                            }
                            .netdraw-bracket-tree {
                                page-break-inside: avoid !important;
                                break-inside: avoid !important;
                            }
                            .netdraw-node {
                                padding: 4px 0 !important;
                            }
                            @page {
                                size: landscape;
                                margin: 0.5cm;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div id="print-area" class="netdraw-bracket-container"></div>
                    <script>
                        (function() {
                            const data = ${JSON.stringify(bracketData)};
                            const container = document.getElementById('print-area');
                            
                            // Header
                            const header = document.createElement('div');
                            header.className = 'netdraw-frontend-header';
                            header.innerHTML = '<h2>' + ${JSON.stringify(title)} + '</h2><span class="netdraw-badge">' + ${JSON.stringify(__('knockout_draw', '%d Player Knockout Draw'))}.replace('%d', data.size) + '</span>';
                            container.appendChild(header);

                            const scrollWrapper = document.createElement('div');
                            scrollWrapper.className = 'netdraw-scroll-wrapper';
                            
                            const bracketTree = document.createElement('div');
                            bracketTree.className = 'netdraw-bracket-tree';

                            const size = parseInt(data.size, 10);
                            const totalRounds = Math.log2(size);

                            function buildTreeNode(round, matchNum, totalRounds, matches) {
                                const matchId = 'r' + round + '_m' + matchNum;
                                const match = matches[matchId] || { p1: '', p2: '', score: '', winner: '', datetime: '' };

                                const node = document.createElement('div');
                                node.className = 'netdraw-node';

                                const matchCard = document.createElement('div');
                                matchCard.className = 'netdraw-card' + (match.winner ? ' has-winner' : '');

                                const p1Name = match.p1 || '';
                                const p2Name = match.p2 || '';
                                const p1Class = match.winner === 'p1' ? 'is-winner' : (match.winner ? 'is-loser' : '');
                                const p2Class = match.winner === 'p2' ? 'is-winner' : (match.winner ? 'is-loser' : '');
                                const p1Tbd = !p1Name ? 'is-tbd' : '';
                                const p2Tbd = !p2Name ? 'is-tbd' : '';

                                const p1Html = '<div class="netdraw-player p1-slot ' + p1Class + ' ' + p1Tbd + '"><span class="netdraw-pname">' + (p1Name || ${JSON.stringify(__('tbd', 'TBD'))}) + '</span></div>';
                                const p2Html = '<div class="netdraw-player p2-slot ' + p2Class + ' ' + p2Tbd + '"><span class="netdraw-pname">' + (p2Name || ${JSON.stringify(__('tbd', 'TBD'))}) + '</span></div>';
                                const scoreHtml = match.score ? '<div class="netdraw-score-row">' + match.score + '</div>' : '';
                                const datetimeHtml = match.datetime ? '<div class="netdraw-datetime-row">' + match.datetime + '</div>' : '';

                                matchCard.innerHTML = datetimeHtml + '<div class="netdraw-players-container">' + p1Html + '<div class="netdraw-divider"></div>' + p2Html + '</div>' + scoreHtml;
                                node.appendChild(matchCard);

                                if (round > 1) {
                                    const childrenContainer = document.createElement('div');
                                    childrenContainer.className = 'netdraw-children';
                                    childrenContainer.appendChild(buildTreeNode(round - 1, 2 * matchNum - 1, totalRounds, matches));
                                    childrenContainer.appendChild(buildTreeNode(round - 1, 2 * matchNum, totalRounds, matches));
                                    node.appendChild(childrenContainer);
                                }
                                return node;
                            }

                            bracketTree.appendChild(buildTreeNode(totalRounds, 1, totalRounds, data.matches));
                            
                            // Dynamic zoom based on size to fit 1 page without layout clipping
                            let zoomFactor = 1.0;
                            if (size === 16) {
                                zoomFactor = 0.75;
                            } else if (size === 32) {
                                zoomFactor = 0.4;
                            } else if (size === 64) {
                                zoomFactor = 0.2;
                            }
                            bracketTree.style.zoom = zoomFactor;

                            scrollWrapper.appendChild(bracketTree);
                            container.appendChild(scrollWrapper);

                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 500);
                        })();
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }

    // Initialize UI
    syncBracketData(sizeSelect.value);
    renderEditor();
});

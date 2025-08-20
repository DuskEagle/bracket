// Embedded CSV data - edit this string to update results
const csvData = `# Group A
Guanyu Song,Edward Zhang,1,https://online-go.com/review/1521372
Evan Tan,Michael Xu,2,https://online-go.com/review/1521373
Jeremiah Donley,Edward Zhang,2,https://online-go.com/review/1521522
Guanyu Song,Evan Tan,1,https://online-go.com/review/1521517
Jeremiah Donley,Michael Xu,2,https://online-go.com/review/1521955
Evan Tan,Edward Zhang,1,https://online-go.com/review/1521956
Jeremiah Donley,Evan Tan,2,https://online-go.com/review/1522098
Guanyu Song,Michael Xu,1,https://online-go.com/review/1522102
Jeremiah Donley,Guanyu Song,2,https://online-go.com/review/1522549
Michael Xu,Edward Zhang,1,https://online-go.com/review/1522548

# Group B
Qiyou Wu,Wanqi Zhu,1,https://online-go.com/review/1521383
Eric Yoder,Yuan Zhou,2,https://online-go.com/review/1521374
Henry Zhang,Daniel Zhou,2,https://online-go.com/review/1521379
Qiyou Wu,Yuan Zhou,1,https://online-go.com/review/1521516
Daniel Zhou,Wanqi Zhu,1,https://online-go.com/review/1521520
Eric Yoder,Henry Zhang,1,https://online-go.com/review/1521521
Qiyou Wu,Daniel Zhou,1,https://online-go.com/review/1521957
Henry Zhang,Yuan Zhou,2,https://online-go.com/review/1521958
Eric Yoder,Wanqi Zhu,1,https://online-go.com/review/1521959
Qiyou Wu,Henry Zhang,1,https://online-go.com/review/1522099
Eric Yoder,Daniel Zhou,1,https://online-go.com/review/1522100
Yuan Zhou,Wanqi Zhu,1,https://online-go.com/review/1522101
Qiyou Wu,Eric Yoder,2,https://online-go.com/review/1522550
Henry Zhang,Wanqi Zhu,2,https://online-go.com/review/1522547
Daniel Zhou,Yuan Zhou,1,https://online-go.com/review/1522546

# Semifinals
Guanyu Song,Qiyou Wu,1,https://online-go.com/review/1522697
Eric Yoder,Michael Xu,1,https://online-go.com/review/1522698
Guanyu Song,Qiyou Wu,0,https://online-go.com/review/1523117
Eric Yoder,Michael Xu,2,https://online-go.com/review/1523118

# Finals
SF1 Winner,SF2 Winner,0,`;

// Tournament data
const groupA = [
    "Jeremiah Donley",
    "Guanyu Song",
    "Evan Tan",
    "Michael Xu",
    "Edward Zhang"
];

const groupB = [
    "Qiyou Wu",
    "Eric Yoder",
    "Henry Zhang",
    "Daniel Zhou",
    "Yuan Zhou",
    "Wanqi Zhu"
];

// Static results - populated from CSV data
let results = {
    groupA: {},
    groupB: {},
    knockout: {
        sf1: { games: [], winner: null },
        sf2: { games: [], winner: null },
        final: { games: [], winner: null }
    },
    tiebreakers: {
        groupA: {},
        groupB: {}
    },
    qualifiedA1: 'Guanyu Song',
    qualifiedA2: 'Michael Xu',
    qualifiedB1: 'Eric Yoder',
    qualifiedB2: 'Qiyou Wu'
};

// Game links for completed matches
let gameLinks = {
    groupA: {},
    groupB: {},
    knockout: {
        sf1: [],
        sf2: [],
        final: []
    }
};

// Generate round robin matches for a group in the order specified by CSV
function generateRoundRobinMatches(players) {
    // Define match order based on CSV data structure
    if (players.length === 5) { // Group A - 2 games per round
        return [
            // Round 1
            { player1: "Guanyu Song", player2: "Edward Zhang", id: "0-1", round: 1, isTiebreak: false },
            { player1: "Evan Tan", player2: "Michael Xu", id: "1-2", round: 1, isTiebreak: false },
            // Round 2
            { player1: "Jeremiah Donley", player2: "Edward Zhang", id: "2-3", round: 2, isTiebreak: false },
            { player1: "Guanyu Song", player2: "Evan Tan", id: "3-4", round: 2, isTiebreak: false },
            // Round 3
            { player1: "Jeremiah Donley", player2: "Michael Xu", id: "4-5", round: 3, isTiebreak: false },
            { player1: "Evan Tan", player2: "Edward Zhang", id: "5-6", round: 3, isTiebreak: false },
            // Round 4
            { player1: "Jeremiah Donley", player2: "Evan Tan", id: "6-7", round: 4, isTiebreak: false },
            { player1: "Guanyu Song", player2: "Michael Xu", id: "7-8", round: 4, isTiebreak: false },
            // Round 5
            { player1: "Jeremiah Donley", player2: "Guanyu Song", id: "8-9", round: 5, isTiebreak: false },
            { player1: "Michael Xu", player2: "Edward Zhang", id: "9-10", round: 5, isTiebreak: false }
        ];
    } else if (players.length === 6) { // Group B - 3 games per round
        return [
            // Round 1
            { player1: "Qiyou Wu", player2: "Wanqi Zhu", id: "0-1", round: 1, isTiebreak: false },
            { player1: "Eric Yoder", player2: "Yuan Zhou", id: "1-2", round: 1, isTiebreak: false },
            { player1: "Henry Zhang", player2: "Daniel Zhou", id: "2-3", round: 1, isTiebreak: false },
            // Round 2
            { player1: "Qiyou Wu", player2: "Yuan Zhou", id: "3-4", round: 2, isTiebreak: false },
            { player1: "Daniel Zhou", player2: "Wanqi Zhu", id: "4-5", round: 2, isTiebreak: false },
            { player1: "Eric Yoder", player2: "Henry Zhang", id: "5-6", round: 2, isTiebreak: false },
            // Round 3
            { player1: "Qiyou Wu", player2: "Daniel Zhou", id: "6-7", round: 3, isTiebreak: false },
            { player1: "Henry Zhang", player2: "Yuan Zhou", id: "7-8", round: 3, isTiebreak: false },
            { player1: "Eric Yoder", player2: "Wanqi Zhu", id: "8-9", round: 3, isTiebreak: false },
            // Round 4
            { player1: "Qiyou Wu", player2: "Henry Zhang", id: "9-10", round: 4, isTiebreak: false },
            { player1: "Eric Yoder", player2: "Daniel Zhou", id: "10-11", round: 4, isTiebreak: false },
            { player1: "Yuan Zhou", player2: "Wanqi Zhu", id: "11-12", round: 4, isTiebreak: false },
            // Round 5
            { player1: "Qiyou Wu", player2: "Eric Yoder", id: "12-13", round: 5, isTiebreak: false },
            { player1: "Henry Zhang", player2: "Wanqi Zhu", id: "13-14", round: 5, isTiebreak: false },
            { player1: "Daniel Zhou", player2: "Yuan Zhou", id: "14-15", round: 5, isTiebreak: false }
        ];
    }
    
    // Fallback to original logic for other group sizes
    const matches = [];
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            matches.push({
                player1: players[i],
                player2: players[j],
                id: `${i}-${j}`
            });
        }
    }
    return matches;
}

// Create match HTML for results (non-interactive)
function createMatchElement(match, groupName) {
    const matchId = `${groupName}-${match.id}`;
    
    // Check for results in appropriate location (regular results or tiebreakers)
    let hasResult, gameLink;
    if (match.isTiebreak) {
        hasResult = results.tiebreakers[`group${groupName.toUpperCase()}`] && results.tiebreakers[`group${groupName.toUpperCase()}`][match.id];
        gameLink = gameLinks[`group${groupName.toUpperCase()}`] && gameLinks[`group${groupName.toUpperCase()}`][match.id];
    } else {
        hasResult = results[`group${groupName.toUpperCase()}`] && results[`group${groupName.toUpperCase()}`][match.id];
        gameLink = gameLinks[`group${groupName.toUpperCase()}`] && gameLinks[`group${groupName.toUpperCase()}`][match.id];
    }
    
    // Use different vs label for games in progress (have link but no result)
    const vsLabel = (gameLink && !hasResult) ? '🔄' : 'vs';
    
    // Add tiebreak indicator
    const tiebreakLabel = match.isTiebreak ? '<div class="tiebreak-label">Tiebreaks</div>' : '';
    
    const matchContent = `
        ${tiebreakLabel}
        <div class="match-players">
            <div class="player-button results-only" id="${matchId}-player1">
                <span class="player-name">${match.player1}</span>
                <span class="checkmark">✓</span>
            </div>
            <span class="vs-label">${vsLabel}</span>
            <div class="player-button results-only" id="${matchId}-player2">
                <span class="player-name">${match.player2}</span>
                <span class="checkmark">✓</span>
            </div>
        </div>
    `;
    
    // Add tiebreak class for styling
    const matchClasses = match.isTiebreak ? 'match tiebreak-match' : 'match';
    
    // Make game clickable if it has a link, regardless of whether it has a result
    if (gameLink) {
        return `
            <div class="${matchClasses} match-with-link" id="match-${matchId}">
                <a href="${gameLink}" target="_blank" class="match-link">
                    ${matchContent}
                    <div class="game-link-indicator">🔗 View Game</div>
                </a>
            </div>
        `;
    } else {
        return `
            <div class="${matchClasses}" id="match-${matchId}">
                ${matchContent}
            </div>
        `;
    }
}

// Update match visual feedback for results
function updateMatchVisuals(fullMatchId, winner) {
    const player1Button = document.getElementById(`${fullMatchId}-player1`);
    const player2Button = document.getElementById(`${fullMatchId}-player2`);
    
    if (!player1Button || !player2Button) return;
    
    // Reset both buttons
    player1Button.classList.remove('selected');
    player2Button.classList.remove('selected');
    
    // Mark the winner
    const player1Name = player1Button.querySelector('.player-name').textContent;
    const player2Name = player2Button.querySelector('.player-name').textContent;
    
    if (winner === player1Name) {
        player1Button.classList.add('selected');
    } else if (winner === player2Name) {
        player2Button.classList.add('selected');
    }
}

// Calculate group standings based on results
function calculateGroupStandings() {
    const standingsA = calculateGroupStanding(groupA, results.groupA, generateRoundRobinMatches(groupA));
    const standingsB = calculateGroupStanding(groupB, results.groupB, generateRoundRobinMatches(groupB));
    
    // Determine qualified teams
    const qualifiersA = determineQualifiers(standingsA, 'A');
    const qualifiersB = determineQualifiers(standingsB, 'B');
    
    results.qualifiedA1 = qualifiersA.first;
    results.qualifiedA2 = qualifiersA.second;
    results.qualifiedB1 = qualifiersB.first;
    results.qualifiedB2 = qualifiersB.second;
}

// Calculate standings for a single group
function calculateGroupStanding(players, groupResults, matches) {
    const standings = players.map(player => ({
        player,
        wins: 0,
        losses: 0,
        played: 0
    }));
    
    matches.forEach(match => {
        const result = groupResults[match.id];
        if (result) {
            const player1Stats = standings.find(s => s.player === match.player1);
            const player2Stats = standings.find(s => s.player === match.player2);
            
            player1Stats.played++;
            player2Stats.played++;
            
            if (result === match.player1) {
                player1Stats.wins++;
                player2Stats.losses++;
            } else {
                player2Stats.wins++;
                player1Stats.losses++;
            }
        }
    });
    
    // Sort by wins (descending), then by losses (ascending), then by head-to-head
    return standings.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (a.losses !== b.losses) return a.losses - b.losses;
        
        // If wins and losses are equal, check head-to-head
        const headToHeadMatch = matches.find(match => 
            (match.player1 === a.player && match.player2 === b.player) ||
            (match.player1 === b.player && match.player2 === a.player)
        );
        
        if (headToHeadMatch && groupResults[headToHeadMatch.id]) {
            const winner = groupResults[headToHeadMatch.id];
            if (winner === a.player) return -1; // a won, so a comes first
            if (winner === b.player) return 1;  // b won, so b comes first
        }
        
        return 0; // No tiebreaker available
    });
}

// Determine qualifiers - simplified for results display
function determineQualifiers(standings, groupLetter) {
    const numPlayers = standings.length;
    const totalMatches = numPlayers * (numPlayers - 1) / 2; // n choose 2
    const predictedMatches = standings.reduce((sum, player) => sum + player.played, 0) / 2;
    
    if (predictedMatches < totalMatches) {
        return {
            first: `Group ${groupLetter} 1st`,
            second: `Group ${groupLetter} 2nd`
        };
    }
    
    return {
        first: standings[0]?.player || `Group ${groupLetter} 1st`,
        second: standings[1]?.player || `Group ${groupLetter} 2nd`
    };
}

// Update knockout stage labels
function updateKnockoutStage() {
    const sf1Label = document.querySelector('#sf1-match .match-label');
    const sf2Label = document.querySelector('#sf2-match .match-label');
    
    if (sf1Label) sf1Label.textContent = `SF1: ${results.qualifiedA1} vs ${results.qualifiedB2}`;
    if (sf2Label) sf2Label.textContent = `SF2: ${results.qualifiedB1} vs ${results.qualifiedA2}`;
    
    updateSemifinalResults();
}

// Update semifinal results display
function updateSemifinalResults() {
    // Update SF1 display
    const sf1A1Name = document.getElementById('sf1-a1-name');
    const sf1B2Name = document.getElementById('sf1-b2-name');
    
    if (sf1A1Name) sf1A1Name.textContent = results.qualifiedA1;
    if (sf1B2Name) sf1B2Name.textContent = results.qualifiedB2;
    
    // Update SF2 display
    const sf2B1Name = document.getElementById('sf2-b1-name');
    const sf2A2Name = document.getElementById('sf2-a2-name');
    
    if (sf2B1Name) sf2B1Name.textContent = results.qualifiedB1;
    if (sf2A2Name) sf2A2Name.textContent = results.qualifiedA2;
    
    // Show knockout results if available
    updateKnockoutVisuals();
    updateFinalResults();
}

// Update knockout visual results and add links if available
function updateKnockoutVisuals() {
    updateKnockoutMatch('sf1', 'sf1-match');
    updateKnockoutMatch('sf2', 'sf2-match');
    updateKnockoutMatch('final', 'final-match');
}

// Create best-of-3 match HTML
function createBestOf3MatchHTML(matchKey, player1Name, player2Name, player1Id, player2Id) {
    const matchData = results.knockout[matchKey];
    const matchGameLinks = gameLinks.knockout[matchKey] || [];
    const games = matchData.games;
    const winner = matchData.winner;
    
    // Calculate how many games to show
    let gamesToShow = 1; // Always show at least game 1
    if (games.length > 0) {
        gamesToShow = Math.min(games.length + 1, 3); // Show completed games + 1 next game
        if (winner) {
            gamesToShow = games.length; // If series is over, only show completed games
        }
    }
    
    // Generate individual game elements
    let gamesHTML = '';
    for (let i = 0; i < gamesToShow; i++) {
        const gameNum = i + 1;
        const gameResult = games[i];
        const gameLink = matchGameLinks[i];
        const hasResult = gameResult !== undefined;
        
        // Determine visual state
        let player1Class = 'player-button results-only';
        let player2Class = 'player-button results-only';
        
        if (hasResult) {
            if (gameResult === 'player1') {
                player1Class += ' selected';
            } else if (gameResult === 'player2') {
                player2Class += ' selected';
            }
        }
        
        // Create clickable game element
        const gameContent = `
            <div class="best-of-3-game" id="${matchKey}-game-${gameNum}">
                <div class="game-header">Game ${gameNum}</div>
                <div class="match-players">
                    <div class="${player1Class}" id="${matchKey}-${player1Id}-game-${gameNum}">
                        <span class="player-name">${player1Name}</span>
                        <span class="checkmark">✓</span>
                    </div>
                    <span class="vs-label">${(gameLink && !hasResult) ? '🔄' : 'vs'}</span>
                    <div class="${player2Class}" id="${matchKey}-${player2Id}-game-${gameNum}">
                        <span class="player-name">${player2Name}</span>
                        <span class="checkmark">✓</span>
                    </div>
                </div>
            </div>
        `;
        
        if (gameLink) {
            gamesHTML += `
                <div class="game-wrapper" onclick="window.open('${gameLink}', '_blank')" style="cursor: pointer;">
                    ${gameContent}
                </div>
            `;
        } else {
            gamesHTML += gameContent;
        }
    }
    
    // Add series score indicator
    const player1Wins = games.filter(g => g === 'player1').length;
    const player2Wins = games.filter(g => g === 'player2').length;
    const scoreHTML = games.length > 0 ? `
        <div class="series-score">
            <span class="${player1Wins >= 2 ? 'series-winner' : ''}">${player1Name}: ${player1Wins}</span>
            <span class="score-separator">-</span>
            <span class="${player2Wins >= 2 ? 'series-winner' : ''}">${player2Name}: ${player2Wins}</span>
        </div>
    ` : '';
    
    return scoreHTML + gamesHTML;
}

// Update individual knockout match with best-of-3 display
function updateKnockoutMatch(matchKey, matchElementId) {
    const matchElement = document.getElementById(matchElementId);
    if (!matchElement) return;
    
    // Find the existing match-players div and replace with best-of-3 display
    const existingMatchPlayers = matchElement.querySelector('.match-players');
    if (!existingMatchPlayers) return;
    
    let player1Name, player2Name, player1Id, player2Id;
    
    if (matchKey === 'sf1') {
        player1Name = results.qualifiedA1;
        player2Name = results.qualifiedB2;
        player1Id = 'a1';
        player2Id = 'b2';
    } else if (matchKey === 'sf2') {
        player1Name = results.qualifiedB1;
        player2Name = results.qualifiedA2;
        player1Id = 'b1';
        player2Id = 'a2';
    } else if (matchKey === 'final') {
        player1Name = getSemifinalWinner('sf1');
        player2Name = getSemifinalWinner('sf2');
        player1Id = 'sf1';
        player2Id = 'sf2';
    }
    
    const bestOf3HTML = createBestOf3MatchHTML(matchKey, player1Name, player2Name, player1Id, player2Id);
    
    // Replace the match-players content
    existingMatchPlayers.outerHTML = `<div class="best-of-3-container">${bestOf3HTML}</div>`;
    
    // Update overall match winner visual if series is complete
    const matchData = results.knockout[matchKey];
    if (matchData.winner) {
        matchElement.classList.add('series-complete');
        if (matchData.winner === 'player1') {
            matchElement.classList.add('player1-wins-series');
        } else {
            matchElement.classList.add('player2-wins-series');
        }
    }
}

// Update final results
function updateFinalResults() {
    const finalSf1Name = document.getElementById('final-sf1-name');
    const finalSf2Name = document.getElementById('final-sf2-name');
    
    const sf1Winner = getSemifinalWinner('sf1');
    const sf2Winner = getSemifinalWinner('sf2');
    
    if (finalSf1Name) finalSf1Name.textContent = sf1Winner;
    if (finalSf2Name) finalSf2Name.textContent = sf2Winner;
    
    // Show final result if available - now checking the winner property
    const finalData = results.knockout.final;
    if (finalData.winner) {
        const finalSf1 = document.getElementById('final-sf1');
        const finalSf2 = document.getElementById('final-sf2');
        
        if (finalData.winner === 'player1' && finalSf1) {
            finalSf1.classList.add('selected');
        } else if (finalData.winner === 'player2' && finalSf2) {
            finalSf2.classList.add('selected');
        }
    }
}

// Get semifinal winner name
function getSemifinalWinner(semifinal) {
    const matchData = results.knockout[semifinal];
    
    if (matchData.winner === 'player1') {
        if (semifinal === 'sf1') return results.qualifiedA1;
        if (semifinal === 'sf2') return results.qualifiedB1;
    } else if (matchData.winner === 'player2') {
        if (semifinal === 'sf1') return results.qualifiedB2;
        if (semifinal === 'sf2') return results.qualifiedA2;
    }
    
    return semifinal === 'sf1' ? 'SF1 Winner' : 'SF2 Winner';
}

// Create HTML for matches grouped by rounds
function createRoundedMatchesHTML(matches, groupName) {
    const rounds = {};
    const tiebreakMatches = [];
    
    // Group matches by round, separate tiebreaks
    matches.forEach(match => {
        if (match.isTiebreak) {
            tiebreakMatches.push(match);
        } else {
            const round = match.round || 1;
            if (!rounds[round]) {
                rounds[round] = [];
            }
            rounds[round].push(match);
        }
    });
    
    // Create HTML for each regular round
    let html = '';
    Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b)).forEach(roundNum => {
        const roundMatches = rounds[roundNum];
        const roundClass = parseInt(roundNum) % 2 === 1 ? 'round-odd' : 'round-even';
        
        html += `<div class="round-group ${roundClass}">`;
        roundMatches.forEach(match => {
            html += createMatchElement(match, groupName);
        });
        html += '</div>';
    });
    
    // Add tiebreak games inline with regular rounds
    if (tiebreakMatches.length > 0) {
        tiebreakMatches.forEach(match => {
            html += createMatchElement(match, groupName);
        });
    }
    
    return html;
}

// Update group standings tables
function updateStandings() {
    updateGroupStandingsTable('A', groupA, results.groupA);
    updateGroupStandingsTable('B', groupB, results.groupB);
}

// Update standings table for a specific group
function updateGroupStandingsTable(groupLetter, players, groupResults) {
    const standings = calculateGroupStanding(players, groupResults, generateRoundRobinMatches(players));
    const tableBody = document.querySelector(`#group-${groupLetter.toLowerCase()}-standings tbody`);
    
    if (!tableBody) return;
    
    let html = '';
    
    // Check if all group matches have been played
    const numPlayers = players.length;
    const totalMatches = numPlayers * (numPlayers - 1) / 2; // n choose 2
    const playedMatches = standings.reduce((sum, player) => sum + player.played, 0) / 2; // Divide by 2 since each match counts for 2 players
    const groupComplete = playedMatches === totalMatches;
    
    standings.forEach((player, index) => {
        // Only show as qualified if group is complete AND player is in top 2
        const isQualified = groupComplete && index < 2;
        const rowClass = isQualified ? 'qualified' : '';
        
        html += `
            <tr class="${rowClass}">
                <td>${player.player}</td>
                <td>${player.wins}</td>
                <td>${player.losses}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Initialize the tournament results display
function initializeTournament() {
    // Load results from embedded CSV data
    loadResults();
    
    // Initialize global matches arrays if not already set
    if (!window.groupAMatches) window.groupAMatches = generateRoundRobinMatches(groupA);
    if (!window.groupBMatches) window.groupBMatches = generateRoundRobinMatches(groupB);
    
    // Use global matches arrays (populated by parseCSVResults)
    const groupAContainer = document.getElementById('group-a-matches');
    if (groupAContainer) {
        groupAContainer.innerHTML = createRoundedMatchesHTML(window.groupAMatches, 'a');
    }
    
    const groupBContainer = document.getElementById('group-b-matches');
    if (groupBContainer) {
        groupBContainer.innerHTML = createRoundedMatchesHTML(window.groupBMatches, 'b');
    }
    
    // Initialize displays
    calculateGroupStandings();
    updateKnockoutStage();
    updateStandings();
    
    // Update visuals for loaded results
    updateResultVisuals();
}

// Load results from embedded CSV data
function loadResults() {
    console.log('Loading results from embedded CSV data');
    parseCSVResults(csvData);
}

// Parse CSV results and populate results and gameLinks objects
function parseCSVResults(csvText) {
    const lines = csvText.split('\n').map(line => line.trim());
    let currentSection = 'groupA'; // Start with Group A
    window.groupAMatches = generateRoundRobinMatches(groupA);
    window.groupBMatches = generateRoundRobinMatches(groupB);
    const originalGroupALength = window.groupAMatches.length;
    const originalGroupBLength = window.groupBMatches.length;
    let matchIndex = 0;
    
    for (const line of lines) {
        // Skip empty lines
        if (!line) continue;
        
        // Check for section headers
        if (line.startsWith('# Group B')) {
            currentSection = 'groupB';
            matchIndex = 0;
            continue;
        } else if (line.startsWith('# Semifinals')) {
            currentSection = 'semifinals';
            matchIndex = 0;
            continue;
        } else if (line.startsWith('# Finals')) {
            currentSection = 'finals';
            matchIndex = 0;
            continue;
        } else if (line.startsWith('#')) {
            // Skip other comment lines
            continue;
        }
        
        // Parse match data
        const parts = line.split(',').map(part => part.trim());
        if (parts.length < 3) continue;
        
        const player1 = parts[0];
        const player2 = parts[1];
        const result = parseInt(parts[2]);
        const gameLink = parts[3] || '';
        
        if (currentSection === 'groupA') {
            if (matchIndex < originalGroupALength) {
                const match = window.groupAMatches[matchIndex];
                
                if (result === 1) {
                    results.groupA[match.id] = match.player1;
                } else if (result === 2) {
                    results.groupA[match.id] = match.player2;
                }
                if (gameLink) {
                    gameLinks.groupA[match.id] = gameLink;
                }
                matchIndex++;
            } else {
                // This is a tiebreak game beyond the 5 regular rounds
                const tiebreakId = `tb-${matchIndex - originalGroupALength}`;
                const tiebreakMatch = {
                    player1: player1,
                    player2: player2,
                    id: tiebreakId,
                    round: 6, // Tiebreak round
                    isTiebreak: true
                };
                
                if (result === 1) {
                    results.tiebreakers.groupA[tiebreakId] = player1;
                } else if (result === 2) {
                    results.tiebreakers.groupA[tiebreakId] = player2;
                }
                if (gameLink) {
                    gameLinks.groupA[tiebreakId] = gameLink;
                }
                
                // Add to the matches list for display
                window.groupAMatches.push(tiebreakMatch);
                matchIndex++;
            }
        } else if (currentSection === 'groupB') {
            if (matchIndex < originalGroupBLength) {
                const match = window.groupBMatches[matchIndex];
                if (result === 1) {
                    results.groupB[match.id] = match.player1;
                } else if (result === 2) {
                    results.groupB[match.id] = match.player2;
                }
                if (gameLink) {
                    gameLinks.groupB[match.id] = gameLink;
                }
                matchIndex++;
            } else {
                // This is a tiebreak game beyond the 5 regular rounds
                const tiebreakId = `tb-${matchIndex - originalGroupBLength}`;
                const tiebreakMatch = {
                    player1: player1,
                    player2: player2,
                    id: tiebreakId,
                    round: 6, // Tiebreak round
                    isTiebreak: true
                };
                
                if (result === 1) {
                    results.tiebreakers.groupB[tiebreakId] = player1;
                } else if (result === 2) {
                    results.tiebreakers.groupB[tiebreakId] = player2;
                }
                if (gameLink) {
                    gameLinks.groupB[tiebreakId] = gameLink;
                }
                
                // Add to the matches list for display
                window.groupBMatches.push(tiebreakMatch);
                matchIndex++;
            }
        } else if (currentSection === 'semifinals') {
            // For best-of-3, determine which semifinal based on player names
            // First 2 games: Guanyu Song vs Qiyou Wu = SF1
            // Last 2 games: Eric Yoder vs Michael Xu = SF2
            const sfKey = (player1 === 'Guanyu Song' || player2 === 'Guanyu Song') ? 'sf1' : 'sf2';
            
            // Add game result
            const gameResult = result === 1 ? 'player1' : (result === 2 ? 'player2' : null);
            if (gameResult) {
                results.knockout[sfKey].games.push(gameResult);
            }
            
            // Add game link
            if (gameLink) {
                if (!gameLinks.knockout[sfKey]) gameLinks.knockout[sfKey] = [];
                gameLinks.knockout[sfKey].push(gameLink);
            }
            
            // Check if series is complete (2 wins)
            const player1Wins = results.knockout[sfKey].games.filter(g => g === 'player1').length;
            const player2Wins = results.knockout[sfKey].games.filter(g => g === 'player2').length;
            if (player1Wins >= 2) {
                results.knockout[sfKey].winner = 'player1';
            } else if (player2Wins >= 2) {
                results.knockout[sfKey].winner = 'player2';
            }
            
            matchIndex++;
        } else if (currentSection === 'finals') {
            // Add game result for finals
            const gameResult = result === 1 ? 'player1' : (result === 2 ? 'player2' : null);
            if (gameResult) {
                results.knockout.final.games.push(gameResult);
            }
            
            // Add game link
            if (gameLink) {
                if (!gameLinks.knockout.final) gameLinks.knockout.final = [];
                gameLinks.knockout.final.push(gameLink);
            }
            
            // Check if series is complete (2 wins)
            const player1Wins = results.knockout.final.games.filter(g => g === 'player1').length;
            const player2Wins = results.knockout.final.games.filter(g => g === 'player2').length;
            if (player1Wins >= 2) {
                results.knockout.final.winner = 'player1';
            } else if (player2Wins >= 2) {
                results.knockout.final.winner = 'player2';
            }
        }
    }
}

// Update visual display for loaded results
function updateResultVisuals() {
    // Update group stage visuals
    updateGroupVisualSelections('a', results.groupA);
    updateGroupVisualSelections('b', results.groupB);
}

// Update group visual selections
function updateGroupVisualSelections(groupName, groupResults) {
    Object.keys(groupResults).forEach(matchId => {
        const winner = groupResults[matchId];
        if (winner) {
            updateMatchVisuals(`${groupName}-${matchId}`, winner);
        }
    });
    
    // Also update tiebreak game visuals
    const tiebreakResults = results.tiebreakers[`group${groupName.toUpperCase()}`];
    if (tiebreakResults) {
        Object.keys(tiebreakResults).forEach(matchId => {
            const winner = tiebreakResults[matchId];
            if (winner) {
                updateMatchVisuals(`${groupName}-${matchId}`, winner);
            }
        });
    }
}

// Initialization is now handled by the HTML page after script loads
// (No automatic DOMContentLoaded listener to avoid timing conflicts)

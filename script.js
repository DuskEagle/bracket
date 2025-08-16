// Tournament data
const groupA = [
    "Guanyu Song",
    "Evan Tan", 
    "Eric Yoder",
    "Edward Zhang",
    "Daniel Zhou",
    "Wanqi Zhu"
];

const groupB = [
    "Jeremiah Donley",
    "Qiyou Wu",
    "Michael Xu", 
    "Aaron Ye",
    "Henry Zhang",
    "Yuan Zhou"
];

// Store predictions and qualifiers
let predictions = {
    groupA: {},
    groupB: {},
    knockout: {},
    tiebreakers: {
        groupA: {},
        groupB: {}
    },
    qualifiedA1: 'Group A 1st',
    qualifiedA2: 'Group A 2nd',
    qualifiedB1: 'Group B 1st',
    qualifiedB2: 'Group B 2nd'
};

// Generate round robin matches for a group
function generateRoundRobinMatches(players) {
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

// Create match HTML
function createMatchElement(match, groupName) {
    const matchId = `${groupName}-${match.id}`;
    
    return `
        <div class="match" id="match-${matchId}">
            <div class="match-players">
                <button class="player-button" id="${matchId}-player1" onclick="selectWinner('${groupName}', '${match.id}', '${match.player1}')">
                    <span class="player-name">${match.player1}</span>
                    <span class="checkmark">✓</span>
                </button>
                <span class="vs-label">vs</span>
                <button class="player-button" id="${matchId}-player2" onclick="selectWinner('${groupName}', '${match.id}', '${match.player2}')">
                    <span class="player-name">${match.player2}</span>
                    <span class="checkmark">✓</span>
                </button>
            </div>
        </div>
    `;
}

// Handle winner selection
function selectWinner(groupName, matchId, winner) {
    const fullMatchId = `${groupName}-${matchId}`;
    
    // Update predictions
    if (groupName === 'a') {
        predictions.groupA[matchId] = winner;
    } else {
        predictions.groupB[matchId] = winner;
    }
    
    // Update visual feedback
    updateMatchVisuals(fullMatchId, winner);
    
    calculateGroupStandings();
    updateKnockoutStage();
    updateStandings();
    updateUrlHash();
}

// Update match visual feedback
function updateMatchVisuals(fullMatchId, winner) {
    const player1Button = document.getElementById(`${fullMatchId}-player1`);
    const player2Button = document.getElementById(`${fullMatchId}-player2`);
    
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

// Calculate group standings based on predictions
function calculateGroupStandings() {
    const standingsA = calculateGroupStanding(groupA, predictions.groupA, generateRoundRobinMatches(groupA));
    const standingsB = calculateGroupStanding(groupB, predictions.groupB, generateRoundRobinMatches(groupB));
    
    // Determine qualified teams with tie-breaking logic
    const qualifiersA = determineQualifiers(standingsA, 'A');
    const qualifiersB = determineQualifiers(standingsB, 'B');
    
    predictions.qualifiedA1 = qualifiersA.first;
    predictions.qualifiedA2 = qualifiersA.second;
    predictions.qualifiedB1 = qualifiersB.first;
    predictions.qualifiedB2 = qualifiersB.second;
}

// Calculate standings for a single group
function calculateGroupStanding(players, groupPredictions, matches) {
    const standings = players.map(player => ({
        player,
        wins: 0,
        losses: 0,
        played: 0
    }));
    
    matches.forEach(match => {
        const prediction = groupPredictions[match.id];
        if (prediction) {
            const player1Stats = standings.find(s => s.player === match.player1);
            const player2Stats = standings.find(s => s.player === match.player2);
            
            player1Stats.played++;
            player2Stats.played++;
            
            if (prediction === match.player1) {
                player1Stats.wins++;
                player2Stats.losses++;
            } else {
                player2Stats.wins++;
                player1Stats.losses++;
            }
        }
    });
    
    // Sort by wins (descending), then by losses (ascending)
    return standings.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
    });
}

// Determine qualifiers with tie-breaking logic
function determineQualifiers(standings, groupLetter) {
    // Check if we have enough matches predicted
    const totalMatches = 15; // 6 choose 2 = 15 matches per group
    const predictedMatches = standings.reduce((sum, player) => sum + player.played, 0) / 2;
    
    if (predictedMatches < totalMatches) {
        return {
            first: `Group ${groupLetter} 1st`,
            second: `Group ${groupLetter} 2nd`
        };
    }
    
    // Check for ties in first place
    const firstPlaceWins = standings[0].wins;
    const firstPlaceTied = standings.filter(player => player.wins === firstPlaceWins);
    
    // Check for ties in second place
    const secondPlaceWins = standings[1].wins;
    const secondPlaceTied = standings.filter(player => player.wins === secondPlaceWins);
    
    let first, second;
    
    if (firstPlaceTied.length > 1) {
        // Tie for first place
        if (firstPlaceTied.length === 2) {
            // 2-way tie: use head-to-head automatically
            const headToHeadWinner = resolveHeadToHead(firstPlaceTied, groupLetter === 'A' ? predictions.groupA : predictions.groupB);
            if (headToHeadWinner) {
                first = headToHeadWinner;
                const loser = firstPlaceTied.find(p => p.player !== first);
                second = loser.player;
            } else {
                // Head-to-head not available, still need tiebreaker
                const tiebreakerKey = `group${groupLetter}First`;
                if (predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey]) {
                    first = predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey];
                    const loser = firstPlaceTied.find(p => p.player !== first);
                    second = loser.player;
                } else {
                    first = `TIE: ${firstPlaceTied.map(p => p.player).join(', ')}`;
                    second = `Group ${groupLetter} 2nd (waiting for 1st place tiebreaker)`;
                }
            }
        } else {
            // 3+ way tie: use manual tiebreaker
            const tiebreakerKey = `group${groupLetter}First`;
            if (predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey]) {
                first = predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey];
                // Determine second from remaining tied players
                const remainingTied = firstPlaceTied.filter(p => p.player !== first);
                if (remainingTied.length === 1) {
                    second = remainingTied[0].player;
                } else if (remainingTied.length === 2) {
                    // 2-way tie for second: use head-to-head first, then manual tiebreaker
                    const headToHeadWinner = resolveHeadToHead(remainingTied, groupLetter === 'A' ? predictions.groupA : predictions.groupB);
                    if (headToHeadWinner) {
                        second = headToHeadWinner;
                    } else {
                        // Need manual tiebreaker for second
                        const tiebreakerKey2 = `group${groupLetter}Second`;
                        if (predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey2]) {
                            second = predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey2];
                        } else {
                            second = `TIE: ${remainingTied.map(p => p.player).join(', ')}`;
                        }
                    }
                } else {
                    // 3+ way tie for second: need manual tiebreaker
                    const tiebreakerKey2 = `group${groupLetter}Second`;
                    if (predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey2]) {
                        second = predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey2];
                    } else {
                        second = `TIE: ${remainingTied.map(p => p.player).join(', ')}`;
                    }
                }
            } else {
                first = `TIE: ${firstPlaceTied.map(p => p.player).join(', ')}`;
                second = `Group ${groupLetter} 2nd (waiting for 1st place tiebreaker)`;
            }
        }
    } else {
        first = standings[0].player;
        
        if (secondPlaceTied.length > 1) {
            // Tie for second place (not involving first place)
            if (secondPlaceTied.length === 2) {
                // 2-way tie: use head-to-head automatically
                const headToHeadWinner = resolveHeadToHead(secondPlaceTied, groupLetter === 'A' ? predictions.groupA : predictions.groupB);
                if (headToHeadWinner) {
                    second = headToHeadWinner;
                } else {
                    // Head-to-head not available, need tiebreaker
                    const tiebreakerKey = `group${groupLetter}Second`;
                    if (predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey]) {
                        second = predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey];
                    } else {
                        second = `TIE: ${secondPlaceTied.map(p => p.player).join(', ')}`;
                    }
                }
            } else {
                // 3+ way tie: use manual tiebreaker
                const tiebreakerKey = `group${groupLetter}Second`;
                if (predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey]) {
                    second = predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey];
                } else {
                    second = `TIE: ${secondPlaceTied.map(p => p.player).join(', ')}`;
                }
            }
        } else {
            second = standings[1].player;
        }
    }
    
    return { first, second };
}

// Resolve head-to-head matchup between two tied players
function resolveHeadToHead(tiedPlayers, groupPredictions) {
    if (tiedPlayers.length !== 2) return null;
    
    const player1 = tiedPlayers[0].player;
    const player2 = tiedPlayers[1].player;
    
    // Find the match between these two players
    const matches = generateRoundRobinMatches(groupA.includes(player1) ? groupA : groupB);
    const headToHeadMatch = matches.find(match => 
        (match.player1 === player1 && match.player2 === player2) ||
        (match.player1 === player2 && match.player2 === player1)
    );
    
    if (headToHeadMatch && groupPredictions[headToHeadMatch.id]) {
        return groupPredictions[headToHeadMatch.id];
    }
    
    return null; // No head-to-head prediction available
}

// Handle knockout winner selection
function selectKnockoutWinner(stage, choice) {
    // Update predictions
    predictions.knockout[stage] = choice;
    
    // Update visual feedback
    updateKnockoutVisuals(stage, choice);
    
    if (stage === 'sf1' || stage === 'sf2') {
        updateFinalOptions();
    }
    
    updateStandings();
    updateUrlHash();
}

// Update knockout visual feedback
function updateKnockoutVisuals(stage, choice) {
    if (stage === 'sf1') {
        const a1Button = document.getElementById('sf1-a1');
        const b2Button = document.getElementById('sf1-b2');
        
        a1Button.classList.remove('selected');
        b2Button.classList.remove('selected');
        
        if (choice === 'a1') {
            a1Button.classList.add('selected');
        } else if (choice === 'b2') {
            b2Button.classList.add('selected');
        }
    } else if (stage === 'sf2') {
        const b1Button = document.getElementById('sf2-b1');
        const a2Button = document.getElementById('sf2-a2');
        
        b1Button.classList.remove('selected');
        a2Button.classList.remove('selected');
        
        if (choice === 'b1') {
            b1Button.classList.add('selected');
        } else if (choice === 'a2') {
            a2Button.classList.add('selected');
        }
    } else if (stage === 'final') {
        const sf1Button = document.getElementById('final-sf1');
        const sf2Button = document.getElementById('final-sf2');
        
        sf1Button.classList.remove('selected');
        sf2Button.classList.remove('selected');
        
        if (choice === 'sf1') {
            sf1Button.classList.add('selected');
        } else if (choice === 'sf2') {
            sf2Button.classList.add('selected');
        }
    }
}

// Update knockout stage labels
function updateKnockoutStage() {
    const sf1Label = document.querySelector('#sf1-match .match-label');
    const sf2Label = document.querySelector('#sf2-match .match-label');
    
    sf1Label.textContent = `SF1: ${predictions.qualifiedA1} vs ${predictions.qualifiedB2}`;
    sf2Label.textContent = `SF2: ${predictions.qualifiedB1} vs ${predictions.qualifiedA2}`;
    
    // Update semifinal player names and enable/disable buttons
    updateSemifinalButtons();
    
    // Update final options in case qualified players changed
    updateFinalOptions();
    
    // Check if we need tiebreaker UI
    updateTiebreakerUI();
}

// Update semifinal buttons
function updateSemifinalButtons() {
    // Update SF1 buttons
    const sf1A1Name = document.getElementById('sf1-a1-name');
    const sf1B2Name = document.getElementById('sf1-b2-name');
    const sf1A1Button = document.getElementById('sf1-a1');
    const sf1B2Button = document.getElementById('sf1-b2');
    
    sf1A1Name.textContent = predictions.qualifiedA1;
    sf1B2Name.textContent = predictions.qualifiedB2;
    
    // Only enable buttons if we have determined players (no ties)
    const sf1Enabled = !predictions.qualifiedA1.includes('TIE') && !predictions.qualifiedB2.includes('TIE') && 
                      predictions.qualifiedA1 !== 'Group A 1st' && predictions.qualifiedB2 !== 'Group B 2nd';
    
    sf1A1Button.disabled = !sf1Enabled;
    sf1B2Button.disabled = !sf1Enabled;
    
    // Update SF2 buttons
    const sf2B1Name = document.getElementById('sf2-b1-name');
    const sf2A2Name = document.getElementById('sf2-a2-name');
    const sf2B1Button = document.getElementById('sf2-b1');
    const sf2A2Button = document.getElementById('sf2-a2');
    
    sf2B1Name.textContent = predictions.qualifiedB1;
    sf2A2Name.textContent = predictions.qualifiedA2;
    
    const sf2Enabled = !predictions.qualifiedB1.includes('TIE') && !predictions.qualifiedA2.includes('TIE') &&
                      predictions.qualifiedB1 !== 'Group B 1st' && predictions.qualifiedA2 !== 'Group A 2nd';
    
    sf2B1Button.disabled = !sf2Enabled;
    sf2A2Button.disabled = !sf2Enabled;
}


// Update tiebreaker UI
function updateTiebreakerUI() {
    // Check for Group A tiebreakers
    updateGroupTiebreakers('A', groupA);
    updateGroupTiebreakers('B', groupB);
}

// Update tiebreakers for a specific group
function updateGroupTiebreakers(groupLetter, players) {
    const standings = calculateGroupStanding(
        players, 
        groupLetter === 'A' ? predictions.groupA : predictions.groupB, 
        generateRoundRobinMatches(players)
    );
    
    const totalMatches = 15;
    const predictedMatches = standings.reduce((sum, player) => sum + player.played, 0) / 2;
    
    if (predictedMatches < totalMatches) return;
    
    const firstPlaceWins = standings[0].wins;
    const firstPlaceTied = standings.filter(player => player.wins === firstPlaceWins);
    
    const secondPlaceWins = standings[1].wins;
    const secondPlaceTied = standings.filter(player => player.wins === secondPlaceWins);
    
    // Create tiebreaker UI if needed
    let tiebreakerContainer = document.getElementById(`group-${groupLetter.toLowerCase()}-tiebreakers`);
    if (!tiebreakerContainer) {
        tiebreakerContainer = document.createElement('div');
        tiebreakerContainer.id = `group-${groupLetter.toLowerCase()}-tiebreakers`;
        tiebreakerContainer.className = 'tiebreaker-section';
        
        const groupContainer = document.querySelector(`#group-${groupLetter.toLowerCase()}-matches`).parentElement;
        groupContainer.appendChild(tiebreakerContainer);
    }
    
    let tiebreakerHTML = '';
    
    // Only show tiebreaker dropdowns for 3+ way ties
    if (firstPlaceTied.length > 2) {
        const currentFirstSelection = predictions.tiebreakers[`group${groupLetter}`][`group${groupLetter}First`] || '';
        
        tiebreakerHTML += `
            <div class="tiebreaker">
                <h4>Tiebreaker for 1st Place (${firstPlaceTied.length}-way tie)</h4>
                <select id="group${groupLetter}FirstTiebreaker" onchange="updateTiebreaker('group${groupLetter}', 'group${groupLetter}First', this.value)">
                    <option value="">Select 1st place winner</option>
                    ${firstPlaceTied.map(player => `<option value="${player.player}" ${player.player === currentFirstSelection ? 'selected' : ''}>${player.player}</option>`).join('')}
                </select>
            </div>
        `;
        
        // If first place is selected, check if remaining players need second place tiebreaker
        const firstWinner = predictions.tiebreakers[`group${groupLetter}`][`group${groupLetter}First`];
        if (firstWinner) {
            const remainingTied = firstPlaceTied.filter(p => p.player !== firstWinner);
            if (remainingTied.length > 1) {
                const currentSecondSelection = predictions.tiebreakers[`group${groupLetter}`][`group${groupLetter}Second`] || '';
                
                tiebreakerHTML += `
                    <div class="tiebreaker">
                        <h4>Tiebreaker for 2nd Place (${remainingTied.length}-way tie)</h4>
                        <select id="group${groupLetter}SecondTiebreaker" onchange="updateTiebreaker('group${groupLetter}', 'group${groupLetter}Second', this.value)">
                            <option value="">Select 2nd place winner</option>
                            ${remainingTied.map(player => `<option value="${player.player}" ${player.player === currentSecondSelection ? 'selected' : ''}>${player.player}</option>`).join('')}
                        </select>
                    </div>
                `;
            }
        }
    } else if (firstPlaceTied.length === 2) {
        // 2-way tie for first: check if head-to-head is missing
        const headToHeadWinner = resolveHeadToHead(firstPlaceTied, groupLetter === 'A' ? predictions.groupA : predictions.groupB);
        if (!headToHeadWinner) {
            const currentFirstSelection = predictions.tiebreakers[`group${groupLetter}`][`group${groupLetter}First`] || '';
            
            tiebreakerHTML += `
                <div class="tiebreaker">
                    <h4>Tiebreaker for 1st Place (head-to-head not predicted)</h4>
                    <select id="group${groupLetter}FirstTiebreaker" onchange="updateTiebreaker('group${groupLetter}', 'group${groupLetter}First', this.value)">
                        <option value="">Select 1st place winner</option>
                        ${firstPlaceTied.map(player => `<option value="${player.player}" ${player.player === currentFirstSelection ? 'selected' : ''}>${player.player}</option>`).join('')}
                    </select>
                </div>
            `;
        }
    } else if (secondPlaceTied.length > 2) {
        // 3+ way tie for second place only
        const currentSecondSelection = predictions.tiebreakers[`group${groupLetter}`][`group${groupLetter}Second`] || '';
        
        tiebreakerHTML += `
            <div class="tiebreaker">
                <h4>Tiebreaker for 2nd Place (${secondPlaceTied.length}-way tie)</h4>
                <select id="group${groupLetter}SecondTiebreaker" onchange="updateTiebreaker('group${groupLetter}', 'group${groupLetter}Second', this.value)">
                    <option value="">Select 2nd place winner</option>
                    ${secondPlaceTied.map(player => `<option value="${player.player}" ${player.player === currentSecondSelection ? 'selected' : ''}>${player.player}</option>`).join('')}
                </select>
            </div>
        `;
    } else if (secondPlaceTied.length === 2) {
        // 2-way tie for second: check if head-to-head is missing
        const headToHeadWinner = resolveHeadToHead(secondPlaceTied, groupLetter === 'A' ? predictions.groupA : predictions.groupB);
        if (!headToHeadWinner) {
            const currentSecondSelection = predictions.tiebreakers[`group${groupLetter}`][`group${groupLetter}Second`] || '';
            
            tiebreakerHTML += `
                <div class="tiebreaker">
                    <h4>Tiebreaker for 2nd Place (head-to-head not predicted)</h4>
                    <select id="group${groupLetter}SecondTiebreaker" onchange="updateTiebreaker('group${groupLetter}', 'group${groupLetter}Second', this.value)">
                        <option value="">Select 2nd place winner</option>
                        ${secondPlaceTied.map(player => `<option value="${player.player}" ${player.player === currentSecondSelection ? 'selected' : ''}>${player.player}</option>`).join('')}
                    </select>
                </div>
            `;
        }
    }
    
    // Only show tiebreaker container if there are actual tiebreakers
    if (tiebreakerHTML) {
        tiebreakerContainer.innerHTML = tiebreakerHTML;
        tiebreakerContainer.style.display = 'block';
    } else {
        tiebreakerContainer.style.display = 'none';
    }
}

// Handle tiebreaker selection
function updateTiebreaker(groupKey, position, winner) {
    predictions.tiebreakers[groupKey][position] = winner;
    calculateGroupStandings();
    updateKnockoutStage();
    updateStandings();
    updateUrlHash();
}

// Update final options based on semifinal predictions
function updateFinalOptions() {
    const finalSf1Name = document.getElementById('final-sf1-name');
    const finalSf2Name = document.getElementById('final-sf2-name');
    const finalSf1Button = document.getElementById('final-sf1');
    const finalSf2Button = document.getElementById('final-sf2');
    
    const sf1Winner = getSemifinalWinner('sf1');
    const sf2Winner = getSemifinalWinner('sf2');
    
    finalSf1Name.textContent = sf1Winner;
    finalSf2Name.textContent = sf2Winner;
    
    const finalEnabled = !sf1Winner.includes('SF1 Winner') && !sf2Winner.includes('SF2 Winner');
    
    finalSf1Button.disabled = !finalEnabled;
    finalSf2Button.disabled = !finalEnabled;
}

// Get semifinal winner name
function getSemifinalWinner(semifinal) {
    const prediction = predictions.knockout[semifinal];
    
    if (semifinal === 'sf1') {
        if (prediction === 'a1') return predictions.qualifiedA1;
        if (prediction === 'b2') return predictions.qualifiedB2;
        return 'SF1 Winner';
    } else {
        if (prediction === 'b1') return predictions.qualifiedB1;
        if (prediction === 'a2') return predictions.qualifiedA2;
        return 'SF2 Winner';
    }
}

// Update group standings tables
function updateStandings() {
    updateGroupStandingsTable('A', groupA, predictions.groupA);
    updateGroupStandingsTable('B', groupB, predictions.groupB);
}

// Update standings table for a specific group
function updateGroupStandingsTable(groupLetter, players, groupPredictions) {
    const standings = calculateGroupStanding(players, groupPredictions, generateRoundRobinMatches(players));
    const tableBody = document.querySelector(`#group-${groupLetter.toLowerCase()}-standings tbody`);
    
    // Apply tiebreaker results to reorder standings
    const finalStandings = applyTiebreakersToStandings(standings, groupLetter);
    
    let html = '';
    
    // Check if all group matches have been played (15 total matches per group)
    const totalMatches = 15;
    const playedMatches = standings.reduce((sum, player) => sum + player.played, 0) / 2; // Divide by 2 since each match counts for 2 players
    const groupComplete = playedMatches === totalMatches;
    
    finalStandings.forEach((player, index) => {
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

// Apply tiebreaker selections to standings order
function applyTiebreakersToStandings(standings, groupLetter) {
    // Check if we have enough matches predicted
    const totalMatches = 15;
    const predictedMatches = standings.reduce((sum, player) => sum + player.played, 0) / 2;
    
    if (predictedMatches < totalMatches) {
        return standings; // Return original order if incomplete
    }
    
    // Get tiebreaker selections
    const firstWinner = predictions.tiebreakers[`group${groupLetter}`][`group${groupLetter}First`];
    const secondWinner = predictions.tiebreakers[`group${groupLetter}`][`group${groupLetter}Second`];
    
    // Group players by win count
    const winGroups = {};
    standings.forEach(player => {
        if (!winGroups[player.wins]) {
            winGroups[player.wins] = [];
        }
        winGroups[player.wins].push(player);
    });
    
    // Sort win counts descending
    const sortedWins = Object.keys(winGroups).map(Number).sort((a, b) => b - a);
    
    let reorderedStandings = [];
    
    sortedWins.forEach(wins => {
        const playersWithWins = winGroups[wins];
        
        if (playersWithWins.length === 1) {
            // No tie, add player as-is
            reorderedStandings.push(playersWithWins[0]);
        } else if (playersWithWins.length > 1) {
            // Handle ties based on tiebreaker selections
            if (reorderedStandings.length === 0 && firstWinner) {
                // First place tiebreaker
                const winner = playersWithWins.find(p => p.player === firstWinner);
                const losers = playersWithWins.filter(p => p.player !== firstWinner);
                
                if (winner) {
                    reorderedStandings.push(winner);
                    
                    if (losers.length === 1) {
                        // 2-way tie, loser gets second
                        reorderedStandings.push(losers[0]);
                    } else if (losers.length > 1 && secondWinner) {
                        // Multiple losers, check second place tiebreaker
                        const secondPlace = losers.find(p => p.player === secondWinner);
                        const remainingLosers = losers.filter(p => p.player !== secondWinner);
                        
                        if (secondPlace) {
                            reorderedStandings.push(secondPlace);
                            // Add remaining losers in original order
                            remainingLosers.forEach(p => reorderedStandings.push(p));
                        } else {
                            // No second place winner selected, keep original order
                            losers.forEach(p => reorderedStandings.push(p));
                        }
                    } else {
                        // Add remaining losers in original order
                        losers.forEach(p => reorderedStandings.push(p));
                    }
                } else {
                    // First place winner not found, keep original order
                    playersWithWins.forEach(p => reorderedStandings.push(p));
                }
            } else if (reorderedStandings.length === 1 && secondWinner) {
                // Second place tiebreaker (first place already determined)
                const winner = playersWithWins.find(p => p.player === secondWinner);
                const losers = playersWithWins.filter(p => p.player !== secondWinner);
                
                if (winner) {
                    reorderedStandings.push(winner);
                    losers.forEach(p => reorderedStandings.push(p));
                } else {
                    playersWithWins.forEach(p => reorderedStandings.push(p));
                }
            } else {
                // No applicable tiebreaker, keep original order
                playersWithWins.forEach(p => reorderedStandings.push(p));
            }
        }
    });
    
    return reorderedStandings;
}

// Initialize the tournament
function initializeTournament() {
    // Generate Group A matches
    const groupAMatches = generateRoundRobinMatches(groupA);
    const groupAContainer = document.getElementById('group-a-matches');
    groupAContainer.innerHTML = groupAMatches.map(match => createMatchElement(match, 'a')).join('');
    
    // Generate Group B matches
    const groupBMatches = generateRoundRobinMatches(groupB);
    const groupBContainer = document.getElementById('group-b-matches');
    groupBContainer.innerHTML = groupBMatches.map(match => createMatchElement(match, 'b')).join('');
    
    // Initialize knockout stage
    updateKnockoutStage();
    
    // Initialize standings
    updateStandings();
}

// URL State Management - Binary encoding
function encodePredictionsToHash() {
    try {
        let bits = '';
        
        // Group A: 15 matches, 2 bits each (00=no prediction, 01=first player, 10=second player)
        const groupAMatches = generateRoundRobinMatches(groupA);
        groupAMatches.forEach(match => {
            const prediction = predictions.groupA[match.id];
            if (!prediction) {
                bits += '00'; // No prediction
            } else {
                const isFirstPlayer = prediction === match.player1;
                bits += isFirstPlayer ? '01' : '10';
            }
        });
        
        // Group B: 15 matches, 2 bits each
        const groupBMatches = generateRoundRobinMatches(groupB);
        groupBMatches.forEach(match => {
            const prediction = predictions.groupB[match.id];
            if (!prediction) {
                bits += '00'; // No prediction
            } else {
                const isFirstPlayer = prediction === match.player1;
                bits += isFirstPlayer ? '01' : '10';
            }
        });
        
        // Knockout: 3 matches, 2 bits each (00=no prediction, 01=first option, 10=second option)
        // SF1
        if (!predictions.knockout.sf1) {
            bits += '00';
        } else {
            bits += predictions.knockout.sf1 === 'a1' ? '01' : '10';
        }
        
        // SF2
        if (!predictions.knockout.sf2) {
            bits += '00';
        } else {
            bits += predictions.knockout.sf2 === 'b1' ? '01' : '10';
        }
        
        // Final
        if (!predictions.knockout.final) {
            bits += '00';
        } else {
            bits += predictions.knockout.final === 'sf1' ? '01' : '10';
        }
        
        // Tiebreakers: Up to 4 possible tiebreakers, 3 bits each for player index (0-5)
        // Group A first place tiebreaker
        const ta1 = predictions.tiebreakers.groupA?.groupAFirst;
        if (ta1) {
            const idx = groupA.indexOf(ta1);
            bits += '1' + idx.toString(2).padStart(3, '0'); // 1 + 3 bits for index
        } else {
            bits += '0000'; // No tiebreaker
        }
        
        // Group A second place tiebreaker
        const ta2 = predictions.tiebreakers.groupA?.groupASecond;
        if (ta2) {
            const idx = groupA.indexOf(ta2);
            bits += '1' + idx.toString(2).padStart(3, '0');
        } else {
            bits += '0000';
        }
        
        // Group B first place tiebreaker
        const tb1 = predictions.tiebreakers.groupB?.groupBFirst;
        if (tb1) {
            const idx = groupB.indexOf(tb1);
            bits += '1' + idx.toString(2).padStart(3, '0');
        } else {
            bits += '0000';
        }
        
        // Group B second place tiebreaker
        const tb2 = predictions.tiebreakers.groupB?.groupBSecond;
        if (tb2) {
            const idx = groupB.indexOf(tb2);
            bits += '1' + idx.toString(2).padStart(3, '0');
        } else {
            bits += '0000';
        }
        
        // Convert binary string to base64
        return binaryToBase64(bits);
        
    } catch (error) {
        console.error('Error encoding predictions:', error);
        return '';
    }
}

// Binary conversion utilities
function binaryToBase64(binaryString) {
    // Pad to make divisible by 8
    while (binaryString.length % 8 !== 0) {
        binaryString += '0';
    }
    
    // Convert to bytes
    let bytes = '';
    for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.substr(i, 8);
        bytes += String.fromCharCode(parseInt(byte, 2));
    }
    
    // Convert to base64 and make URL-safe
    return btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64ToBinary(base64String) {
    // Restore base64 padding
    let padded = base64String.replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4) {
        padded += '=';
    }
    
    // Convert from base64
    const bytes = atob(padded);
    
    // Convert to binary string
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += bytes.charCodeAt(i).toString(2).padStart(8, '0');
    }
    
    return binary;
}

function decodePredictionsFromHash(hash) {
    try {
        if (!hash || hash.length === 0) {
            return null;
        }
        
        // Remove '#' if present
        const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
        
        // Try binary format first (new format)
        try {
            const binaryString = base64ToBinary(cleanHash);
            return decodeBinaryPredictions(binaryString);
        } catch (e) {
            // Try JSON compressed format (medium format)
            try {
                const decompressed = simpleDecompress(cleanHash);
                const compactData = JSON.parse(decompressed);
                return decompressPredictions(compactData);
            } catch (e2) {
                // Fallback to original format for backward compatibility
                const jsonString = atob(cleanHash);
                const stateData = JSON.parse(jsonString);
                return stateData;
            }
        }
    } catch (error) {
        console.error('Error decoding predictions:', error);
        return null;
    }
}

function decodeBinaryPredictions(binaryString) {
    const data = {
        groupA: {},
        groupB: {},
        knockout: {},
        tiebreakers: { groupA: {}, groupB: {} }
    };
    
    let pos = 0;
    
    // Decode Group A: 15 matches, 2 bits each (00=no prediction, 01=first player, 10=second player)
    const groupAMatches = generateRoundRobinMatches(groupA);
    groupAMatches.forEach(match => {
        const predictionBits = binaryString.substr(pos, 2);
        pos += 2;
        
        if (predictionBits === '01') {
            data.groupA[match.id] = match.player1;
        } else if (predictionBits === '10') {
            data.groupA[match.id] = match.player2;
        }
        // '00' means no prediction, so we don't set anything
    });
    
    // Decode Group B: 15 matches, 2 bits each
    const groupBMatches = generateRoundRobinMatches(groupB);
    groupBMatches.forEach(match => {
        const predictionBits = binaryString.substr(pos, 2);
        pos += 2;
        
        if (predictionBits === '01') {
            data.groupB[match.id] = match.player1;
        } else if (predictionBits === '10') {
            data.groupB[match.id] = match.player2;
        }
        // '00' means no prediction, so we don't set anything
    });
    
    // Decode Knockout: 3 matches, 2 bits each (00=no prediction, 01=first option, 10=second option)
    // SF1
    const sf1Bits = binaryString.substr(pos, 2);
    pos += 2;
    if (sf1Bits === '01') data.knockout.sf1 = 'a1';
    else if (sf1Bits === '10') data.knockout.sf1 = 'b2';
    
    // SF2
    const sf2Bits = binaryString.substr(pos, 2);
    pos += 2;
    if (sf2Bits === '01') data.knockout.sf2 = 'b1';
    else if (sf2Bits === '10') data.knockout.sf2 = 'a2';
    
    // Final
    const finalBits = binaryString.substr(pos, 2);
    pos += 2;
    if (finalBits === '01') data.knockout.final = 'sf1';
    else if (finalBits === '10') data.knockout.final = 'sf2';
    
    // Decode Tiebreakers: 4 possible tiebreakers, 4 bits each
    // Group A first place
    if (binaryString[pos] === '1') {
        pos++; // Skip the flag bit
        const idx = parseInt(binaryString.substr(pos, 3), 2);
        data.tiebreakers.groupA.groupAFirst = groupA[idx];
        pos += 3;
    } else {
        pos += 4;
    }
    
    // Group A second place
    if (binaryString[pos] === '1') {
        pos++;
        const idx = parseInt(binaryString.substr(pos, 3), 2);
        data.tiebreakers.groupA.groupASecond = groupA[idx];
        pos += 3;
    } else {
        pos += 4;
    }
    
    // Group B first place
    if (binaryString[pos] === '1') {
        pos++;
        const idx = parseInt(binaryString.substr(pos, 3), 2);
        data.tiebreakers.groupB.groupBFirst = groupB[idx];
        pos += 3;
    } else {
        pos += 4;
    }
    
    // Group B second place
    if (binaryString[pos] === '1') {
        pos++;
        const idx = parseInt(binaryString.substr(pos, 3), 2);
        data.tiebreakers.groupB.groupBSecond = groupB[idx];
        pos += 3;
    } else {
        pos += 4;
    }
    
    return data;
}

// Decompress the data back to original format
function decompressPredictions(compact) {
    const data = {
        groupA: {},
        groupB: {},
        knockout: {},
        tiebreakers: { groupA: {}, groupB: {} }
    };
    
    // Decompress group A predictions
    if (compact.a) {
        Object.keys(compact.a).forEach(matchId => {
            const winnerIndex = compact.a[matchId];
            const [p1Idx, p2Idx] = matchId.split('-').map(Number);
            const winner = winnerIndex === 0 ? groupA[p1Idx] : groupA[p2Idx];
            data.groupA[matchId] = winner;
        });
    }
    
    // Decompress group B predictions
    if (compact.b) {
        Object.keys(compact.b).forEach(matchId => {
            const winnerIndex = compact.b[matchId];
            const [p1Idx, p2Idx] = matchId.split('-').map(Number);
            const winner = winnerIndex === 0 ? groupB[p1Idx] : groupB[p2Idx];
            data.groupB[matchId] = winner;
        });
    }
    
    // Decompress knockout predictions
    if (compact.k) {
        if (compact.k.s1 !== undefined) data.knockout.sf1 = compact.k.s1 === 0 ? 'a1' : 'b2';
        if (compact.k.s2 !== undefined) data.knockout.sf2 = compact.k.s2 === 0 ? 'b1' : 'a2';
        if (compact.k.f !== undefined) data.knockout.final = compact.k.f === 0 ? 'sf1' : 'sf2';
    }
    
    // Decompress tiebreakers
    if (compact.ta) {
        Object.keys(compact.ta).forEach(key => {
            const playerIndex = compact.ta[key];
            data.tiebreakers.groupA[key] = groupA[playerIndex];
        });
    }
    
    if (compact.tb) {
        Object.keys(compact.tb).forEach(key => {
            const playerIndex = compact.tb[key];
            data.tiebreakers.groupB[key] = groupB[playerIndex];
        });
    }
    
    return data;
}

// Simple decompression - reverse of simpleCompress
function simpleDecompress(compressed) {
    // Restore base64 padding and convert back
    let padded = compressed.replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4) {
        padded += '=';
    }
    
    let decompressed = atob(padded);
    
    // Reverse the character substitutions
    decompressed = decompressed
        .replace(/f/g, 'false')
        .replace(/t/g, 'true')  
        .replace(/n/g, 'null')
        .replace(/:([0-9]+)/g, '":$1')     // Add quotes back to numeric values
        .replace(/,([^":{}\[\],]+):/g, ',"$1":')  // Add quotes back to object keys
        .replace(/{([^":{}\[\],]+):/g, '{"$1":');   // Add quotes back to first object key
    
    return decompressed;
}

function updateUrlHash() {
    const hash = encodePredictionsToHash();
    if (hash) {
        // Update URL without triggering page reload
        window.history.replaceState(null, null, '#' + hash);
    }
}

function loadPredictionsFromUrl() {
    const hash = window.location.hash;
    const decodedData = decodePredictionsFromHash(hash);
    
    if (decodedData) {
        // Load the predictions
        predictions.groupA = decodedData.groupA || {};
        predictions.groupB = decodedData.groupB || {};
        predictions.knockout = decodedData.knockout || {};
        predictions.tiebreakers = decodedData.tiebreakers || { groupA: {}, groupB: {} };
        
        // Update visual state to match loaded predictions
        updateVisualStateFromPredictions();
        
        return true;
    }
    
    return false;
}

function updateVisualStateFromPredictions() {
    // Update group stage visual selections
    updateGroupVisualSelections('a', predictions.groupA);
    updateGroupVisualSelections('b', predictions.groupB);
    
    // Update knockout stage visual selections
    if (predictions.knockout.sf1) {
        updateKnockoutVisuals('sf1', predictions.knockout.sf1);
    }
    if (predictions.knockout.sf2) {
        updateKnockoutVisuals('sf2', predictions.knockout.sf2);
    }
    if (predictions.knockout.final) {
        updateKnockoutVisuals('final', predictions.knockout.final);
    }
    
    // Recalculate and update everything (don't update URL when loading from URL)
    calculateGroupStandings();
    updateKnockoutStage();
    updateStandings();
}

function updateGroupVisualSelections(groupName, groupPredictions) {
    Object.keys(groupPredictions).forEach(matchId => {
        const winner = groupPredictions[matchId];
        if (winner) {
            updateMatchVisuals(`${groupName}-${matchId}`, winner);
        }
    });
}

// Copy URL functionality
function copyUrlToClipboard() {
    const currentUrl = window.location.href;
    
    if (navigator.clipboard && window.isSecureContext) {
        // Use modern clipboard API
        navigator.clipboard.writeText(currentUrl).then(() => {
            showCopyFeedback('Copied!');
        }).catch(() => {
            fallbackCopyToClipboard(currentUrl);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyToClipboard(currentUrl);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyFeedback('Copied!');
        } else {
            showCopyFeedback('Copy failed');
        }
    } catch (err) {
        showCopyFeedback('Copy not supported');
    }
    
    document.body.removeChild(textArea);
}

function showCopyFeedback(message) {
    const feedback = document.getElementById('copy-feedback');
    feedback.textContent = message;
    feedback.style.opacity = '1';
    
    setTimeout(() => {
        feedback.style.opacity = '0';
    }, 2000);
}

// Clear all predictions and reset to initial state
function clearAllPredictions() {
    // Reset predictions to initial state
    predictions.groupA = {};
    predictions.groupB = {};
    predictions.knockout = {};
    predictions.tiebreakers = { groupA: {}, groupB: {} };
    
    // Reset to default qualified placeholders
    predictions.qualifiedA1 = 'Group A 1st';
    predictions.qualifiedA2 = 'Group A 2nd';
    predictions.qualifiedB1 = 'Group B 1st';
    predictions.qualifiedB2 = 'Group B 2nd';
    
    // Clear all visual selections in group stage
    clearGroupVisualSelections('a');
    clearGroupVisualSelections('b');
    
    // Clear knockout visual selections
    clearKnockoutVisualSelections();
    
    // Clear tiebreaker sections
    clearTiebreakerSections();
    
    // Recalculate and update everything
    calculateGroupStandings();
    updateKnockoutStage();
    updateStandings();
    updateUrlHash();
    
    // Clear URL hash to reset to clean state
    window.history.replaceState(null, null, window.location.pathname);
}

// Clear group stage visual selections
function clearGroupVisualSelections(groupName) {
    const matches = generateRoundRobinMatches(groupName === 'a' ? groupA : groupB);
    matches.forEach(match => {
        const player1Button = document.getElementById(`${groupName}-${match.id}-player1`);
        const player2Button = document.getElementById(`${groupName}-${match.id}-player2`);
        
        if (player1Button) player1Button.classList.remove('selected');
        if (player2Button) player2Button.classList.remove('selected');
    });
}

// Clear knockout visual selections
function clearKnockoutVisualSelections() {
    // Clear semifinal selections
    const sf1A1 = document.getElementById('sf1-a1');
    const sf1B2 = document.getElementById('sf1-b2');
    const sf2B1 = document.getElementById('sf2-b1');
    const sf2A2 = document.getElementById('sf2-a2');
    
    if (sf1A1) sf1A1.classList.remove('selected');
    if (sf1B2) sf1B2.classList.remove('selected');
    if (sf2B1) sf2B1.classList.remove('selected');
    if (sf2A2) sf2A2.classList.remove('selected');
    
    // Clear final selections
    const finalSf1 = document.getElementById('final-sf1');
    const finalSf2 = document.getElementById('final-sf2');
    
    if (finalSf1) finalSf1.classList.remove('selected');
    if (finalSf2) finalSf2.classList.remove('selected');
}

// Clear tiebreaker sections
function clearTiebreakerSections() {
    const groupATiebreakers = document.getElementById('group-a-tiebreakers');
    const groupBTiebreakers = document.getElementById('group-b-tiebreakers');
    
    if (groupATiebreakers) {
        groupATiebreakers.style.display = 'none';
        groupATiebreakers.innerHTML = '';
    }
    
    if (groupBTiebreakers) {
        groupBTiebreakers.style.display = 'none';
        groupBTiebreakers.innerHTML = '';
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeTournament();
    
    // Try to load predictions from URL
    const loaded = loadPredictionsFromUrl();
    
    if (!loaded) {
        // No URL data, start fresh and update standings
        updateStandings();
    }
});
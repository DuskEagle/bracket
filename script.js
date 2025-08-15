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
    updateSummary();
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
            first: `Group ${groupLetter} 1st (incomplete)`,
            second: `Group ${groupLetter} 2nd (incomplete)`
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
        const tiebreakerKey = `group${groupLetter}First`;
        if (predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey]) {
            first = predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey];
            // The loser of the first place tiebreaker should get second place (if it's a 2-way tie)
            if (firstPlaceTied.length === 2) {
                const loser = firstPlaceTied.find(p => p.player !== first);
                second = loser.player;
            } else {
                // More than 2-way tie for first, need to determine second from remaining tied players
                const remainingTied = firstPlaceTied.filter(p => p.player !== first);
                if (remainingTied.length === 1) {
                    second = remainingTied[0].player;
                } else {
                    // Still tied for second among first place losers
                    const tiebreakerKey2 = `group${groupLetter}Second`;
                    if (predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey2]) {
                        second = predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey2];
                    } else {
                        second = `TIE: ${remainingTied.map(p => p.player).join(', ')}`;
                    }
                }
            }
        } else {
            first = `TIE: ${firstPlaceTied.map(p => p.player).join(', ')}`;
            // Can't determine second until first is resolved
            second = `Group ${groupLetter} 2nd (waiting for 1st place tiebreaker)`;
        }
    } else {
        first = standings[0].player;
        
        if (secondPlaceTied.length > 1) {
            // Tie for second place (not involving first place)
            const tiebreakerKey = `group${groupLetter}Second`;
            if (predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey]) {
                second = predictions.tiebreakers[`group${groupLetter}`][tiebreakerKey];
            } else {
                second = `TIE: ${secondPlaceTied.map(p => p.player).join(', ')}`;
            }
        } else {
            second = standings[1].player;
        }
    }
    
    return { first, second };
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
    
    updateSummary();
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
                      !predictions.qualifiedA1.includes('incomplete') && !predictions.qualifiedB2.includes('incomplete');
    
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
                      !predictions.qualifiedB1.includes('incomplete') && !predictions.qualifiedA2.includes('incomplete');
    
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
    
    if (firstPlaceTied.length > 1) {
        tiebreakerHTML += `
            <div class="tiebreaker">
                <h4>Tiebreaker for 1st Place</h4>
                <select id="group${groupLetter}FirstTiebreaker" onchange="updateTiebreaker('group${groupLetter}', 'group${groupLetter}First', this.value)">
                    <option value="">Select 1st place winner</option>
                    ${firstPlaceTied.map(player => `<option value="${player.player}">${player.player}</option>`).join('')}
                </select>
            </div>
        `;
        
        // If more than 2-way tie for first, might need second place tiebreaker among losers
        if (firstPlaceTied.length > 2) {
            const firstWinner = predictions.tiebreakers[`group${groupLetter}`][`group${groupLetter}First`];
            if (firstWinner) {
                const remainingTied = firstPlaceTied.filter(p => p.player !== firstWinner);
                if (remainingTied.length > 1) {
                    tiebreakerHTML += `
                        <div class="tiebreaker">
                            <h4>Tiebreaker for 2nd Place (among remaining tied players)</h4>
                            <select id="group${groupLetter}SecondTiebreaker" onchange="updateTiebreaker('group${groupLetter}', 'group${groupLetter}Second', this.value)">
                                <option value="">Select 2nd place winner</option>
                                ${remainingTied.map(player => `<option value="${player.player}">${player.player}</option>`).join('')}
                            </select>
                        </div>
                    `;
                }
            }
        }
    } else if (secondPlaceTied.length > 1) {
        // Only show second place tiebreaker if first place is not tied
        tiebreakerHTML += `
            <div class="tiebreaker">
                <h4>Tiebreaker for 2nd Place</h4>
                <select id="group${groupLetter}SecondTiebreaker" onchange="updateTiebreaker('group${groupLetter}', 'group${groupLetter}Second', this.value)">
                    <option value="">Select 2nd place winner</option>
                    ${secondPlaceTied.map(player => `<option value="${player.player}">${player.player}</option>`).join('')}
                </select>
            </div>
        `;
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
    updateSummary();
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

// Update predictions summary
function updateSummary() {
    const summaryContent = document.getElementById('summary-content');
    let html = '';
    
    // Group A predictions
    const groupAMatches = generateRoundRobinMatches(groupA);
    groupAMatches.forEach(match => {
        const prediction = predictions.groupA[match.id];
        if (prediction) {
            html += `<div class="summary-item group-a">Group A: ${match.player1} vs ${match.player2} → <strong>${prediction}</strong></div>`;
        }
    });
    
    // Group B predictions
    const groupBMatches = generateRoundRobinMatches(groupB);
    groupBMatches.forEach(match => {
        const prediction = predictions.groupB[match.id];
        if (prediction) {
            html += `<div class="summary-item group-b">Group B: ${match.player1} vs ${match.player2} → <strong>${prediction}</strong></div>`;
        }
    });
    
    // Knockout predictions
    if (predictions.knockout.sf1) {
        const sf1Winner = getSemifinalWinner('sf1');
        html += `<div class="summary-item knockout">Semifinal 1: ${predictions.qualifiedA1} vs ${predictions.qualifiedB2} → <strong>${sf1Winner}</strong></div>`;
    }
    
    if (predictions.knockout.sf2) {
        const sf2Winner = getSemifinalWinner('sf2');
        html += `<div class="summary-item knockout">Semifinal 2: ${predictions.qualifiedB1} vs ${predictions.qualifiedA2} → <strong>${sf2Winner}</strong></div>`;
    }
    
    if (predictions.knockout.final) {
        const finalWinner = predictions.knockout.final === 'sf1' ? getSemifinalWinner('sf1') : getSemifinalWinner('sf2');
        html += `<div class="summary-item knockout">Final: ${getSemifinalWinner('sf1')} vs ${getSemifinalWinner('sf2')} → <strong>${finalWinner}</strong></div>`;
    }
    
    if (html === '') {
        html = '<p>No predictions made yet. Start by making predictions for the group stage matches!</p>';
    }
    
    summaryContent.innerHTML = html;
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
    
    // Initialize summary
    updateSummary();
}

// Run when page loads
document.addEventListener('DOMContentLoaded', initializeTournament);
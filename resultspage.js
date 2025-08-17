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

// Static results - to be updated with actual game results
let results = {
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

// Game links for completed matches
let gameLinks = {
    groupA: {},
    groupB: {},
    knockout: {}
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

// Create match HTML for results (non-interactive)
function createMatchElement(match, groupName) {
    const matchId = `${groupName}-${match.id}`;
    const hasResult = results[`group${groupName.toUpperCase()}`] && results[`group${groupName.toUpperCase()}`][match.id];
    const gameLink = gameLinks[`group${groupName.toUpperCase()}`] && gameLinks[`group${groupName.toUpperCase()}`][match.id];
    
    const matchContent = `
        <div class="match-players">
            <div class="player-button results-only" id="${matchId}-player1">
                <span class="player-name">${match.player1}</span>
                <span class="checkmark">✓</span>
            </div>
            <span class="vs-label">vs</span>
            <div class="player-button results-only" id="${matchId}-player2">
                <span class="player-name">${match.player2}</span>
                <span class="checkmark">✓</span>
            </div>
        </div>
    `;
    
    if (hasResult && gameLink) {
        return `
            <div class="match match-with-link" id="match-${matchId}">
                <a href="${gameLink}" target="_blank" class="match-link">
                    ${matchContent}
                    <div class="game-link-indicator">🔗 View Game</div>
                </a>
            </div>
        `;
    } else {
        return `
            <div class="match" id="match-${matchId}">
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
    
    // Sort by wins (descending), then by losses (ascending)
    return standings.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
    });
}

// Determine qualifiers - simplified for results display
function determineQualifiers(standings, groupLetter) {
    const numPlayers = standings.length;
    const totalMatches = numPlayers * (numPlayers - 1) / 2; // n choose 2
    const predictedMatches = standings.reduce((sum, player) => sum + player.played, 0) / 2;
    
    if (predictedMatches < totalMatches) {
        return {
            first: `Group ${groupLetter} 1st (incomplete)`,
            second: `Group ${groupLetter} 2nd (incomplete)`
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

// Update individual knockout match with link if game exists
function updateKnockoutMatch(matchKey, matchElementId) {
    const matchElement = document.getElementById(matchElementId);
    if (!matchElement) return;
    
    const hasResult = results.knockout[matchKey];
    const gameLink = gameLinks.knockout[matchKey];
    
    if (hasResult) {
        // Update visual selection
        if (matchKey === 'sf1') {
            const sf1A1 = document.getElementById('sf1-a1');
            const sf1B2 = document.getElementById('sf1-b2');
            
            if (results.knockout.sf1 === 'a1' && sf1A1) {
                sf1A1.classList.add('selected');
            } else if (sf1B2) {
                sf1B2.classList.add('selected');
            }
        } else if (matchKey === 'sf2') {
            const sf2B1 = document.getElementById('sf2-b1');
            const sf2A2 = document.getElementById('sf2-a2');
            
            if (results.knockout.sf2 === 'b1' && sf2B1) {
                sf2B1.classList.add('selected');
            } else if (sf2A2) {
                sf2A2.classList.add('selected');
            }
        } else if (matchKey === 'final') {
            const finalSf1 = document.getElementById('final-sf1');
            const finalSf2 = document.getElementById('final-sf2');
            
            if (results.knockout.final === 'sf1' && finalSf1) {
                finalSf1.classList.add('selected');
            } else if (finalSf2) {
                finalSf2.classList.add('selected');
            }
        }
        
        // Add game link if available
        if (gameLink) {
            matchElement.classList.add('match-with-link');
            
            // Check if link indicator already exists
            if (!matchElement.querySelector('.game-link-indicator')) {
                const linkIndicator = document.createElement('div');
                linkIndicator.className = 'game-link-indicator';
                linkIndicator.innerHTML = '🔗 View Game';
                
                const linkWrapper = document.createElement('a');
                linkWrapper.href = gameLink;
                linkWrapper.target = '_blank';
                linkWrapper.className = 'knockout-match-link';
                
                // Wrap the existing content
                const existingContent = matchElement.innerHTML;
                linkWrapper.innerHTML = existingContent + linkIndicator.outerHTML;
                matchElement.innerHTML = linkWrapper.outerHTML;
            }
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
    
    // Show final result if available
    if (results.knockout.final) {
        const finalSf1 = document.getElementById('final-sf1');
        const finalSf2 = document.getElementById('final-sf2');
        
        if (results.knockout.final === 'sf1' && finalSf1) {
            finalSf1.classList.add('selected');
        } else if (finalSf2) {
            finalSf2.classList.add('selected');
        }
    }
}

// Get semifinal winner name
function getSemifinalWinner(semifinal) {
    const result = results.knockout[semifinal];
    
    if (semifinal === 'sf1') {
        if (result === 'a1') return results.qualifiedA1;
        if (result === 'b2') return results.qualifiedB2;
        return 'SF1 Winner';
    } else {
        if (result === 'b1') return results.qualifiedB1;
        if (result === 'a2') return results.qualifiedA2;
        return 'SF2 Winner';
    }
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
    standings.forEach((player, index) => {
        const isQualified = index < 2;
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
async function initializeTournament() {
    // Generate Group A matches
    const groupAMatches = generateRoundRobinMatches(groupA);
    const groupAContainer = document.getElementById('group-a-matches');
    if (groupAContainer) {
        groupAContainer.innerHTML = groupAMatches.map(match => createMatchElement(match, 'a')).join('');
    }
    
    // Generate Group B matches
    const groupBMatches = generateRoundRobinMatches(groupB);
    const groupBContainer = document.getElementById('group-b-matches');
    if (groupBContainer) {
        groupBContainer.innerHTML = groupBMatches.map(match => createMatchElement(match, 'b')).join('');
    }
    
    // Load and display results
    await loadResults();
    
    // Initialize displays
    calculateGroupStandings();
    updateKnockoutStage();
    updateStandings();
    
    // Regenerate matches with results and links
    regenerateMatchesWithResults();
}

// Regenerate match HTML with results and links applied
function regenerateMatchesWithResults() {
    // Regenerate Group A matches
    const groupAMatches = generateRoundRobinMatches(groupA);
    const groupAContainer = document.getElementById('group-a-matches');
    if (groupAContainer) {
        groupAContainer.innerHTML = groupAMatches.map(match => createMatchElement(match, 'a')).join('');
    }
    
    // Regenerate Group B matches
    const groupBMatches = generateRoundRobinMatches(groupB);
    const groupBContainer = document.getElementById('group-b-matches');
    if (groupBContainer) {
        groupBContainer.innerHTML = groupBMatches.map(match => createMatchElement(match, 'b')).join('');
    }
    
    // Update visuals for loaded results
    updateResultVisuals();
}

// Load results from CSV file
async function loadResults() {
    // Always try to load from same origin first (avoids CORS issues)
    const csvUrl = 'results.csv';
    
    console.log(`Loading results from: ${csvUrl}`);
    
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        parseCSVResults(csvText);
    } catch (error) {
        console.error('Error loading results.csv:', error);
        console.log('Continuing with no results...');
    }
    
    // Update visuals for any loaded results
    updateResultVisuals();
}

// Parse CSV results and populate results and gameLinks objects
function parseCSVResults(csvText) {
    const lines = csvText.split('\n').map(line => line.trim());
    let currentSection = 'groupA'; // Start with Group A
    let groupAMatches = generateRoundRobinMatches(groupA);
    let groupBMatches = generateRoundRobinMatches(groupB);
    let matchIndex = 0;
    
    console.log('Parsing CSV with', lines.length, 'lines');
    
    for (const line of lines) {
        // Skip empty lines
        if (!line) continue;
        
        // Check for section headers
        if (line.startsWith('# Group B')) {
            currentSection = 'groupB';
            matchIndex = 0;
            console.log('Switching to Group B');
            continue;
        } else if (line.startsWith('# Semifinals')) {
            currentSection = 'semifinals';
            matchIndex = 0;
            console.log('Switching to Semifinals');
            continue;
        } else if (line.startsWith('# Finals')) {
            currentSection = 'finals';
            matchIndex = 0;
            console.log('Switching to Finals');
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
        
        console.log(`Processing ${currentSection} match ${matchIndex}: ${player1} vs ${player2}, result: ${result}, link: ${gameLink}`);
        
        if (currentSection === 'groupA') {
            if (matchIndex < groupAMatches.length) {
                const match = groupAMatches[matchIndex];
                console.log(`Expected match: ${match.player1} vs ${match.player2}, ID: ${match.id}`);
                
                if (result === 1) {
                    results.groupA[match.id] = match.player1;
                    console.log(`Set Group A result: ${match.id} = ${match.player1}`);
                } else if (result === 2) {
                    results.groupA[match.id] = match.player2;
                    console.log(`Set Group A result: ${match.id} = ${match.player2}`);
                }
                if (gameLink) {
                    gameLinks.groupA[match.id] = gameLink;
                    console.log(`Set Group A link: ${match.id} = ${gameLink}`);
                }
                matchIndex++;
            }
        } else if (currentSection === 'groupB') {
            if (matchIndex < groupBMatches.length) {
                const match = groupBMatches[matchIndex];
                if (result === 1) {
                    results.groupB[match.id] = match.player1;
                } else if (result === 2) {
                    results.groupB[match.id] = match.player2;
                }
                if (gameLink) {
                    gameLinks.groupB[match.id] = gameLink;
                }
                matchIndex++;
            }
        } else if (currentSection === 'semifinals') {
            const sfKey = matchIndex === 0 ? 'sf1' : 'sf2';
            if (result === 1) {
                results.knockout[sfKey] = sfKey === 'sf1' ? 'a1' : 'b1';
            } else if (result === 2) {
                results.knockout[sfKey] = sfKey === 'sf1' ? 'b2' : 'a2';
            }
            if (gameLink) {
                gameLinks.knockout[sfKey] = gameLink;
            }
            matchIndex++;
        } else if (currentSection === 'finals') {
            if (result === 1) {
                results.knockout.final = 'sf1';
            } else if (result === 2) {
                results.knockout.final = 'sf2';
            }
            if (gameLink) {
                gameLinks.knockout.final = gameLink;
            }
        }
    }
    
    console.log('Final results object:', results);
    console.log('Final gameLinks object:', gameLinks);
}

// Update visual display for loaded results
function updateResultVisuals() {
    console.log('Updating result visuals...');
    console.log('Group A results to apply:', results.groupA);
    console.log('Group B results to apply:', results.groupB);
    
    // Update group stage visuals
    updateGroupVisualSelections('a', results.groupA);
    updateGroupVisualSelections('b', results.groupB);
}

// Update group visual selections
function updateGroupVisualSelections(groupName, groupResults) {
    console.log(`Updating ${groupName} visual selections:`, groupResults);
    Object.keys(groupResults).forEach(matchId => {
        const winner = groupResults[matchId];
        if (winner) {
            console.log(`Applying visual for ${groupName}-${matchId}: winner = ${winner}`);
            updateMatchVisuals(`${groupName}-${matchId}`, winner);
        }
    });
}

// Run when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeTournament();
});
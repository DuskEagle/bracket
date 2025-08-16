// Embedded CSV data - edit this string to update results
const csvData = `# Group A
Guanyu Song,Evan Tan,0,
Guanyu Song,Eric Yoder,0,
Guanyu Song,Edward Zhang,0,
Guanyu Song,Daniel Zhou,0,
Guanyu Song,Wanqi Zhu,0,
Evan Tan,Eric Yoder,0,
Evan Tan,Edward Zhang,0,
Evan Tan,Daniel Zhou,0,
Evan Tan,Wanqi Zhu,0,
Eric Yoder,Edward Zhang,0,
Eric Yoder,Daniel Zhou,0,
Eric Yoder,Wanqi Zhu,0,
Edward Zhang,Daniel Zhou,0,
Edward Zhang,Wanqi Zhu,0,
Daniel Zhou,Wanqi Zhu,0,

# Group B
Jeremiah Donley,Qiyou Wu,0,
Jeremiah Donley,Michael Xu,0,
Jeremiah Donley,Aaron Ye,0,
Jeremiah Donley,Henry Zhang,0,
Jeremiah Donley,Yuan Zhou,0,
Qiyou Wu,Michael Xu,0,
Qiyou Wu,Aaron Ye,0,
Qiyou Wu,Henry Zhang,0,
Qiyou Wu,Yuan Zhou,0,
Michael Xu,Aaron Ye,0,
Michael Xu,Henry Zhang,0,
Michael Xu,Yuan Zhou,0,
Aaron Ye,Henry Zhang,0,
Aaron Ye,Yuan Zhou,0,
Henry Zhang,Yuan Zhou,0,

# Semifinals
Group A 1st,Group B 2nd,0,
Group B 1st,Group A 2nd,0,

# Finals
SF1 Winner,SF2 Winner,0,`;

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

// Static results - populated from CSV data
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
    const totalMatches = 15;
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
    
    // Check if all group matches have been played (15 total matches per group)
    const totalMatches = 15;
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
    let groupAMatches = generateRoundRobinMatches(groupA);
    let groupBMatches = generateRoundRobinMatches(groupB);
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
            if (matchIndex < groupAMatches.length) {
                const match = groupAMatches[matchIndex];
                
                if (result === 1) {
                    results.groupA[match.id] = match.player1;
                } else if (result === 2) {
                    results.groupA[match.id] = match.player2;
                }
                if (gameLink) {
                    gameLinks.groupA[match.id] = gameLink;
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
}

// Initialization is now handled by the HTML page after script loads
// (No automatic DOMContentLoaded listener to avoid timing conflicts)

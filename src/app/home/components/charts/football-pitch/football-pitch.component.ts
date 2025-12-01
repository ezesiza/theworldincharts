import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

interface Player {
  x: number;
  y: number;
  lab?: string;
  originalX?: number;
  originalY?: number;
  targetX?: number;
  targetY?: number;
  speed?: number;
  direction?: number;
  team?: 'team1' | 'team2';
  position?: 'gk' | 'def' | 'mid' | 'fwd';
  isBall?: boolean;
  hasBall?: boolean;
  ballDirection?: number;
}

interface PitchMarking {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

@Component({
  selector: 'football-pitch',
  // standalone: true,
  // imports: [CommonModule],
  templateUrl: './football-pitch.component.html',
  styleUrl: './football-pitch.component.less'
})
export class FootballPitchComponent implements AfterViewInit {
  @ViewChild('pitchContainer', { static: true }) pitchContainer!: ElementRef;

  private width = 1060;
  private height = 670;
  is3DView = false;
  isAnimating = false;
  isPaused = false;
  showHeatmap = false;
  showLegend = true;
  private animationInterval: any;
  private svg: any;
  private players: Player[] = [];
  private playerCircles: any;
  private heatmapData: { x: number; y: number; intensity: number }[] = [];
  private heatmapLayer: any;
  private highlightedPlayers: Set<number> = new Set();

  ngAfterViewInit(): void {
    // Add a small delay to ensure DOM is fully ready
    setTimeout(() => {
      this.createFootballPitch();
    }, 100);
  }

  private createFootballPitch(): void {
    const container = this.pitchContainer.nativeElement;
    console.log('Creating football pitch, container:', container);

    // Clear any existing content
    d3.select(container).selectAll('*').remove();

    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height])
      .attr('stroke-width', 1.5)
      .style('background-color', '#4a7c59');

    console.log('SVG created with dimensions:', this.width, 'x', this.height);

    // Player data with original positions and movement properties
    this.players = [
      // Team 1 (Left side)
      { x: 60, y: 330, lab: 'GK1', originalX: 60, originalY: 330, speed: 0.5, direction: 0, team: 'team1', position: 'gk', hasBall: false }, // T1:GK
      { x: 250, y: 70, originalX: 250, originalY: 70, speed: 1.2, direction: 0, team: 'team1', position: 'def', hasBall: false },
      { x: 250, y: 600, originalX: 250, originalY: 600, speed: 1.2, direction: 0, team: 'team1', position: 'def', hasBall: false }, // T1:FBs
      { x: 220, y: 240, originalX: 220, originalY: 240, speed: 0.8, direction: 0, team: 'team1', position: 'def', hasBall: false },
      { x: 220, y: 420, originalX: 220, originalY: 420, speed: 0.8, direction: 0, team: 'team1', position: 'def', hasBall: false }, // T1:CBs
      { x: 320, y: 220, originalX: 320, originalY: 220, speed: 1.5, direction: 0, team: 'team1', position: 'mid', hasBall: false },
      { x: 320, y: 440, originalX: 320, originalY: 440, speed: 1.5, direction: 0, team: 'team1', position: 'mid', hasBall: false },
      { x: 380, y: 330, originalX: 380, originalY: 330, speed: 1.8, direction: 0, team: 'team1', position: 'mid', hasBall: false }, // T1:CMs
      { x: 460, y: 50, originalX: 460, originalY: 50, speed: 2.0, direction: 0, team: 'team1', position: 'fwd', hasBall: false },
      { x: 460, y: 620, originalX: 460, originalY: 620, speed: 2.0, direction: 0, team: 'team1', position: 'fwd', hasBall: false },
      { x: 500, y: 330, originalX: 500, originalY: 330, speed: 2.2, direction: 0, team: 'team1', position: 'fwd', hasBall: false }, // T1:FWDs 

      // Team 2 (Right side)
      { x: 1000, y: 330, lab: 'GK2', originalX: 1000, originalY: 330, speed: 0.5, direction: 0, team: 'team2', position: 'gk', hasBall: false }, // T2:GK
      { x: 810, y: 70, originalX: 810, originalY: 70, speed: 1.2, direction: 0, team: 'team2', position: 'def', hasBall: false },
      { x: 810, y: 600, originalX: 810, originalY: 600, speed: 1.2, direction: 0, team: 'team2', position: 'def', hasBall: false }, // T2:FBs
      { x: 840, y: 240, originalX: 840, originalY: 240, speed: 0.8, direction: 0, team: 'team2', position: 'def', hasBall: false },
      { x: 840, y: 420, originalX: 840, originalY: 420, speed: 0.8, direction: 0, team: 'team2', position: 'def', hasBall: false }, // T2:CBs
      { x: 740, y: 220, originalX: 740, originalY: 220, speed: 1.5, direction: 0, team: 'team2', position: 'mid', hasBall: false },
      { x: 740, y: 440, originalX: 740, originalY: 440, speed: 1.5, direction: 0, team: 'team2', position: 'mid', hasBall: false },
      { x: 680, y: 330, originalX: 680, originalY: 330, speed: 1.8, direction: 0, team: 'team2', position: 'mid', hasBall: false }, // T2:CMs
      { x: 600, y: 50, originalX: 600, originalY: 50, speed: 2.0, direction: 0, team: 'team2', position: 'fwd', hasBall: false },
      { x: 600, y: 620, originalX: 600, originalY: 620, speed: 2.0, direction: 0, team: 'team2', position: 'fwd', hasBall: false },
      { x: 560, y: 330, originalX: 560, originalY: 330, speed: 2.2, direction: 0, team: 'team2', position: 'fwd', hasBall: false }, // T2:FWDs

      // Ball
      { x: 538, y: 330, originalX: 538, originalY: 330, speed: 3.0, direction: 0, isBall: true, hasBall: false } // ball 
    ];

    const teamColours = [
      '#2E8B57', '#db0007', '#db0007', '#db0007', '#db0007', '#db0007', '#db0007', '#db0007',
      '#db0007', '#db0007', '#db0007', '#2E8B57', '#034694', '#034694', '#034694', '#034694',
      '#034694', '#034694', '#034694', '#034694', '#034694', '#034694', 'white'
    ];

    const circleRadius = [
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6
    ];

    // Pitch markings
    const pitchMarkings: PitchMarking[] = [
      { x1: 5, x2: 1055, y1: 5, y2: 5 }, // top left corner : pitch
      { x1: 1055, x2: 1055, y1: 5, y2: 655 }, // top right corner : pitch
      { x1: 1055, x2: 5, y1: 655, y2: 655 }, // bottom right corner : pitch
      { x1: 5, x2: 5, y1: 655, y2: 5 }, // bottom left corner : pitch
      { x1: 530, x2: 530, y1: 5, y2: 655 }, // half way line
      { x1: 1, x2: 1, y1: 293, y2: 367 }, // left goal 
      { x1: 1059, x2: 1059, y1: 293, y2: 367 }, // right goal 
      // left 18 yard box 
      { x1: 5, x2: 170, y1: 129, y2: 129 },
      { x1: 170, x2: 170, y1: 129, y2: 531 },
      { x1: 170, x2: 5, y1: 531, y2: 531 },
      // right 18 yard box 
      { x1: 1055, x2: 890, y1: 129, y2: 129 },
      { x1: 890, x2: 890, y1: 129, y2: 531 },
      { x1: 890, x2: 1055, y1: 531, y2: 531 },
      // left 6 yard box 
      { x1: 5, x2: 60, y1: 239, y2: 239 },
      { x1: 60, x2: 60, y1: 239, y2: 421 },
      { x1: 60, x2: 5, y1: 421, y2: 421 },
      // right 6 yard box 
      { x1: 1055, x2: 995, y1: 239, y2: 239 },
      { x1: 995, x2: 995, y1: 239, y2: 421 },
      { x1: 995, x2: 1055, y1: 421, y2: 421 }
    ];

    // Draw pitch markings
    this.svg.selectAll('line')
      .data(pitchMarkings)
      .join('line')
      .attr('x1', (d: PitchMarking) => d.x1)
      .attr('x2', (d: PitchMarking) => d.x2)
      .attr('y1', (d: PitchMarking) => d.y1)
      .attr('y2', (d: PitchMarking) => d.y2)
      .attr('stroke', 'white')
      .attr('stroke-width', 3);

    // Draw center circle
    this.svg.append('circle')
      .attr('cx', 530)
      .attr('cy', 330)
      .attr('r', 80)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 3);

    // Draw center spot
    this.svg.append('circle')
      .attr('cx', 530)
      .attr('cy', 330)
      .attr('r', 3)
      .attr('fill', 'white');

    // Create heatmap layer
    this.createHeatmapLayer();

    // Create drag behavior
    const self = this;
    const drag = d3.drag<SVGCircleElement, Player>()
      .on('start', function (event, d) {
        d3.select(this).raise().attr('stroke', 'black');
        d3.select(this).style('stroke-dasharray', '10,3');
      })
      .on('drag', function (event, d) {
        d.x = event.x;
        d.y = event.y;
        d3.select(this).attr('cx', d.x).attr('cy', d.y);

        // Update corresponding label if it exists
        if (d.lab) {
          self.svg.selectAll('text.player-label')
            .filter((labelData: Player) => labelData === d)
            .attr('x', d.x)
            .attr('y', d.y + 4);
        }
      })
      .on('end', function (event, d) {
        d3.select(this).attr('stroke', 'black');
        d3.select(this).style('stroke-dasharray', '1000,3000');
      });

    // Draw players
    this.playerCircles = this.svg.selectAll('circle.player')
      .data(this.players)
      .join('circle')
      .attr('class', 'player')
      .attr('cx', (d: Player) => d.x)
      .attr('cy', (d: Player) => d.y)
      .attr('r', (d: Player, i: number) => circleRadius[i])
      .attr('fill', (d: Player, i: number) => teamColours[i])
      .attr('stroke', 'black')
      .attr('stroke-width', 3);

    console.log('Players rendered:', this.playerCircles.size());

    // Apply drag behavior to player circles
    this.playerCircles.call(drag as any);

    // Add player labels
    this.svg.selectAll('text.player-label')
      .data(this.players.filter((d: Player) => d.lab))
      .join('text')
      .attr('class', 'player-label')
      .attr('x', (d: Player) => d.x)
      .attr('y', (d: Player) => d.y + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text((d: Player) => d.lab);
  }

  // Toggle between 2D and 3D view
  toggle3DView(): void {
    this.is3DView = !this.is3DView;
    const container = this.pitchContainer.nativeElement;

    if (this.is3DView) {
      container.style.transform = 'perspective(1000px) rotateX(15deg) rotateY(-5deg)';
      container.style.transformOrigin = 'center center';
      container.style.transition = 'transform 0.5s ease-in-out';
    } else {
      container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  }

  // Toggle animation on/off
  toggleAnimation(): void {
    this.isAnimating = !this.isAnimating;
    this.isPaused = false; // Reset pause state when starting/stopping

    if (this.isAnimating) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }

  // Pause/resume animation
  togglePause(): void {
    if (!this.isAnimating) {
      return; // Can't pause if animation isn't running
    }

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.pauseAnimation();
    } else {
      this.resumeAnimation();
    }
  }

  // Pause the animation
  private pauseAnimation(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  // Resume the animation
  private resumeAnimation(): void {
    if (this.isAnimating && !this.isPaused) {
      this.animationInterval = setInterval(() => {
        this.updatePlayerPositions();
      }, 100);
    }
  }

  // Toggle heatmap visibility
  toggleHeatmap(): void {
    this.showHeatmap = !this.showHeatmap;

    if (this.heatmapLayer) {
      this.heatmapLayer.style('opacity', this.showHeatmap ? 0.3 : 0);
    }
  }

  // Toggle legend visibility
  toggleLegend(): void {
    this.showLegend = !this.showLegend;
  }

  // Highlight players by team and position
  highlightPlayers(team: 'team1' | 'team2', position: 'gk' | 'def' | 'mid' | 'fwd'): void {
    this.resetHighlights();

    this.players.forEach((player, index) => {
      if (player.team === team && player.position === position && !player.isBall) {
        this.highlightedPlayers.add(index);
      }
    });

    this.updatePlayerHighlights();
  }

  // Reset all highlights
  resetHighlights(): void {
    this.highlightedPlayers.clear();
    this.updatePlayerHighlights();
  }

  // Update visual highlights for players
  private updatePlayerHighlights(): void {
    if (!this.playerCircles) return;

    this.playerCircles
      .style('stroke-width', (d: Player, i: number) =>
        this.highlightedPlayers.has(i) ? 6 : 3)
      .style('filter', (d: Player, i: number) =>
        this.highlightedPlayers.has(i) ? 'brightness(1.3) drop-shadow(0 0 8px rgba(255, 255, 0, 0.8))' : 'none');
  }

  // Simulate corner kick
  simulateCorner(): void {
    const ball = this.players.find(p => p.isBall);
    if (!ball) return;

    // Position ball at corner (randomly choose which corner)
    const corners = [
      { x: 20, y: 20 },   // Top left
      { x: 20, y: 650 },  // Bottom left
      { x: 1040, y: 20 }, // Top right
      { x: 1040, y: 650 } // Bottom right
    ];

    const randomCorner = corners[Math.floor(Math.random() * corners.length)];
    ball.x = randomCorner.x;
    ball.y = randomCorner.y;

    this.updatePlayerDisplay();
    this.showCornerAnimation(randomCorner);
  }

  // Simulate penalty kick
  simulatePenalty(): void {
    const ball = this.players.find(p => p.isBall);
    if (!ball) return;

    // Position ball at penalty spot
    const penaltySpots = [
      { x: 200, y: 330 },  // Left penalty spot
      { x: 860, y: 330 }   // Right penalty spot
    ];

    const randomPenalty = penaltySpots[Math.floor(Math.random() * penaltySpots.length)];
    ball.x = randomPenalty.x;
    ball.y = randomPenalty.y;

    this.updatePlayerDisplay();
    this.showPenaltyAnimation(randomPenalty);
  }

  // Simulate free kick
  simulateFreeKick(): void {
    const ball = this.players.find(p => p.isBall);
    if (!ball) return;

    // Position ball at a random free kick position
    const freeKickPositions = [
      { x: 300, y: 200 },  // Left side
      { x: 300, y: 460 },  // Left side
      { x: 760, y: 200 },  // Right side
      { x: 760, y: 460 }   // Right side
    ];

    const randomFreeKick = freeKickPositions[Math.floor(Math.random() * freeKickPositions.length)];
    ball.x = randomFreeKick.x;
    ball.y = randomFreeKick.y;

    this.updatePlayerDisplay();
    this.showFreeKickAnimation(randomFreeKick);
  }

  // Show corner kick animation
  private showCornerAnimation(position: { x: number; y: number }): void {
    const cornerMarker = this.svg.append('circle')
      .attr('cx', position.x)
      .attr('cy', position.y)
      .attr('r', 15)
      .attr('fill', 'none')
      .attr('stroke', '#FFD700')
      .attr('stroke-width', 4)
      .style('opacity', 1);

    cornerMarker.transition()
      .duration(2000)
      .attr('r', 30)
      .style('opacity', 0)
      .remove();
  }

  // Show penalty kick animation
  private showPenaltyAnimation(position: { x: number; y: number }): void {
    const penaltyMarker = this.svg.append('circle')
      .attr('cx', position.x)
      .attr('cy', position.y)
      .attr('r', 10)
      .attr('fill', '#FF6B6B')
      .attr('stroke', '#FF0000')
      .attr('stroke-width', 3)
      .style('opacity', 1);

    penaltyMarker.transition()
      .duration(1500)
      .attr('r', 25)
      .style('opacity', 0)
      .remove();
  }

  // Show free kick animation
  private showFreeKickAnimation(position: { x: number; y: number }): void {
    const freeKickMarker = this.svg.append('circle')
      .attr('cx', position.x)
      .attr('cy', position.y)
      .attr('r', 12)
      .attr('fill', '#4ECDC4')
      .attr('stroke', '#45B7AA')
      .attr('stroke-width', 3)
      .style('opacity', 1);

    freeKickMarker.transition()
      .duration(1800)
      .attr('r', 28)
      .style('opacity', 0)
      .remove();
  }

  // Start player animation
  private startAnimation(): void {
    // Initialize strategic targets for each player
    this.players.forEach(player => {
      if (player.originalX !== undefined && player.originalY !== undefined && !player.isBall) {
        player.targetX = player.originalX;
        player.targetY = player.originalY;
      }
    });

    this.animationInterval = setInterval(() => {
      this.updatePlayerPositions();
    }, 100); // Update every 50ms for smooth animation
  }

  // Stop animation and reset to original positions
  private stopAnimation(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }

    // Reset pause state
    this.isPaused = false;

    // Reset players to original positions
    this.players.forEach(player => {
      if (player.originalX !== undefined && player.originalY !== undefined) {
        player.x = player.originalX;
        player.y = player.originalY;
        player.targetX = player.originalX;
        player.targetY = player.originalY;
        player.hasBall = false;
        player.ballDirection = 0;
      }
    });

    // Clear heatmap data
    this.heatmapData = [];
    this.updateHeatmapVisualization();

    this.updatePlayerDisplay();
  }

  // Update player positions during animation
  private updatePlayerPositions(): void {
    // Check for ball kick interactions
    this.checkBallKickInteractions();

    // Get ball position for strategic calculations
    const ball = this.players.find(p => p.isBall);
    if (!ball) return;

    // Update ball position (either random or following player)
    this.updateBallPosition();

    // Update each player's strategic position
    this.players.forEach(player => {
      if (player.isBall || !player.targetX || !player.targetY || !player.speed) return;

      // Calculate strategic target based on ball position and team tactics
      this.calculateStrategicTarget(player, ball);

      // Move towards target
      const dx = player.targetX - player.x;
      const dy = player.targetY - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 2) {
        const moveDistance = player.speed;
        const moveX = (dx / distance) * moveDistance;
        const moveY = (dy / distance) * moveDistance;

        player.x += moveX;
        player.y += moveY;
      }
    });

    // Update heatmap data
    this.updateHeatmapData();

    this.updatePlayerDisplay();
  }

  // Update ball position with random movement or following player
  private updateBallPosition(): void {
    const ball = this.players.find(p => p.isBall);
    if (!ball) return;

    // Check if any player has the ball
    const playerWithBall = this.players.find(p => p.hasBall && !p.isBall);

    if (playerWithBall) {
      // Ball follows the player
      ball.x = playerWithBall.x;
      ball.y = playerWithBall.y;
    } else {
      // Random ball movement with some bias towards center
      const centerX = this.width / 2;
      const centerY = this.height / 2;

      const ballSpeed = ball.speed || 3.0;
      const randomX = (Math.random() - 0.5) * ballSpeed * 2;
      const randomY = (Math.random() - 0.5) * ballSpeed * 2;

      // Slight bias towards center to keep ball in play
      const centerBiasX = (centerX - ball.x) * 0.01;
      const centerBiasY = (centerY - ball.y) * 0.01;

      ball.x += randomX + centerBiasX;
      ball.y += randomY + centerBiasY;

      // Keep ball within pitch bounds
      ball.x = Math.max(20, Math.min(this.width - 20, ball.x));
      ball.y = Math.max(20, Math.min(this.height - 20, ball.y));
    }
  }

  // Calculate strategic target position for each player
  private calculateStrategicTarget(player: Player, ball: Player): void {
    if (!player.originalX || !player.originalY) return;

    const ballX = ball.x;
    const ballY = ball.y;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Special behavior for players with the ball
    if (player.hasBall) {
      // Player with ball moves towards opponent's goal
      if (player.team === 'team1') {
        player.targetX = Math.min(this.width - 50, player.x + 3); // Move right
      } else {
        player.targetX = Math.max(50, player.x - 3); // Move left
      }
      player.targetY = player.y + (Math.random() - 0.5) * 2; // Slight vertical movement
      return;
    }

    // Determine which side of the pitch the ball is on
    const ballOnLeftSide = ballX < centerX;
    const ballOnRightSide = ballX > centerX;

    // Base position adjustments
    let targetX = player.originalX;
    let targetY = player.originalY;

    if (player.team === 'team1') {
      // Team 1 (left side) tactics
      if (ballOnLeftSide) {
        // Ball on our side - defensive formation
        targetX = player.originalX - 30; // Move back
        if (player.position === 'fwd') {
          targetX = player.originalX - 60; // Forwards drop deeper
        }
      } else {
        // Ball on opposition side - attacking formation
        targetX = player.originalX + 40; // Move forward
        if (player.position === 'def') {
          targetX = player.originalX + 20; // Defenders move up slightly
        } else if (player.position === 'fwd') {
          targetX = player.originalX + 80; // Forwards push high
        }
      }
    } else if (player.team === 'team2') {
      // Team 2 (right side) tactics
      if (ballOnRightSide) {
        // Ball on our side - defensive formation
        targetX = player.originalX + 30; // Move back
        if (player.position === 'fwd') {
          targetX = player.originalX + 60; // Forwards drop deeper
        }
      } else {
        // Ball on opposition side - attacking formation
        targetX = player.originalX - 40; // Move forward
        if (player.position === 'def') {
          targetX = player.originalX - 20; // Defenders move up slightly
        } else if (player.position === 'fwd') {
          targetX = player.originalX - 80; // Forwards push high
        }
      }
    }

    // Add vertical movement based on ball position
    const ballVerticalOffset = (ballY - centerY) * 0.3;
    targetY = player.originalY + ballVerticalOffset;

    // Add some randomness for more realistic movement
    const randomOffsetX = (Math.random() - 0.5) * 20;
    const randomOffsetY = (Math.random() - 0.5) * 20;

    targetX += randomOffsetX;
    targetY += randomOffsetY;

    // Keep within pitch bounds
    player.targetX = Math.max(20, Math.min(this.width - 20, targetX));
    player.targetY = Math.max(20, Math.min(this.height - 20, targetY));
  }

  // Check for ball kick interactions
  private checkBallKickInteractions(): void {
    const ball = this.players.find(p => p.isBall);
    if (!ball) return;

    // Find players near the ball
    const kickDistance = 30; // Distance threshold for kicking
    const playersNearBall = this.players.filter(player => {
      if (player.isBall) return false;
      const distance = Math.sqrt((player.x - ball.x) ** 2 + (player.y - ball.y) ** 2);
      return distance <= kickDistance;
    });

    // If a forward player is near the ball, they kick it
    const forwardNearBall = playersNearBall.find(p => p.position === 'fwd');
    if (forwardNearBall && !forwardNearBall.hasBall) {
      this.kickBall(forwardNearBall, ball);
    }
  }

  // Handle ball kick by forward player
  private kickBall(player: Player, ball: Player): void {
    // Player gets the ball
    player.hasBall = true;

    // Calculate kick direction (towards opponent's goal)
    const kickDirection = player.team === 'team1' ? 1 : -1; // 1 for right, -1 for left
    const kickPower = 5.0;

    // Set ball direction
    ball.ballDirection = kickDirection;

    // Move ball in kick direction
    ball.x += kickDirection * kickPower;
    ball.y += (Math.random() - 0.5) * 2; // Add some randomness

    // Keep ball within bounds
    ball.x = Math.max(20, Math.min(this.width - 20, ball.x));
    ball.y = Math.max(20, Math.min(this.height - 20, ball.y));

    // Release ball after a short time
    setTimeout(() => {
      player.hasBall = false;
    }, 2000); // Hold ball for 2 seconds
  }

  // Create heatmap layer
  private createHeatmapLayer(): void {
    this.heatmapLayer = this.svg.append('g')
      .attr('class', 'heatmap-layer')
      .style('opacity', 0); // Start hidden
  }

  // Update heatmap data with player positions
  private updateHeatmapData(): void {
    // Add current positions to heatmap data
    this.players.forEach(player => {
      if (!player.isBall) {
        this.heatmapData.push({
          x: player.x,
          y: player.y,
          intensity: 1
        });
      }
    });

    // Limit heatmap data size to prevent memory issues
    if (this.heatmapData.length > 1000) {
      this.heatmapData = this.heatmapData.slice(-500); // Keep last 500 points
    }

    // Update heatmap visualization
    this.updateHeatmapVisualization();
  }

  // Update heatmap visualization
  private updateHeatmapVisualization(): void {
    if (!this.showHeatmap) return;

    // Clear existing heatmap
    this.heatmapLayer.selectAll('circle').remove();

    // Create heatmap circles
    this.heatmapLayer.selectAll('circle.heatmap-point')
      .data(this.heatmapData)
      .join('circle')
      .attr('class', 'heatmap-point')
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', 8)
      .attr('fill', 'rgba(255, 0, 0, 0.1)')
      .attr('stroke', 'rgba(255, 0, 0, 0.3)')
      .attr('stroke-width', 1);
  }

  // Update the visual display of players
  private updatePlayerDisplay(): void {
    this.playerCircles
      .attr('cx', (d: Player) => d.x)
      .attr('cy', (d: Player) => d.y);

    // Update labels
    this.svg.selectAll('text.player-label')
      .attr('x', (d: Player) => d.x)
      .attr('y', (d: Player) => d.y + 4);
  }
}

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

interface MLData {
  channel: string;
  importance: number;
  confidence: number;
}

interface ShapleyData {
  channel: string;
  shapley: number;
  marginal: number;
}

interface MarkovData {
  source: string;
  target: string;
  probability: number;
}

interface CustomData {
  position: string;
  weight: number;
}

interface NodeData {
  id: string;
  x: number;
  y: number;
}

interface ChannelInsights {
  conversionRate: number;
  ctr: number;
  cpa: number;
  rpc: number;
  firstTouchRate: number;
  lastTouchRate: number;
  assistedConversions: number;
  timeToConversion: number;
  recommendations: Recommendation[];
}

interface Recommendation {
  title: string;
  description: string;
  impact: string;
}

interface ShapleyInsights {
  efficiencyScore: number;
  stabilityIndex: number;
  coreStability: number;
  nucleolusDistance: number;
  bargainingPower: number;
  coalitionEfficiency: number;
  gameTheoryInsights: GameTheoryInsight[];
}

interface GameTheoryInsight {
  title: string;
  description: string;
  impact: string;
}

interface CustomModelInsights {
  accuracy: number;
  predictionError: number;
  rSquared: number;
  crossValidationScore: number;
  vsLastTouch: number;
  vsFirstTouch: number;
  vsLinear: number;
  vsDataDriven: number;
  optimizationSuggestions: OptimizationSuggestion[];
}

interface OptimizationSuggestion {
  title: string;
  description: string;
  improvement: string;
}

@Component({
  selector: 'app-attribution-model-dashboard',
  templateUrl: './attribution-model-dashboard.component.html',
  styleUrls: ['./attribution-model-dashboard.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class AttributionModelDashboardComponent implements OnInit, OnDestroy {
  // Data properties
  mlData: MLData[] = [];
  shapleyData: ShapleyData[] = [];
  markovData: MarkovData[] = [];
  customData: CustomData[] = [];

  // UI state properties
  mlAccuracy = '87.3%';
  mlEpochs = 150;
  coalitionCount = 32;
  fairnessIndex = 0.94;
  matrixSize = '8x8';
  convergenceRate = 0.89;

  // Custom model weights
  firstTouchWeight = 40;
  middleTouchWeight = 20;
  lastTouchWeight = 40;

  // Fullscreen state
  isMarkovFullscreen = false;

  // Drill-down state
  selectedChannel: string | null = null;
  selectedChannelData: ChannelInsights | null = null;

  // Shapley drill-down state
  showShapleyModal = false;
  shapleyInsights: ShapleyInsights | null = null;

  // Custom Model drill-down state
  showCustomModal = false;
  customModelData: CustomModelInsights | null = null;

  // Training interval
  private trainingInterval: any;

  ngOnInit(): void {
    this.initializeVisualizations();
  }

  ngOnDestroy(): void {
    if (this.trainingInterval) {
      clearInterval(this.trainingInterval);
    }
  }

  initializeVisualizations(): void {
    this.generateMLModel();
    this.calculateShapley();
    this.buildMarkovChain();
    this.updateCustomModel();
  }

  // Data-Driven Attribution ML Model
  generateMLModel(): void {
    const channels = ['Email', 'Social', 'Search', 'Display', 'Direct', 'Referral'];
    this.mlData = channels.map(channel => ({
      channel: channel,
      importance: Math.random() * 0.8 + 0.1,
      confidence: Math.random() * 0.3 + 0.7
    }));

    setTimeout(() => {
      this.renderMLChart();
    }, 100);
  }

  private renderMLChart(): void {
    const container = d3.select("#data-driven-chart");
    container.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = 500 - margin.left - margin.right;
    const height = 250 - margin.bottom - margin.top;

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(this.mlData.map(d => d.channel))
      .range([0, height])
      .padding(0.2);

    // Create bars with click handlers
    g.selectAll(".bar")
      .data(this.mlData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d: any) => y(d.channel))
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("fill", "#4299e1")
      .attr("opacity", 0.8)
      .style("cursor", "pointer")
      .on("click", (event: any, d: any) => this.showChannelDrillDown(d.channel))
      .on("mouseover", function (event: any, d: any) {
        d3.select(this).attr("opacity", 1).attr("fill", "#3182ce");
      })
      .on("mouseout", function (event: any, d: any) {
        d3.select(this).attr("opacity", 0.8).attr("fill", "#4299e1");
      })
      .transition()
      .duration(1000)
      .attr("width", (d: any) => x(d.importance));

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format(".0%") as any));

    g.append("g")
      .call(d3.axisLeft(y));

    // Add labels
    g.selectAll(".label")
      .data(this.mlData)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", (d: any) => x(d.importance) + 5)
      .attr("y", (d: any) => y(d.channel) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "#4a5568")
      .text((d: any) => `${(d.importance * 100).toFixed(1)}%`);
  }

  trainModel(): void {
    let epochs = 0;
    const maxEpochs = 200;

    if (this.trainingInterval) {
      clearInterval(this.trainingInterval);
    }

    this.trainingInterval = setInterval(() => {
      epochs += 5;
      this.mlEpochs = epochs;

      const accuracy = Math.min(95, 75 + (epochs / maxEpochs) * 20);
      this.mlAccuracy = accuracy.toFixed(1) + '%';

      if (epochs >= maxEpochs) {
        clearInterval(this.trainingInterval);
        this.generateMLModel(); // Refresh visualization
      }
    }, 100);
  }

  // Shapley Value Attribution
  calculateShapley(): void {
    const channels = ['Email', 'Social', 'Search', 'Display', 'Direct'];
    this.shapleyData = channels.map(channel => ({
      channel: channel,
      shapley: Math.random() * 0.4 + 0.1,
      marginal: Math.random() * 0.3 + 0.05
    }));

    setTimeout(() => {
      this.renderShapleyChart();
    }, 100);
  }

  private renderShapleyChart(): void {
    const container = d3.select("#shapley-chart");
    container.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 80 };
    const width = 500 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(this.shapleyData, (d: any) => d.shapley)])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(this.shapleyData.map((d: any) => d.channel))
      .range([0, height])
      .padding(0.1);

    // Create Shapley bars
    g.selectAll(".shapley-bar")
      .data(this.shapleyData)
      .enter().append("rect")
      .attr("class", "shapley-bar")
      .attr("x", 0)
      .attr("y", (d: any) => y(d.channel))
      .attr("width", 0)
      .attr("height", y.bandwidth() / 2)
      .attr("fill", "#48bb78")
      .transition()
      .duration(1000)
      .delay((d: any, i: number) => i * 100)
      .attr("width", (d: any) => x(d.shapley));

    // Create marginal contribution bars
    g.selectAll(".marginal-bar")
      .data(this.shapleyData)
      .enter().append("rect")
      .attr("class", "marginal-bar")
      .attr("x", 0)
      .attr("y", (d: any) => y(d.channel) + y.bandwidth() / 2)
      .attr("width", 0)
      .attr("height", y.bandwidth() / 2)
      .attr("fill", "#68d391")
      .attr("opacity", 0.7)
      .transition()
      .duration(1000)
      .delay((d: any, i: number) => i * 100)
      .attr("width", (d: any) => x(d.marginal));

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y));
  }

  showCoalitions(): void {
    this.coalitionCount = Math.floor(Math.random() * 20) + 20;
    this.fairnessIndex = Number((Math.random() * 0.1 + 0.9).toFixed(2));
    this.calculateShapley(); // Refresh with new data
  }

  // Markov Chain Attribution
  buildMarkovChain(): void {
    const states = ['Start', 'Email', 'Social', 'Search', 'Display', 'Conversion'];
    this.markovData = [];

    // Create sample transition data
    for (let i = 0; i < states.length; i++) {
      for (let j = 0; j < states.length; j++) {
        if (i !== j) {
          this.markovData.push({
            source: states[i],
            target: states[j],
            probability: Math.random() * 0.3 + 0.05
          });
        }
      }
    }

    setTimeout(() => {
      this.visualizeMarkovChain();
      this.updateMarkovJourney();
    }, 100);
  }

  private visualizeMarkovChain(): void {
    const container = d3.select("#markov-chart");
    container.selectAll("*").remove();

    const width = 500;
    const height = 250;

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);

    const states = ['Start', 'Email', 'Social', 'Search', 'Display', 'Conversion'];
    const nodeData: NodeData[] = states.map((state, i) => ({
      id: state,
      x: (width / (states.length + 1)) * (i + 1),
      y: height / 2 + (i % 2 === 0 ? -30 : 30)
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodeData)
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Add links
    const links = svg.selectAll(".link")
      .data(this.markovData.filter((d: any) => d.probability > 0.15))
      .enter().append("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-width", (d: any) => d.probability * 10)
      .attr("opacity", 0.6);

    // Add nodes
    const nodes = svg.selectAll(".node")
      .data(nodeData)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 20)
      .attr("fill", (d: any, i: number) => d3.schemeCategory10[i])
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Add labels
    const labels = svg.selectAll(".node-label")
      .data(nodeData)
      .enter().append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text((d: any) => d.id.substr(0, 4));

    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => nodeData.find(n => n.id === d.source)?.x || 0)
        .attr("y1", (d: any) => nodeData.find(n => n.id === d.source)?.y || 0)
        .attr("x2", (d: any) => nodeData.find(n => n.id === d.target)?.x || 0)
        .attr("y2", (d: any) => nodeData.find(n => n.id === d.target)?.y || 0);

      nodes
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });
  }

  private updateMarkovJourney(): void {
    const journeyContainer = d3.select("#markov-journey");
    journeyContainer.selectAll("*").remove();

    const journey = ['Email', 'Social', 'Search', 'Display', 'Conversion'];
    const colors = ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce'];

    journey.forEach((step, i) => {
      if (i > 0) {
        journeyContainer.append("div")
          .attr("class", "arrow")
          .html("→");
      }

      journeyContainer.append("div")
        .attr("class", "touchpoint")
        .style("background", colors[i])
        .text(step);
    });
  }

  simulateJourneys(): void {
    this.matrixSize = Math.floor(Math.random() * 5 + 6) + 'x' + Math.floor(Math.random() * 5 + 6);
    this.convergenceRate = Number((Math.random() * 0.2 + 0.8).toFixed(2));
    this.buildMarkovChain();
  }

  // Custom Model Builder
  updateCustomModel(): void {
    this.customData = [
      { position: 'First Touch', weight: this.firstTouchWeight / 100 },
      { position: 'Middle Touch', weight: this.middleTouchWeight / 100 },
      { position: 'Last Touch', weight: this.lastTouchWeight / 100 }
    ];

    setTimeout(() => {
      this.visualizeCustomModel();
    }, 100);
  }

  private visualizeCustomModel(): void {
    const container = d3.select("#custom-chart");
    container.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 100 };
    const width = 500 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(this.customData.map((d: any) => d.position))
      .range([0, height])
      .padding(0.3);

    const colors = ['#2ba2d9', '#143443', '#4c5322'];

    // background:#4c5322;

    g.selectAll(".custom-bar")
      .data(this.customData)
      .enter().append("rect")
      .attr("class", "custom-bar")
      .attr("x", 0)
      .attr("y", (d: any) => y(d.position))
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("fill", (d: any, i: number) => colors[i])
      .attr("rx", 5)
      .transition()
      .duration(500)
      .attr("width", (d: any) => x(d.weight));

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format(".0%") as any));

    g.append("g")
      .call(d3.axisLeft(y));
  }

  applyTimeDecay(): void {
    // Simulate time decay effect
    const decay = Math.random() * 0.3 + 0.5;
    this.middleTouchWeight = Math.floor(this.middleTouchWeight * decay);
    this.updateCustomModel();
  }

  saveCustomModel(): void {
    const model = {
      firstTouch: this.firstTouchWeight,
      middleTouch: this.middleTouchWeight,
      lastTouch: this.lastTouchWeight,
      timestamp: new Date().toISOString()
    };

    // Simulate saving (in real app, would send to backend)
    alert('Custom attribution model saved successfully!');
  }

  // Slider event handlers
  onFirstTouchChange(event: any): void {
    this.firstTouchWeight = event.target.value;
    this.updateCustomModel();
  }

  onMiddleTouchChange(event: any): void {
    this.middleTouchWeight = event.target.value;
    this.updateCustomModel();
  }

  onLastTouchChange(event: any): void {
    this.lastTouchWeight = event.target.value;
    this.updateCustomModel();
  }

  // Fullscreen functionality for Markov chart
  toggleMarkovFullscreen(): void {
    this.isMarkovFullscreen = !this.isMarkovFullscreen;

    if (this.isMarkovFullscreen) {
      // Enter fullscreen mode
      setTimeout(() => {
        this.buildMarkovChainFullscreen();
      }, 100);
    } else {
      // Exit fullscreen mode
      setTimeout(() => {
        this.buildMarkovChain(); // Rebuild the original chart
      }, 100);
    }
  }

  buildMarkovChainFullscreen(): void {
    const container = d3.select("#markov-fullscreen-chart");
    container.selectAll("*").remove();

    const width = window.innerWidth - 100;
    const height = window.innerHeight - 200;

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);

    const states = ['Start', 'Email', 'Social', 'Search', 'Display', 'Conversion'];
    const nodeData: NodeData[] = states.map((state, i) => ({
      id: state,
      x: (width / (states.length + 1)) * (i + 1),
      y: height / 2 + (i % 2 === 0 ? -50 : 50)
    }));

    // Create force simulation with larger forces for fullscreen
    const simulation = d3.forceSimulation(nodeData)
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // Add links with thicker strokes for fullscreen
    const links = svg.selectAll(".link")
      .data(this.markovData.filter((d: any) => d.probability > 0.15))
      .enter().append("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-width", (d: any) => d.probability * 15)
      .attr("opacity", 0.6);

    // Add larger nodes for fullscreen
    const nodes = svg.selectAll(".node")
      .data(nodeData)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 30)
      .attr("fill", (d: any, i: number) => d3.schemeCategory10[i])
      .attr("stroke", "#fff")
      .attr("stroke-width", 3);

    // Add larger labels for fullscreen
    const labels = svg.selectAll(".node-label")
      .data(nodeData)
      .enter().append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text((d: any) => d.id);

    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => nodeData.find(n => n.id === d.source)?.x || 0)
        .attr("y1", (d: any) => nodeData.find(n => n.id === d.source)?.y || 0)
        .attr("x2", (d: any) => nodeData.find(n => n.id === d.target)?.x || 0)
        .attr("y2", (d: any) => nodeData.find(n => n.id === d.target)?.y || 0);

      nodes
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });
  }

  showChannelDrillDown(channel: string): void {
    this.selectedChannel = channel;
    this.selectedChannelData = null; // Clear previous data

    // In a real application, you would fetch this data from an API or service
    // For demonstration, we'll simulate a fetch
    setTimeout(() => {
      this.selectedChannelData = {
        conversionRate: Math.random() * 0.1 + 0.05,
        ctr: Math.random() * 0.05 + 0.02,
        cpa: Math.random() * 100 + 50,
        rpc: Math.random() * 0.5 + 0.2,
        firstTouchRate: Math.random() * 0.1 + 0.05,
        lastTouchRate: Math.random() * 0.1 + 0.05,
        assistedConversions: Math.random() * 10 + 5,
        timeToConversion: Math.random() * 10 + 5,
        recommendations: [
          { title: 'Increase CTR for Email', description: 'Improve email open rates and click-throughs.', impact: 'High' },
          { title: 'Optimize CPA for Display', description: 'Reduce cost per acquisition for display ads.', impact: 'Medium' },
          { title: 'Improve First Touch Rate', description: 'Enhance the initial touchpoint for new users.', impact: 'High' }
        ]
      };

      // Render drill-down charts
      setTimeout(() => {
        this.renderDemographicsChart(channel);
        this.renderSeasonalChart(channel);
      }, 100);
    }, 500);
  }

  closeDrillDown(): void {
    this.selectedChannel = null;
    this.selectedChannelData = null;
  }

  private renderDemographicsChart(channel: string): void {
    const container = d3.select(`#demographics-chart-${channel}`);
    container.selectAll("*").remove();

    const width = 280;
    const height = 180;

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);

    const data = [
      { age: '18-24', value: Math.random() * 30 + 10 },
      { age: '25-34', value: Math.random() * 40 + 20 },
      { age: '35-44', value: Math.random() * 25 + 15 },
      { age: '45+', value: Math.random() * 20 + 10 }
    ];

    const x = d3.scaleBand()
      .domain(data.map(d => d.age))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([height, 0]);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y).ticks(5));

    svg.selectAll(".demographic-bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "demographic-bar")
      .attr("x", (d: any) => x(d.age) || 0)
      .attr("y", (d: any) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d: any) => height - y(d.value))
      .attr("fill", "#4299e1")
      .attr("opacity", 0.7)
      .attr("rx", 3);

    // Add labels
    svg.selectAll(".demographic-label")
      .data(data)
      .enter().append("text")
      .attr("class", "demographic-label")
      .attr("x", (d: any) => (x(d.age) || 0) + x.bandwidth() / 2)
      .attr("y", (d: any) => y(d.value) - 8)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#4a5568")
      .style("font-weight", "500")
      .text((d: any) => `${d.value.toFixed(1)}%`);
  }

  private renderSeasonalChart(channel: string): void {
    const container = d3.select(`#seasonal-chart-${channel}`);
    container.selectAll("*").remove();

    const width = 280;
    const height = 180;

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);

    const data = [
      { month: 'Jan', value: Math.random() * 20 + 10 },
      { month: 'Feb', value: Math.random() * 20 + 10 },
      { month: 'Mar', value: Math.random() * 20 + 10 },
      { month: 'Apr', value: Math.random() * 20 + 10 },
      { month: 'May', value: Math.random() * 20 + 10 },
      { month: 'Jun', value: Math.random() * 20 + 10 },
      { month: 'Jul', value: Math.random() * 20 + 10 },
      { month: 'Aug', value: Math.random() * 20 + 10 },
      { month: 'Sep', value: Math.random() * 20 + 10 },
      { month: 'Oct', value: Math.random() * 20 + 10 },
      { month: 'Nov', value: Math.random() * 20 + 10 },
      { month: 'Dec', value: Math.random() * 20 + 10 }
    ];

    const x = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([height, 0]);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0));

    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(0));

    // Create line generator
    const line = d3.line()
      .x((d: any) => (x(d.month) || 0) + x.bandwidth() / 2)
      .y((d: any) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Add area under the line
    const area = d3.area()
      .x((d: any) => (x(d.month) || 0) + x.bandwidth() / 2)
      .y0(height)
      .y1((d: any) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Add area
    svg.append("path")
      .datum(data)
      .attr("fill", "url(#gradient)")
      .attr("opacity", 0.3)
      .attr("d", area as any);

    // Add gradient definition
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#48bb78")
      .attr("stop-opacity", 0.8);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#48bb78")
      .attr("stop-opacity", 0.1);

    // Add line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#48bb78")
      .attr("stroke-width", 3)
      .attr("d", line as any);

    // Add points
    svg.selectAll(".seasonal-point")
      .data(data)
      .enter().append("circle")
      .attr("class", "seasonal-point")
      .attr("cx", (d: any) => (x(d.month) || 0) + x.bandwidth() / 2)
      .attr("cy", (d: any) => y(d.value))
      .attr("r", 4)
      .attr("fill", "#48bb78")
      .attr("stroke", "white")
      .attr("stroke-width", 2);
  }

  // Shapley Value drill-down methods
  showShapleyDrillDown(): void {
    this.showShapleyModal = true;
    this.shapleyInsights = null;

    // Simulate data loading
    setTimeout(() => {
      this.shapleyInsights = {
        efficiencyScore: Math.random() * 0.3 + 0.7,
        stabilityIndex: Math.random() * 0.5 + 0.5,
        coreStability: Math.random() * 0.4 + 0.6,
        nucleolusDistance: Math.random() * 0.2,
        bargainingPower: Math.random() * 0.8 + 0.2,
        coalitionEfficiency: Math.random() * 0.3 + 0.7,
        gameTheoryInsights: [
          {
            title: 'Coalition Stability Analysis',
            description: 'The current coalition structure shows high stability with minimal defection incentives.',
            impact: 'High Stability'
          },
          {
            title: 'Marginal Contribution Optimization',
            description: 'Optimizing marginal contributions can improve fairness by 15-20%.',
            impact: 'Medium Improvement'
          },
          {
            title: 'Core Solution Feasibility',
            description: 'The core solution exists and is computationally feasible for this game.',
            impact: 'Theoretical Confirmation'
          }
        ]
      };

      // Render charts
      setTimeout(() => {
        this.renderMarginalContributionsChart();
        this.renderCoalitionPowerChart();
      }, 100);
    }, 500);
  }

  closeShapleyDrillDown(): void {
    this.showShapleyModal = false;
    this.shapleyInsights = null;
  }

  // Custom Model drill-down methods
  showCustomModelDrillDown(): void {
    this.showCustomModal = true;
    this.customModelData = null;

    // Simulate data loading
    setTimeout(() => {
      this.customModelData = {
        accuracy: Math.random() * 0.2 + 0.8,
        predictionError: Math.random() * 0.1,
        rSquared: Math.random() * 0.3 + 0.7,
        crossValidationScore: Math.random() * 0.2 + 0.8,
        vsLastTouch: (Math.random() - 0.5) * 0.2,
        vsFirstTouch: (Math.random() - 0.5) * 0.2,
        vsLinear: (Math.random() - 0.5) * 0.15,
        vsDataDriven: (Math.random() - 0.5) * 0.1,
        optimizationSuggestions: [
          {
            title: 'Adjust First Touch Weight',
            description: 'Consider increasing first touch weight to 45% for better customer acquisition attribution.',
            improvement: '+8.5% Accuracy'
          },
          {
            title: 'Implement Time Decay',
            description: 'Add exponential time decay function to reduce impact of older touchpoints.',
            improvement: '+12.3% Precision'
          },
          {
            title: 'Optimize Middle Touch',
            description: 'Fine-tune middle touch attribution based on customer journey analysis.',
            improvement: '+5.7% Recall'
          }
        ]
      };

      // Render charts
      setTimeout(() => {
        this.renderWeightAnalysisChart();
        this.renderTimeDecayChart();
      }, 100);
    }, 500);
  }

  closeCustomDrillDown(): void {
    this.showCustomModal = false;
    this.customModelData = null;
  }

  // Chart rendering methods for Shapley drill-down
  private renderMarginalContributionsChart(): void {
    const container = d3.select("#marginal-contributions-chart");
    container.selectAll("*").remove();

    const width = 280;
    const height = 180;

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);

    const data = this.shapleyData.map((d: any, i: number) => ({
      channel: d.channel,
      marginal: d.marginal,
      shapley: d.shapley
    }));

    const x = d3.scaleBand()
      .domain(data.map((d: any) => d.channel))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => Math.max(d.marginal, d.shapley)) || 0])
      .range([height, 0]);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Add marginal contribution bars
    svg.selectAll(".marginal-bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "marginal-bar")
      .attr("x", (d: any) => x(d.channel) || 0)
      .attr("y", (d: any) => y(d.marginal))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d: any) => height - y(d.marginal))
      .attr("fill", "#68d391")
      .attr("opacity", 0.7);

    // Add Shapley value bars
    svg.selectAll(".shapley-bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "shapley-bar")
      .attr("x", (d: any) => (x(d.channel) || 0) + x.bandwidth() / 2)
      .attr("y", (d: any) => y(d.shapley))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d: any) => height - y(d.shapley))
      .attr("fill", "#48bb78")
      .attr("opacity", 0.8);
  }

  private renderCoalitionPowerChart(): void {
    const container = d3.select("#coalition-power-chart");
    container.selectAll("*").remove();

    const width = 280;
    const height = 180;

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);

    const data = [
      { size: 1, power: Math.random() * 0.3 + 0.1 },
      { size: 2, power: Math.random() * 0.4 + 0.2 },
      { size: 3, power: Math.random() * 0.5 + 0.3 },
      { size: 4, power: Math.random() * 0.6 + 0.4 },
      { size: 5, power: Math.random() * 0.7 + 0.5 }
    ];

    const x = d3.scaleLinear()
      .domain([1, 5])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.power) || 0])
      .range([height, 0]);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Create line generator
    const line = d3.line()
      .x((d: any) => x(d.size))
      .y((d: any) => y(d.power))
      .curve(d3.curveMonotoneX);

    // Add line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#ed8936")
      .attr("stroke-width", 3)
      .attr("d", line as any);

    // Add points
    svg.selectAll(".power-point")
      .data(data)
      .enter().append("circle")
      .attr("class", "power-point")
      .attr("cx", (d: any) => x(d.size))
      .attr("cy", (d: any) => y(d.power))
      .attr("r", 5)
      .attr("fill", "#ed8936")
      .attr("stroke", "white")
      .attr("stroke-width", 2);
  }

  // Chart rendering methods for Custom Model drill-down
  private renderWeightAnalysisChart(): void {
    const container = d3.select("#weight-analysis-chart");
    container.selectAll("*").remove();

    const width = 280;
    const height = 180;

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);

    const data = [
      { position: 'First Touch', weight: this.firstTouchWeight / 100, optimal: 0.45 },
      { position: 'Middle Touch', weight: this.middleTouchWeight / 100, optimal: 0.25 },
      { position: 'Last Touch', weight: this.lastTouchWeight / 100, optimal: 0.30 }
    ];

    const x = d3.scaleBand()
      .domain(data.map((d: any) => d.position))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%") as any));

    // Add current weight bars
    svg.selectAll(".current-bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "current-bar")
      .attr("x", (d: any) => x(d.position) || 0)
      .attr("y", (d: any) => y(d.weight))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d: any) => height - y(d.weight))
      .attr("fill", "#9f7aea")
      .attr("opacity", 0.8);

    // Add optimal weight bars
    svg.selectAll(".optimal-bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "optimal-bar")
      .attr("x", (d: any) => (x(d.position) || 0) + x.bandwidth() / 2)
      .attr("y", (d: any) => y(d.optimal))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d: any) => height - y(d.optimal))
      .attr("fill", "#805ad5")
      .attr("opacity", 0.6);
  }

  private renderTimeDecayChart(): void {
    const container = d3.select("#time-decay-chart");
    container.selectAll("*").remove();

    const width = 280;
    const height = 180;

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);

    const data = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      impact: Math.exp(-0.1 * (i + 1)) * (0.8 + Math.random() * 0.4)
    }));

    const x = d3.scaleLinear()
      .domain([1, 30])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.impact) || 0])
      .range([height, 0]);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Create line generator
    const line = d3.line()
      .x((d: any) => x(d.day))
      .y((d: any) => y(d.impact))
      .curve(d3.curveMonotoneX);

    // Add line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#6b46c1")
      .attr("stroke-width", 3)
      .attr("d", line as any);

    // Add area under the line
    const area = d3.area()
      .x((d: any) => x(d.day))
      .y0(height)
      .y1((d: any) => y(d.impact))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "url(#timeDecayGradient)")
      .attr("opacity", 0.3)
      .attr("d", area as any);

    // Add gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "timeDecayGradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#6b46c1")
      .attr("stop-opacity", 0.8);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#6b46c1")
      .attr("stop-opacity", 0.1);
  }
}

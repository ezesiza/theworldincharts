import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'ad-distribution',
    templateUrl: './ad-distribution.component.html',
    styleUrls: ['./ad-distribution.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class AdDistributionComponent implements AfterViewInit {
    // Layout controls
    layoutMode: 'single' | 'grid' = 'grid';
    gridColumns: number = 2;
    googleShare = 0;
    top3Share = 0;
    top10Share = 0;
    private svgElements: any[] = [];
    private rawData = [
        { domain: "google.com", percent: 78.3, column: "Column 1" },
        { domain: "smartadserver.com", percent: 5.7, column: "Column 1" },
        { domain: "rubiconproject.com", percent: 4.8, column: "Column 1" },
        { domain: "indexexchange.com", percent: 1.6, column: "Column 1" },
        { domain: "yoav.com", percent: 1.3, column: "Column 1" },
        { domain: "pubmatic.com", percent: 1.3, column: "Column 1" },
        { domain: "openx.com", percent: 1.1, column: "Column 1" },
        { domain: "ironarc.com", percent: 1.0, column: "Column 1" },
        { domain: "inmobi.com", percent: 0.6, column: "Column 1" },
        { domain: "triplelift.com", percent: 0.6, column: "Column 1" },
        { domain: "themediarigid.com", percent: 0.6, column: "Column 1" },
        { domain: "sovrn.com", percent: 0.4, column: "Column 1" },
        { domain: "appnexus.com", percent: 0.3, column: "Column 1" },
        { domain: "onetag.com", percent: 0.2, column: "Column 1" },
        { domain: "media.net", percent: 0.2, column: "Column 1" },

        { domain: "google.com", percent: 88.2, column: "Column 2" },
        { domain: "rubiconproject.com", percent: 0.5, column: "Column 2" },
        { domain: "sovrn.com", percent: 0.3, column: "Column 2" },
        { domain: "indexexchange.com", percent: 0.2, column: "Column 2" },
        { domain: "pubmatic.com", percent: 0.2, column: "Column 2" },
        { domain: "yieldmo.com", percent: 0.1, column: "Column 2" },
        { domain: "appnexus.com", percent: 0.1, column: "Column 2" },
        { domain: "contextweb.com", percent: 0.1, column: "Column 2" },
        { domain: "smartadserver.com", percent: 0.1, column: "Column 2" },
        { domain: "themediarigid.com", percent: 0.1, column: "Column 2" },

        { domain: "google.com", percent: 82.1, column: "Column 3" },
        { domain: "pubmatic.com", percent: 4.0, column: "Column 3" },
        { domain: "indexexchange.com", percent: 4.0, column: "Column 3" },
        { domain: "openx.com", percent: 3.9, column: "Column 3" },
        { domain: "smartadserver.com", percent: 2.4, column: "Column 3" },
        { domain: "onetag.com", percent: 1.3, column: "Column 3" },
        { domain: "rubiconproject.com", percent: 1.0, column: "Column 3" },
        { domain: "appnexus.com", percent: 0.5, column: "Column 3" },
        { domain: "xandr.com", percent: 0.2, column: "Column 3" },
        { domain: "media.net", percent: 0.1, column: "Column 3" },
        { domain: "yahoo.com", percent: 0.1, column: "Column 3" },
        { domain: "adform.com", percent: 0.1, column: "Column 3" }
    ];

    private color = d3.scaleSequential((t) =>
        d3.interpolateViridis(t * 2 + 0.5)).domain([0, this.rawData.length]);



    processedData: any[] = [];

    private colors = {
        google: '#4285f4',
        others: d3.scaleOrdinal()
            .range(['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8',
                '#f7dc6f', '#bb8fce', '#85c1e9', '#f8c471', '#82e0aa', '#f1948a', '#85c1e9'])
    };
    private tooltip: any;

    ngAfterViewInit() {
        this.initializeCharts();
    }

    initializeCharts() {
        this.processData();
        this.createTooltip();
        this.createVisualizations();
    }

    private processData() {
        // Aggregate data
        const aggregatedData: any = {};
        this.rawData.forEach(item => {
            if (aggregatedData[item.domain]) {
                aggregatedData[item.domain] += item.percent;
            } else {
                aggregatedData[item.domain] = item.percent;
            }
        });

        this.processedData = Object.entries(aggregatedData)
            .map(([domain, totalPercent]: [string, any]) => ({
                domain,
                totalPercent: parseFloat(totalPercent.toFixed(1)),
                scaledValue: Math.pow(totalPercent, 1.5) * 2, // For bubble chart
                category: domain === 'google.com' ? 'Google' : 'Other'
            }))
            .sort((a, b) => b.totalPercent - a.totalPercent);

        // Calculate metrics
        this.googleShare = this.processedData[0].totalPercent;
        this.top3Share = this.processedData.slice(0, 3).reduce((sum, item) => sum + item.totalPercent, 0);
        this.top10Share = this.processedData.slice(0, 10).reduce((sum, item) => sum + item.totalPercent, 0);
    }

    // Add fullscreen tracking
    private isFullscreen = false;
    private currentFullscreenContainer: HTMLElement | null = null;

    // Enhanced toggleFullscreen method
    toggleFullscreen(event: Event) {
        event.preventDefault();
        event.stopPropagation();

        const button = event.target as HTMLElement;
        const svg = button.querySelector('svg') || button.closest('button')?.querySelector('svg');
        const container = button.closest('.viz-container') as HTMLElement;

        if (!container) return;

        if (!this.isFullscreen) {
            // Enter fullscreen
            this.enterFullscreen(container, svg);
        } else {
            // Exit fullscreen
            this.exitFullscreen(svg);
        }
    }

    private async enterFullscreen(container: HTMLElement, svg?: SVGElement | null) {
        try {
            if (container.requestFullscreen) {
                await container.requestFullscreen();
            } else if ((container as any).mozRequestFullScreen) {
                await (container as any).mozRequestFullScreen();
            } else if ((container as any).webkitRequestFullscreen) {
                await (container as any).webkitRequestFullscreen();
            } else if ((container as any).msRequestFullscreen) {
                await (container as any).msRequestFullscreen();
            }

            this.isFullscreen = true;
            this.currentFullscreenContainer = container;
            this.updateFullscreenIcon(svg, true);

            // Listen for fullscreen changes
            this.addFullscreenListeners();

            // Trigger chart resize after a small delay to ensure fullscreen is active
            setTimeout(() => {
                this.resizeChartsInFullscreen(container);
            }, 100);

        } catch (err) {
            console.error(`Error entering fullscreen: ${err}`);
        }
    }

    private async exitFullscreen(svg?: SVGElement | null) {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                await (document as any).mozCancelFullScreen();
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen();
            } else if ((document as any).msExitFullscreen) {
                await (document as any).msExitFullscreen();
            }
        } catch (err) {
            console.error(`Error exiting fullscreen: ${err}`);
        }
    }

    private updateFullscreenIcon(svg?: SVGElement | null, isEntering: boolean = false) {
        if (!svg) return;

        // Update icon paths for enter/exit fullscreen
        const paths = svg.querySelectorAll('path');
        if (isEntering) {
            // Change to exit fullscreen icon
            if (paths[0]) paths[0].setAttribute('d', 'm14 14-4-4m0 0v3m0-3h3');
            if (paths[1]) paths[1].setAttribute('d', 'M3 16.5V19m0 0h2.5M3 19l4-4');
            if (paths[2]) paths[2].setAttribute('d', 'M14 10l-4 4m0 0v-3m0 3h-3');
            if (paths[3]) paths[3].setAttribute('d', 'M3 7.5V5m0 0h2.5M3 5l4 4');
        } else {
            // Change back to enter fullscreen icon
            if (paths[0]) paths[0].setAttribute('d', 'm21 21-6-6m6 6v-4.8m0 4.8h-4.8');
            if (paths[1]) paths[1].setAttribute('d', 'M3 16.2V21m0 0h4.8M3 21l6-6');
            if (paths[2]) paths[2].setAttribute('d', 'M21 7.8V3m0 0h-4.8M21 3l-6 6');
            if (paths[3]) paths[3].setAttribute('d', 'M3 7.8V3m0 0h4.8M3 3l6 6');
        }
    }

    private addFullscreenListeners() {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(document.fullscreenElement ||
                (document as any).mozFullScreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).msFullscreenElement);

            if (!isCurrentlyFullscreen && this.isFullscreen) {
                // Fullscreen was exited
                this.isFullscreen = false;
                const svg = this.currentFullscreenContainer?.querySelector('.fullscreen-btn svg');
                this.updateFullscreenIcon(svg as SVGElement, false);

                // Re-render chart when exiting fullscreen
                this.resizeChartsInFullscreen(this.currentFullscreenContainer!);

                this.currentFullscreenContainer = null;
                this.removeFullscreenListeners();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        // Store references for cleanup
        (this as any)._fullscreenHandler = handleFullscreenChange;
    }

    private removeFullscreenListeners() {
        if ((this as any)._fullscreenHandler) {
            document.removeEventListener('fullscreenchange', (this as any)._fullscreenHandler);
            document.removeEventListener('mozfullscreenchange', (this as any)._fullscreenHandler);
            document.removeEventListener('webkitfullscreenchange', (this as any)._fullscreenHandler);
            document.removeEventListener('MSFullscreenChange', (this as any)._fullscreenHandler);
            delete (this as any)._fullscreenHandler;
        }
    }

    private resizeChartsInFullscreen(container: HTMLElement) {
        // Clear existing charts and recreate them with fullscreen dimensions
        const chartId = this.getChartIdFromContainer(container);
        if (chartId) {
            // Clear the chart
            d3.select(chartId).selectAll("*").remove();

            // Recreate tooltip before recreating chart
            this.createTooltip();

            // Recreate the specific chart
            setTimeout(() => {
                switch (chartId) {
                    case '#pie-chart':
                        this.createPieChart();
                        break;
                    case '#bar-chart':
                        this.createBarChart();
                        break;
                    case '#bubble-chart':
                        this.createBubbleChart();
                        break;
                    case '#column-comparison':
                        this.createColumnComparison();
                        break;
                    case '#concentration-chart':
                        this.createConcentrationChart();
                        break;
                    case '#consistency-chart':
                        this.createConsistencyChart();
                        break;
                    case '#treemap-chart':
                        this.drawTreemap();
                        break;
                    case '#treemap-chart':
                        this.drawCirclePackChart();
                        break;
                }
            }, 50);
        }
    }

    private getChartIdFromContainer(container: HTMLElement): string | null {
        const chartElement = container.querySelector('[id$="-chart"]') as HTMLElement;
        return chartElement ? `#${chartElement.id}` : null;
    }

    // Update getContainerWidth to handle fullscreen mode
    private getContainerWidth2(selector: string, fallback: number): number {
        const element = document.querySelector(selector) as HTMLElement | null;
        if (!element) return fallback;

        // Check if we're in fullscreen mode
        if (this.isFullscreen && this.currentFullscreenContainer?.contains(element)) {
            // Use screen dimensions minus padding for fullscreen
            return Math.min(window.screen.width * 0.8, 1400);
        }

        const rect = element.getBoundingClientRect();
        const parentRect = (element.parentElement as HTMLElement | null)?.getBoundingClientRect();
        const width = rect.width || parentRect?.width || fallback;
        return Math.max(320, Math.floor(width));
    }

    ngOnDestroy() {
        // Cleanup fullscreen listeners
        this.removeFullscreenListeners();
    }

    private destroyChart() {
        this.svgElements.forEach(svg => {
            if (svg) svg.remove();
        });
    }

    private createTooltip() {
        // Remove existing tooltip to prevent duplicates
        d3.select('body').select('.tooltip').remove();
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.9)')
            .style('color', 'white')
            .style('padding', '12px 16px')
            .style('border-radius', '8px')
            .style('pointer-events', 'none')
            .style('font-size', '14px')
            .style('box-shadow', '0 4px 20px rgba(0, 0, 0, 0.3)')
            .style('backdrop-filter', 'blur(10px)')
            .style('z-index', '1000');
    }

    private createVisualizations() {
        this.createPieChart();
        this.createBarChart();
        this.createBubbleChart();
        this.createColumnComparison();
        this.createConcentrationChart();
        this.createConsistencyChart();
        this.drawTreemap();
        this.drawCirclePackChart();
    }

    private createConsistencyChart() {
        const margin = { top: 40, right: 100, bottom: 100, left: 100 };
        const containerWidth = this.getContainerWidth2('#consistency-chart', 700);
        const width = containerWidth - margin.left - margin.right;
        const height = 500 - margin.bottom - margin.top;

        // Get unique providers that appear in at least one column
        const providers = [...new Set(this.rawData.map(d => d.domain.replace('.com', '')))];
        const columns = ['Column 1', 'Column 2', 'Column 3'];

        // Prepare data matrix: provider x column presence
        const data = providers.map(provider => {
            return columns.map(column => {
                const found = this.rawData.find(d => d.domain.replace('.com', '') === provider && d.column === column);
                return {
                    provider,
                    column,
                    present: found ? 1 : 0,
                    percent: found ? found.percent : 0
                };
            });
        });

        const svg = d3.select('#consistency-chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', `0 0 ${(width + margin.left + margin.right)} ${height + margin.top + margin.bottom}`)
            .style('max-width', '100%')
            .style('height', 'auto');

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Create scales
        const x = d3.scaleBand()
            .domain(columns)
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleBand()
            .domain(providers)
            .range([0, height])
            .padding(0.1);

        // const color = d3.scaleLinear<string>()
        //     .domain([0, 1])
        //     // .range(['#f0f0f0', this.colors.google]);
        //     .range([0, this.rawData.length]);

        // Create cells
        g.selectAll('.cell')
            .data(data.flat())
            .enter().append('rect')
            .attr('class', 'cell')
            .attr('x', d => x(d.column)!)
            .attr('y', d => y(d.provider)!)
            .attr('width', x.bandwidth())
            .attr('height', y.bandwidth())
            .attr('fill', d => d.present ? this.color(d.percent / 100) : '#f8f8f8')
            .attr('stroke', '#ddd')
            .attr('rx', 4) // Rounded corners
            .attr('ry', 4)
            .on('mouseover', (event, d) => {
                this.tooltip.transition().duration(200).style('opacity', 1);
                this.tooltip.html(`
                    <strong>${d.provider}</strong><br/>
                    Column: ${d.column}<br/>
                    ${d.present ? `Share: ${d.percent.toFixed(1)}%` : 'Not present'}
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');

                d3.select(event.currentTarget)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 2);
            })
            .on('mouseout', (event) => {
                this.tooltip.transition().duration(200).style('opacity', 0);
                d3.select(event.currentTarget)
                    .attr('stroke', '#ddd')
                    .attr('stroke-width', 1);
            });

        // Add column labels
        g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'middle')
            .attr('dy', '1em');

        // Add provider labels
        g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(y))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-0.5em');

        // Add title
        g.append('text')
            .attr('class', 'chart-title')
            .attr('x', width / 2)
            .attr('y', -20)
            .style('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Provider Consistency Across Columns');

        // Add legend
        const legend = g.append('g')
            .attr('transform', `translate(${width + 20}, 0)`);

        const legendScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, 100]);

        const legendAxis = d3.axisRight(legendScale)
            .tickValues([0, 25, 50, 75, 100])
            .tickFormat(d => `${d}%`);

        legend.append('g')
            .attr('class', 'legend-axis')
            .call(legendAxis)
            .selectAll('.tick text') // Select all tick labels
            .attr('dx', '20px');

        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#f0f0f0');

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', (d: any, i: any) => this.color(i));

        legend.append('rect')
            .attr('width', 20)
            .attr('height', 100)
            .style('fill', 'url(#legend-gradient)')
            .attr('stroke', '#ddd');
    }

    private createPieChart() {
        const top10 = this.processedData.slice(0, 10);
        const othersSum = this.processedData.slice(10).reduce((sum, d) => sum + d.totalPercent, 0);

        const pieData = [
            ...top10.map(d => ({
                label: d.domain.replace('.com', ''),
                value: d.totalPercent,
                color: d.domain === 'google.com' ? this.colors.google : this.colors.others(d.domain)
            })),
            { label: 'Others', value: othersSum, color: '#95a5a6' }
        ];

        const containerWidth = this.getContainerWidth2('#pie-chart', 650);
        const legendWidth = 200;
        const chartWidth = Math.max(300, containerWidth - legendWidth);
        const totalWidth = chartWidth + legendWidth;
        const height = 500;
        const radius = Math.min(chartWidth, height) / 2 - 100; // More margin for external labels
        const innerRadius = radius * 0.5; // Create donut hole (50% of outer radius)

        // Create SVG with enough width for both chart and legend
        const svg = d3.select('#pie-chart')
            .append('svg')
            .attr('width', totalWidth)
            .attr('height', height)
            .attr('viewBox', `0 0 ${totalWidth} ${height}`)
            // .style('max-width', '100%')
            .style('height', 'auto');
        this.svgElements.push(svg);

        const g = svg.append('g')
            .attr('transform', `translate(${chartWidth / 2}, ${height / 2})`);

        const pie = d3.pie().value((d: any) => d.value).sort(null);
        const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);
        const outerArc = d3.arc().innerRadius(radius * 1.1).outerRadius(radius * 1.1);

        const arcs = g.selectAll('.arc')
            .data(pie(pieData as any))
            .enter().append('g')
            .attr('class', 'arc');

        // Draw donut slices
        arcs.append('path')
            .attr('d', arc as any)
            .attr('fill', (d: any, i: number) => this.color(i))
            .style('opacity', 0.9)
            .style('stroke', '#fff')
            .style('stroke-width', 2)
            .on('mouseover', (event: any, d: any) => {
                d3.select(event.currentTarget).transition().duration(200).style('opacity', 0.7);
                this.tooltip.transition().duration(200).style('opacity', 1);
                this.tooltip.html(`<strong>${d.data.label}</strong><br/>Market share: ${d.data.value.toFixed(1)}%`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', (event: any) => {
                d3.select(event.currentTarget).transition().duration(200).style('opacity', 0.9);
                this.tooltip.transition().duration(200).style('opacity', 0);
            });

        // Add polylines (connecting lines) - Updated version
        const pieDataValues = pie(pieData as any);

        g.selectAll('allPolylines')
            .data(pieDataValues)
            .enter()
            .append('polyline')
            .style('fill', 'none')
            .style('stroke', '#666')
            .style('stroke-width', 1)
            .attr('points', function (d: any) {
                var posA = arc.centroid(d); // line insertion in the slice
                var posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
                var posC = outerArc.centroid(d); // Label position = almost the same as posB
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                return [posA, posB, posC].map(point => point.join(',')).join(' ');
            });

        // Add external labels - Updated version using your code pattern
        g.selectAll('allLabels')
            .data(pieDataValues)
            .enter()
            .append('text')
            .text(function (d: any) {
                return d.data.value > 2 ? d.data.label : ''; // Only show labels for segments > 2%
            })
            .attr('transform', function (d: any) {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
            })
            .style('text-anchor', function (d: any) {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return (midangle < Math.PI ? 'start' : 'end');
            })
            .style('font-size', '12px')
            .style('font-weight', '500')
            .style('fill', '#333');

        // Helper function to calculate middle angle
        function midAngle(d: any) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }

        // Create vertical legend on the right side - FIXED VERSION
        const legendData = pieData.map(d => ({
            label: d.label === 'google' ? 'Google' : d.label,
            color: d.color
        }));

        const legend = svg.selectAll('.legend-item-pie')
            .data(legendData)
            .enter().append('g')
            .attr('class', 'legend-item-pie')
            .attr('transform', (d: any, i: number) => {
                const legendX = chartWidth + 30; // Position legend to the right of the chart
                const legendY = (height / 2) - (legendData.length * 12.5) + (i * 25); // Center vertically
                return `translate(${legendX}, ${legendY})`;
            });

        legend.append('rect')
            .attr('width', 18)
            .attr('height', 18)
            .attr('fill', (d: any, i) => this.color(i))
            .attr('rx', 2); // Rounded corners

        legend.append('text')
            .attr('x', 25)
            .attr('y', 9)
            .attr('dy', '0.35em')
            .style('font-size', '13px')
            .style('font-weight', '500')
            .style('fill', '#333')
            .text((d: any) => d.label);

        // Add percentage labels inside donut for major segments
        arcs.append('text')
            .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .style('font-size', (d: any) => d.data.value > 15 ? '14px' : '11px')
            .style('font-weight', 'bold')
            .style('fill', (d: any, i) => d.data.value > 50 ? 'white' : '#333')
            .text((d: any) => d.data.value > 8 ? `${d.data.value.toFixed(1)}%` : ''); // Only show % for larger segments
    }

    private createBarChart() {
        const top15 = this.processedData.slice(0, 15).map(d => ({
            ...d, domain: d.domain.replace('.com', ''),
        }));
        const margin = { top: 20, right: 30, bottom: 80, left: 60 };
        const containerWidth = this.getContainerWidth2('#bar-chart', 1000);
        const width = containerWidth - margin.left - margin.right;
        const height = 500 - margin.bottom - margin.top;


        const svg = d3.select('#bar-chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', `0 0 ${(width + margin.left + margin.right)} ${height + margin.top + margin.bottom}`)
            .style('max-width', '100%')
            .style('height', 'auto');

        this.svgElements.push(svg);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1)
            .domain(top15.map(d => d.domain));

        const y = d3.scaleLinear()
            .rangeRound([height, 0])
            .domain([0, d3.max(top15, (d: any) => d.totalPercent)]);

        // Bars
        g.selectAll('.bar')
            .data(top15)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', (d: any) => x(d.domain))
            .attr('width', x.bandwidth())
            .attr('y', height)
            .attr('height', 0)
            .attr('fill', (d: any) => d.domain === 'google.com' ? this.colors.google : this.colors.others(d.domain) as any)
            .on('mouseover', (event: any, d: any) => {
                this.tooltip.transition().duration(200).style('opacity', 1);
                this.tooltip.html(`<strong>${d.domain}</strong><br/>Combined share: ${d.totalPercent}%`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.transition().duration(200).style('opacity', 0);
            })
            .transition()
            .duration(1000)
            .delay((d: any, i: number) => i * 50)
            .attr('y', (d: any) => y(d.totalPercent))
            .attr('height', (d: any) => height - y(d.totalPercent));

        // X axis
        g.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        // Y axis
        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y));

        g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .text('Combined Market Share (%)');
    }
    private drawCirclePackChart(): void {

        const width = 700;
        const height = 700;
        const margin = { top: 50, right: 20, bottom: 20, left: 20 };

        const svg = d3.select("#circle-pack")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr('viewBox', `0 0 ${(width + margin.left + margin.right)} ${height + margin.top + margin.bottom}`)
            .append("g")
        // .attr("transform", `translate(${margin.left},${margin.top})`);


        // Color scale
        const color = d3.scaleOrdinal()
            .domain(this.processedData.map(d => d.domain))
            .range(d3.quantize(t => d3.interpolateViridis(t * 0.8 + 0.5), this.processedData.length));

        // Hierarchical data structure for circle packing
        const root = d3.hierarchy({ children: this.processedData })
            .sum((d: any) => d.scaledValue)
            .sort((a: any, b: any) => b.value - a.value);

        // Circle packing layout
        const pack = d3.pack()
            .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
            .padding(3);

        pack(root as any);

        // Create bubbles
        const node = svg.selectAll(".node")
            .data(root.leaves())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

        // Add circles
        node.append("circle")
            .attr("class", "bubble")
            .attr("r", (d: any) => d.r)
            .attr("fill", (d: any) => color(d.data.domain) as any)
            .on('mouseover', (event: any, d: any) => {
                d3.select(event.currentTarget).transition().duration(200).attr('stroke-width', 4);
                this.tooltip.transition().duration(200).style('opacity', 1);
                this.tooltip.html(`<strong>${d.data.domain}</strong><br/>Market share: ${d.data.totalPercent}%<br/>Rank: ${this.processedData.indexOf(d.data) + 1}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', (event: any) => {
                d3.select(event.currentTarget).transition().duration(200).attr('stroke-width', 2);
                this.tooltip.transition().duration(200).style('opacity', 0);
            })
            .transition()
            .duration(1500)
            .delay((d: any, i: number) => i * 50)

        //     // Highlight bubble
        //     // d3.select(this as any)
        //     //     .attr("stroke", "#333")
        //     //     .attr("stroke-width", 2);

        //     // Show tooltip
        //     this.tooltip.transition()
        //         .duration(200)
        //         .style("opacity", .9);
        //     this.tooltip.html(`<strong>${d.data.domain}</strong><br/>${d.data.totalPercent.toFixed(1)}% market share`)
        //         .style("left", (event.pageX + 10) + "px")
        //         .style("top", (event.pageY - 28) + "px");
        // })
        // .on("mouseout", () => {
        //     // Remove highlight
        //     // d3.select(this as any)
        //     //     .attr("stroke", "white")
        //     //     .attr("stroke-width", 1.5);

        //     // Hide tooltip
        //     this.tooltip.transition()
        //         .duration(500)
        //         .style("opacity", 0);
        // });

        // Add labels
        node.append("text")
            .attr("class", "bubble-label")
            .attr("dy", ".3em")
            .text((d: any) => {
                // Only show label if there's enough space
                return d.r > 20 ? d.data.domain :
                    d.r > 10 ? d.data.domain.split('.')[0] : "";
            })
            .style("font-size", (d: any) => {
                // Dynamic font sizing based on bubble size
                const baseSize = Math.min(12, d.r / 3);
                return `${baseSize}px`;
            });

        // Add title
        svg.append("text")
            .attr("x", (width - margin.left - margin.right) / 2)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Ad Tech Market Share (Circle Packing)");

        // Add subtitle
        svg.append("text")
            .attr("x", (width - margin.left - margin.right) / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "#666")
            .text("Bubble size represents market share percentage");
    }

    private createBubbleChart() {
        const margin = { top: 40, right: 40, bottom: 120, left: 100 }; // Increased bottom margin
        const containerWidth = this.getContainerWidth2('#bubble-chart', 900);
        const width = containerWidth - margin.left - margin.right;
        const height = 600 - margin.bottom - margin.top;

        const svg = d3.select('#bubble-chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', `0 0 ${(width + margin.left + margin.right)} ${height + margin.top + margin.bottom}`)
            .style('max-width', '100%')
            .style('height', 'auto')
            .style('overflow', 'visible'); // Ensure nothing gets clipped

        // this.svgElements.push(svg);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Better scaling for bubble chart
        const x = d3.scalePoint()
            .domain(this.processedData.map((d, i) => i) as any)
            .range([0, width])
            .padding(1.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(this.processedData, (d: any) => d.totalPercent) * 1.1])
            .range([height, 0]);

        const size = d3.scalePow().exponent(0.6)
            .domain([d3.min(this.processedData, (d: any) => d.totalPercent), d3.max(this.processedData, (d: any) => d.totalPercent)])
            .range([8, 60]);

        // Add grid lines
        g.selectAll('.grid-line')
            .data(y.ticks(8))
            .enter().append('line')
            .attr('class', 'grid-line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', (d: any) => y(d))
            .attr('y2', (d: any) => y(d))
            .style('stroke', '#e0e0e0')
            .style('stroke-dasharray', '3,3');

        g.selectAll('.bubble')
            .data(this.processedData)
            .enter().append('circle')
            .attr('class', 'bubble')
            .attr('cx', (d: any, i: number) => x(i as any))
            .attr('cy', (d: any) => y(d.totalPercent))
            .attr('r', 0)
            .attr('fill', (d: any, i) => this.color(i) as any)
            .style('opacity', 0.8)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .on('mouseover', (event: any, d: any) => {
                console.log(d.totalPercent, d.domain);
                d3.select(event.currentTarget).transition().duration(200).attr('stroke-width', 4);
                this.tooltip.transition().duration(200).style('opacity', 1);
                this.tooltip.html(`<strong>${d.domain}</strong><br/>Market share: ${d.totalPercent}%<br/>Rank: ${this.processedData.indexOf(d) + 1}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', (event: any) => {
                d3.select(event.currentTarget).transition().duration(200).attr('stroke-width', 2);
                this.tooltip.transition().duration(200).style('opacity', 0);
            })
            .transition()
            .duration(1500)
            .delay((d: any, i: number) => i * 50)
            .attr('r', (d: any) => size(d.totalPercent));

        // Y axis with better formatting
        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y).tickFormat((d: any) => d + '%'));

        g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('Market Share (%)');

        g.append('text')
            .attr('class', 'axis-label')
            .attr('y', height + 80) // Adjusted to account for rotated labels
            .attr('x', width / 2)
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('Ad Providers (Ranked by Market Share)');

        // FIXED: Add properly aligned rotated domain labels for top providers
        const topProviders = this.processedData
        // .slice(0, 8); // Use slice instead of filter for cleaner code

        // Remove any existing labels to prevent duplication
        g.selectAll('.bubble-label').remove();

        // Add new labels with proper alignment
        g.selectAll('.bubble-label')
            .data(topProviders)
            .enter().append('text')
            .attr('class', 'bubble-label')
            .style('text-anchor', 'start') // Keep start anchor for rotated text
            .style('font-size', '10px')
            .style('fill', '#666')
            .attr('transform', (d: any, i: number) => {
                // Get the actual x position of the bubble using the original index
                const originalIndex = this.processedData.indexOf(d);
                const xPos = x(originalIndex as any);
                // Position the text at the bubble's x position, below the chart
                return `translate(${xPos},${height + 15}) rotate(45)`;
            })
            .text((d: any) => {
                // Clean up domain names
                const cleanName = d.domain.replace('.com', '')
                    .replace(/([A-Z])/g, ' $1') // Add space before capitals
                    .trim();
                return cleanName.substring(0, 12); // Limit length
            });

        // Adjust x-axis title position to accommodate rotated labels
        g.selectAll('.axis-label')
            .filter((d, i, nodes) => (nodes[i] as any).textContent === 'Ad Providers (Ranked by Market Share)')
            .attr('y', height + 85); // Move it down further to avoid collision with rotated labels
    }

    private createColumnComparison() {
        // Prepare data for stacking - get top 8 providers plus "Others"
        const top8Domains = this.processedData.slice(0, 8).map(d => d.domain);

        const stackData = ['Column 1', 'Column 2', 'Column 3'].map(column => {
            const columnData = this.rawData.filter(d => d.column === column);
            const result: any = { column };

            // Add top 8 providers
            top8Domains.forEach(domain => {
                const found = columnData.find(d => d.domain === domain);
                result[domain] = found ? found.percent : 0;
            });

            // Add "Others" category
            const top8Total = top8Domains.reduce((sum, domain) => {
                const found = columnData.find(d => d.domain === domain);
                return sum + (found ? found.percent : 0);
            }, 0);
            const columnTotal = columnData.reduce((sum, d) => sum + d.percent, 0);
            result['Others'] = columnTotal - top8Total;

            return result;
        });

        const keys = [...top8Domains, 'Others'];
        const stack = d3.stack().keys(keys);
        const series = stack(stackData);

        const margin = { top: 20, right: 120, bottom: 50, left: 80 };
        const containerWidth = this.getContainerWidth2('#column-comparison', 700);
        const width = containerWidth - margin.left - margin.right;
        const height = 500 - margin.bottom - margin.top;

        const svg = d3.select('#column-comparison')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', `0 0 ${(width + margin.left + margin.right)} ${height + margin.top + margin.bottom}`)
            .style('max-width', '100%')
            .style('height', 'auto');
        this.svgElements.push(svg);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .domain(stackData.map(d => d.column))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(series, (d: any) => d3.max(d, (d: any) => d[1])) as any])
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain(keys)
            .range([this.colors.google, '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#95a5a6']);

        // Create stacked bars
        g.selectAll('.layer')
            .data(series)
            .enter().append('g')
            .attr('class', 'layer')
            .attr('fill', (d: any, i) => this.color(i) as any)
            .selectAll('rect')
            .data((d: any) => d)
            .enter().append('rect')
            .attr('x', (d: any) => x(d.data.column))
            .attr('width', x.bandwidth())
            .attr('y', height)
            .attr('height', 0)
            .on('mouseover', (event: any, d: any) => {
                const key = (d3.select(event.currentTarget.parentNode).datum() as any).key;
                const value = d[1] - d[0];
                this.tooltip.transition().duration(200).style('opacity', 1);
                this.tooltip.html(`<strong>${key}</strong><br/>${d.data.column}<br/>Share: ${value.toFixed(1)}%`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.transition().duration(200).style('opacity', 0);
            })
            .transition()
            .duration(1000)
            .delay((d: any, i: number) => i * 100)
            .attr('y', (d: any) => y(d[1]))
            .attr('height', (d: any) => y(d[0]) - y(d[1]));

        // Axes
        g.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y).tickFormat((d: any) => d + '%'));

        g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .text('Market Share (%)');

        // Legend
        const legend = g.selectAll('.legend-item-stack')
            .data(keys.slice().reverse())
            .enter().append('g')
            .attr('class', 'legend-item-stack')
            .attr('transform', (d: any, i: number) => `translate(${width + 20}, ${i * 25})`);

        legend.append('rect')
            .attr('width', 18)
            .attr('height', 18)
            .attr('fill', (d: any, i) => this.color(i) as any);

        legend.append('text')
            .attr('x', 25)
            .attr('y', 9)
            .attr('dy', '0.35em')
            .style('font-size', '12px')
            .text((d: any) => d === 'google.com' ? 'Google' : d.replace('.com', ''));
    }

    private createConcentrationChart() {
        const sortedData = [...this.processedData].sort((a, b) => a.totalPercent - b.totalPercent);
        let cumulative = 0;
        const concentrationData = sortedData.map((d, i) => {
            cumulative += d.totalPercent;
            return {
                provider: d.domain,
                rank: i + 1,
                percent: d.totalPercent,
                cumulative: cumulative
            };
        });

        const margin = { top: 40, right: 50, bottom: 80, left: 80 };
        const containerWidth = this.getContainerWidth2('#concentration-chart', 700);
        const width = containerWidth - margin.left - margin.right;
        const height = 400 - margin.bottom - margin.top;

        const svg = d3.select('#concentration-chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', `0 0 ${(width + margin.left + margin.right)} ${height + margin.top + margin.bottom}`)
            .style('max-width', '100%')
            .style('height', 'auto');
        this.svgElements.push(svg);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleLinear()
            .domain([1, concentrationData.length])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(concentrationData, (d: any) => d.cumulative)])
            .range([height, 0]);

        // Draw the concentration curve
        const line = d3.line()
            .x((d: any) => x(d.rank))
            .y((d: any) => y(d.cumulative))
            .curve(d3.curveMonotoneX);

        const path = g.append('path')
            .datum(concentrationData)
            .attr('fill', 'none')
            .attr('stroke', this.colors.google)
            .attr('stroke-width', 3)
            .attr('d', line as any);

        // Add points
        g.selectAll('.conc-point')
            .data(concentrationData)
            .enter().append('circle')
            .attr('class', 'conc-point')
            .attr('cx', (d: any) => x(d.rank))
            .attr('cy', (d: any) => y(d.cumulative))
            .attr('r', (d: any) => d.provider === 'google.com' ? 8 : 4)
            .attr('fill', (d: any) => d.provider === 'google.com' ? this.colors.google : '#ff6b6b')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .on('mouseover', (event: any, d: any) => {
                this.tooltip.transition().duration(200).style('opacity', 1);
                this.tooltip.html(`<strong>${d.provider}</strong><br />Rank: ${d.rank}<br />Individual: ${d.percent.toFixed(1)}%<br />Cumulative: ${d.cumulative.toFixed(1)}%`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.transition().duration(200).style('opacity', 0);
            });

        // Add axes
        g.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y).tickFormat((d: any) => d + '%'));

        // Add axis labels
        g.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + 50)
            .style('text-anchor', 'middle')
            .text('Provider Rank (by Market Share)');

        g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .text('Cumulative Market Share (%)');

        // Add reference line for perfect equality
        g.append('line')
            .attr('x1', 0)
            .attr('y1', y(100))
            .attr('x2', width)
            .attr('y2', y(0))
            .attr('stroke', '#aaa')
            .attr('stroke-dasharray', '5,5')
            .attr('stroke-width', 1);
    }

    private drawTreemap() {

        const width = 780;
        const height = 400;
        const margin = { top: 30, right: 30, bottom: 70, left: 70 };

        const svg = d3.select('#treemap-chart')
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left - 200},${margin.top})`);

        // this.svgElements.push(svg);

        // Color scale
        const color = d3.scaleOrdinal()
            .domain(this.processedData.map((d: any) => d.domain.replace('.com', '')))
            .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), this.processedData.length).reverse());

        // Hierarchical data structure for treemap
        const root = d3.hierarchy({ children: this.processedData })
            .sum((d: any) => d.totalPercent)
            .sort((a, b) => b.value - a.value);

        // Treemap layout
        d3.treemap()
            .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
            .padding(1)
            (root as any);

        // Create cells
        const cell = svg.selectAll("g")
            .data(root.leaves())
            .enter().append("g")
            .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

        // Add rectangles
        cell.append("rect")
            .attr("width", (d: any) => d.x1 - d.x0)
            .attr("height", (d: any) => d.y1 - d.y0)
            .attr("fill", (d: any) => color(d.data.domain) as any)
            .on("mouseover", (event: any, d: any) => {
                this.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                this.tooltip.html(`<strong>${d.data.domain.replace('.com', '')}</strong><br/>${d.data.totalPercent.toFixed(1)}% market share`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");

                d3.select(this as any).attr("stroke", "#000").attr("stroke-width", 2);
            })
            .on("mouseout", () => {
                this.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);

                d3.select(this as any).attr("stroke", null);
            });

        // Add labels
        cell.append("text")
            .attr("class", "treemap-label")
            .selectAll("tspan")
            .data((d: any) => [d.data.domain.replace('.com', ''), `${d.data.totalPercent.toFixed(1)}%`])
            .enter().append("tspan")
            .attr("x", 4)
            .attr("y", (d: any, i: number) => 12 + i * 10)
            .text((d: any) => d);

        // Add title
        // svg.append("text")
        //     .attr("x", (width - margin.left - margin.right) / 2)
        //     .attr("y", -10)
        //     .attr("text-anchor", "middle")
        //     .style("font-size", "16px")
        //     .style("font-weight", "bold")
        //     .text("Ad Tech Market Share (Treemap)");

        // Track selected legend items
        let selectedItems = new Set<string>();
        // Helper function to update visibility
        const updateVisibility = () => {
            const isAllSelected = selectedItems.size === 0 || selectedItems.size === this.processedData.slice(0, 10).length;

            // Update treemap cells
            cell.style("opacity", (d: any) => {
                const domain = d.data.domain.replace('.com', '');
                return isAllSelected ? 1 : (selectedItems.has(domain) ? 1 : 0.1);
            });

            // Update treemap labels
            cell.selectAll(".treemap-label")
                .style("opacity", (d: any) => {
                    const domain = d.data.domain.replace('.com', '');
                    return isAllSelected ? 1 : (selectedItems.has(domain) ? 1 : 0.1);
                });

            // Update legend items
            legendItems.style("opacity", (d: any) => {
                return isAllSelected ? 1 : (selectedItems.has(d.domain) ? 1 : 0.3);
            });

            // Update legend item styling
            legendItems.selectAll("rect")
                .attr("stroke-width", (d: any) => {
                    return isAllSelected ? 0.5 : (selectedItems.has(d.domain) ? 2 : 0.5);
                })
                .attr("stroke", (d: any) => {
                    return isAllSelected ? "#333" : (selectedItems.has(d.domain) ? "#000" : "#999");
                });

            legendItems.selectAll("text")
                .style("font-weight", (d: any) => {
                    return isAllSelected ? "500" : (selectedItems.has(d.domain) ? "bold" : "normal");
                });
        };


        // ADD LEGEND - Show only in fullscreen mode or when space permits
        // if (this.isFullscreen || width > 700) {
        const legendData = this.processedData.slice(0, 10).map((d: any) => ({
            domain: d.domain.replace('.com', ''),
            color: color(d.domain),
            percent: d.totalPercent
        }));

        const legendContainer = svg.append("g")
            .attr("class", "treemap-legend")
            .attr("transform", `translate(${width - margin.right - 35}, 50)`);

        const legendItems = legendContainer.selectAll(".legend-item")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d: any, i: number) => `translate(0, ${i * 25})`)
            .style("cursor", "pointer")
            .on("click", function (event: any, d: any) {
                event.preventDefault();

                if (selectedItems.has(d.domain)) {
                    selectedItems.delete(d.domain);
                } else {
                    selectedItems.add(d.domain);
                }

                // If all items are now selected, reset to show all
                if (selectedItems.size === legendData.length) {
                    selectedItems.clear();
                }

                updateVisibility();
            })

        // Legend rectangles
        legendItems.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", (d: any) => d.color)
            .attr("stroke", "#333")
            .attr("stroke-width", 0.5)
            .attr("rx", 2);

        // Legend text
        legendItems.append("text")
            .attr("x", 25)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .style("font-size", this.isFullscreen ? "14px" : "12px")
            .style("font-weight", "500")
            .style("fill", "#333")
            .text((d: any) => d.domain);
        // .text((d: any) => `${d.domain} (${d.percent.toFixed(1)}%)`);

        // Legend title
        legendContainer.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .style("font-size", this.isFullscreen ? "16px" : "14px")
            .style("font-weight", "bold")
            .style("fill", "#2c3e50")
            .text("Top 10 Providers");

        // ADD ANNOTATION for fullscreen mode
        // if (this.isFullscreen) {
        svg.append("text")
            .attr("class", "fullscreen-annotation")
            .attr("x", width - margin.right - 50)
            .attr("y", height - margin.bottom + 40)
            .style("font-size", "12px")
            .style("fill", "#666")
            .style("font-style", "italic")
            .style("text-anchor", "end")
            .text("💡 Legend visible in fullscreen mode");
        // }
        // }

        // Add reset button for better UX
        const resetButton = legendContainer.append("g")
            .attr("class", "reset-button")
            .attr("transform", `translate(0, ${legendData.length * 25 + 20})`)
            .style("cursor", "pointer")
            .style("opacity", 0.8)
            .on("click", () => {
                selectedItems.clear();
                updateVisibility();
            })
            .on("mouseover", function () {
                d3.select(this).style("opacity", 1);
                d3.select(this).select("rect").attr("fill", "#e3f2fd");
            })
            .on("mouseout", function () {
                d3.select(this).style("opacity", 0.8);
                d3.select(this).select("rect").attr("fill", "#f8f9fa");
            });

        // resetButton.append("rect")
        //     .attr("width", 35)
        //     .attr("height", 20)
        //     .attr("x", 1)
        //     .attr("y", -25)
        //     .attr("dy", "0.55em")
        //     .attr("fill", "#f8f9fa")
        //     .attr("stroke", "#2196f3")
        //     .attr("stroke-width", 1)
        //     .attr("rx", 4);

        // resetButton.append("text")
        //     .attr("x", 42.5)
        //     .attr("y", 11)
        //     .attr("dy", "0.35em")
        //     .style("font-size", "12px")
        //     .style("font-weight", "600")
        //     .style("fill", "#2196f3")
        //     .style("text-anchor", "middle")
        // .text("Reset Filter");

        // Add reset icon
        resetButton.append("text")
            .attr("x", 4)
            .attr("y", -15)
            .attr("dy", "0.35em")
            .style("font-weight", "700")
            .style("font-size", "16px")
            .style("fill", "#10181f")
            .text("⟲")
            .text("Reset");
    }
}
import * as d3 from 'd3';

export type FunnelChartOptions = {
    palette: string[];
    style: '2d' | '3d' | 'flat';
    streamlined: boolean;
    percentage: 'first' | 'previous';
    showPercentage: boolean;
};

type FunnelChartFont = {
    fontFamily: string;
    size: {
        label: number;
        value: number;
        percentage: number;
    };
};

type FunnelChartField = {
    stage: string;
    value: string;
};

type FunnelChartTooltip = {
    color: string;
    boxColor: string;
    boxOpacity: number;
};

type FunnelChartData = {
    stage: string;
    value: number;
    vs?: number;
    ve?: number;
    pct?: number;
};

export class FunnelChart {
    private container: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private g: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
    private infoBox: any = null;
    private textBox: any = null;
    private charBox: any = null;

    private width = 0;
    private height = 0;
    private offset = 30;
    private halfWidth: number = 0;
    private funnelWidth = { max: 0, min: 0 };

    private yScale: d3.ScaleLinear<number, number> | null = null;
    private colorScale: d3.ScaleOrdinal<string, string>;

    private data: FunnelChartData[] | null | any = null;
    private chartData: FunnelChartData[];
    private total = 0;
    private streamlined = true;

    private options: FunnelChartOptions = {
        palette: d3.schemeTableau10 as any,
        style: '3d',
        streamlined: true,
        percentage: 'first',
        showPercentage: true,
    };

    private font: FunnelChartFont = {
        fontFamily: 'sans-serif',
        size: {
            label: 16,
            value: 16,
            percentage: 12,
        },
    };

    private field: FunnelChartField = {
        stage: 'stage',
        value: 'value',
    };

    private tooltip: FunnelChartTooltip = {
        color: 'black',
        boxColor: 'white',
        boxOpacity: 0.8,
    };

    private onHover: ((data: FunnelChartData) => void) | null = null;
    private onClick: ((data: FunnelChartData) => void) | null = null;

    constructor(container: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: any) {
        this.container = container;
        this.chartData = data;
    }

    setSize(size: [number, number]): this {
        [this.width, this.height] = size;
        return this;
    }

    setOptions(options: Partial<FunnelChartOptions>): this {
        Object.assign(this.options, options);
        return this;
    }

    setFont(font: Partial<FunnelChartFont>): this {
        Object.assign(this.font, font);
        return this;
    }

    setField(field: Partial<FunnelChartField>): this {
        Object.assign(this.field, field);
        return this;
    }

    setTooltip(tooltip: Partial<FunnelChartTooltip>): this {
        Object.assign(this.tooltip, tooltip);
        return this;
    }

    setData(data: FunnelChartData[]): this {
        this.data = [...data];
        return this;
    }

    setOnHover(callback: (data: FunnelChartData) => void): this {
        this.onHover = callback;
        return this;
    }

    setOnClick(callback: (data: FunnelChartData) => void): this {
        this.onClick = callback;
        return this;
    }

    render(): this {
        this.initialize();
        this.processData();
        this.initializeScales();
        this.renderChart();
        return this;
    }

    private initialize(): void {
        this.streamlined = this.options.streamlined;
        this.halfWidth = this.width / 2;
        this.funnelWidth.max = this.width * 0.65;
        this.funnelWidth.min = this.width * 0.15;

        this.textBox = this.container
            .append('text')
            .attr('font-family', this.font.fontFamily)
            .style('visibility', 'hidden');
        this.getCharBox();
    }

    private processData(): void {
        if (this.streamlined) {
            this.processStreamlined();
        } else {
            this.processPartToWhole();
        }
    }

    private processStreamlined(): void {
        if (!this.data) return;

        this.chartData = [];
        this.data.sort((a: any, b: any) => b[this.field.value] - a[this.field.value]);

        for (let i = 1; i < this.data.length; i++) {
            const d: any = this.data[i];
            const value = d[this.field.value];

            let denominator = 1;
            if (this.options.percentage === 'first') {
                denominator = this.data[0][this.field.value];
            } else if (this.options.percentage === 'previous') {
                denominator = i === 0 ? value : this.data[i - 1][this.field.value];
            }

            this.chartData.push({
                stage: d[this.field.stage],
                value,
                vs: this.data[i - 1][this.field.value],
                ve: value,
                pct: value / denominator,
            });
        }
    }

    private processPartToWhole(): void {
        if (!this.data) return;

        let total = 0;
        this.chartData = this.data.map((d: any, i: any) => {
            const vs = total;
            const value = d[this.field.value];

            total += value;
            return {
                stage: d[this.field.stage],
                value,
                vs,
                ve: total,
                pct: 0,
            };
        });

        this.total = total;
        this.chartData.forEach((d) => (d.pct = d.value / total));
    }

    private initializeScales(): void {
        if (!this.data || !this.chartData) return;

        this.yScale = d3.scaleLinear().range([this.streamlined ? 30 : 0, this.height]);

        if (this.streamlined) {
            this.yScale.domain(d3.extent(this.data.map((d: any) => d[this.field.value]))!.reverse() as any);
        } else {
            this.yScale.domain([0, this.total]);
        }

        this.colorScale = d3
            .scaleOrdinal()
            .domain(this.chartData.map((d) => d.stage))
            .range(this.options.palette) as any;
    }

    private renderLabels(): void {
        const offset = this.options.style === "3d" ? 5 : 1;

        if (this.streamlined) {
            const first = this.data[0];

            this.g?.append("text")
                .attr("text-anchor", "middle")
                .attr("font-size", this.font.size?.label)
                .attr("font-weight", "bold")
                .attr("fill", "#666")
                .attr("x", this.width / 2)
                .attr("y", 25)
                .text(`${first[this.field.stage!]} = ${d3.format(".3s")(first[this.field.value!])}`);
        }

        const data = this.chartData
            .filter(d => this.yScale!(d.ve) - this.yScale!(d.vs) > (this.charBox?.height || 0));

        const labels = this.g
            ?.selectAll("label")
            .data(data)
            .join("g")
            .attr("class", "label")
            .attr("font-size", this.font.size?.label)
            .attr("font-weight", "bold")
            .attr("fill", "#666")
            .call(g => {

                const line = g
                    .append("line")
                    .attr("stroke", "#666")
                    .attr("stroke-dasharray", "1,2");

                if (this.streamlined) {
                    line
                        .attr("x1", 0)
                        .attr("y1", d => this.yScale!(d.ve) - offset)
                        .attr("x2", this.halfWidth)
                        .attr("y2", d => this.yScale!(d.ve) - offset);
                } else {
                    line
                        .attr("x1", 0)
                        .attr("y1", d => this.yScale!(d.vs + d.value * 0.75))
                        .attr("x2", this.halfWidth)
                        .attr("y2", d => this.yScale!(d.vs + d.value * 0.75));
                }

                g.append("text")
                    .attr("x", 0)
                    .attr("y", d => this.yScale!(this.streamlined ? d.ve : d.vs + d.value * 0.75) - offset)
                    .attr("dy", "-0.2em")
                    .attr("fill", "black")
                    .text(d => d.stage);
            });

        this.attachEvents(labels);
    }

    private renderLayers(layer: any, shadow: any) {
        return this.g
            .selectAll("layer")
            .data(this.chartData)
            .join("g")
            .attr("class", "layer")
            .call(g => {
                g
                    .append("path")
                    .attr("fill", d => this.colorScale(d.stage))
                    .attr("d", layer)
            })
            .call(g => {
                g
                    .append("path")
                    .attr("fill", (d: any) => d3.color(this.colorScale(d.stage)).darker(0.5) as any)
                    .attr("d", shadow)
            });
    }

    private renderNumbers(target: any, t: any) {
        const ah = this.options.showPercentage ? this.charBox.height * 2 : this.charBox.height;
        const filtered = target.filter((d: { ve: any; vs: any; }) => this.yScale(d.ve) - this.yScale(d.vs) > ah);

        filtered.call((g: any) => {
            g
                .append("text")
                .attr("fill", "white")
                .attr("font-size", this.font.size.value)
                .attr("font-weight", "bold")
                .attr("text-anchor", "end")
                .attr("transform", t)
                .text((d: { value: number | { valueOf(): number; }; }) => d3.format(".3s")(d.value));

            if (this.options.showPercentage) {
                g
                    .append("text")
                    .attr("fill", "white")
                    .attr("font-size", this.font.size.percentage)
                    .attr("text-anchor", "end")
                    .attr("transform", t)
                    .attr("dy", "1em")
                    .text((d: { pct: number | { valueOf(): number; }; }) => d3.format(".1%")(d.pct));
            }
        });
    }

    private getLinearEquationSet1() {
        const left = this.xScale(
            (this.width - this.funnelWidth.max) / 2, 0,
            (this.width - this.funnelWidth.min) / 2, this.height
        );
        const right = this.xScale(
            (this.width - this.funnelWidth.max) / 2 + this.funnelWidth.max, 0,
            (this.width - this.funnelWidth.min) / 2 + this.funnelWidth.min, this.height,
        );

        return { left, right };
    }

    private renderFunnel2D() {
        const that = this, { left, right } = this.getLinearEquationSet1();

        const layers = this.renderLayers(layer, shadow);
        this.renderNumbers(layers, (d: any) => {
            if (this.streamlined) {
                const y1 = this.yScale(d.vs), y2 = this.yScale(d.ve);
                return `translate(${this.halfWidth},${y1 + (y2 - y1) / 2})`;
            }
            else {
                return `translate(${this.halfWidth},${this.yScale(d.vs + d.value / 2)})`;
            }
        }
        );

        if (this.options.style === "2d") {
            layers.attr("transform", (d, i) => {
                return `translate(${i % 2 === 0 ? -5 : 5},0)`;
            });
        }

        this.attachEvents(layers);

        function layer(d: any) {
            const
                y0 = that.yScale(d.vs), y1 = that.yScale(d.ve),
                x00 = left(y0), x01 = right(y0),
                x10 = left(y1), x11 = right(y1);

            return `M${x00},${y0}L${x01},${y0}L${x11},${y1}L${x10},${y1}L${x00},${y0}`;
        }

        function shadow(d: any, i: any) {
            if (i > 0 && that.options.style === "2d") {
                const
                    y0 = that.yScale(d.vs),
                    y1 = that.streamlined ? that.yScale(d.vs) + (that.yScale(d.ve) - that.yScale(d.vs)) / 5 : that.yScale(d.vs + d.value / 5),
                    w = (that.halfWidth - left(y0)) * 1.5, // 2 * 0.75
                    x00 = i % 2 === 0 ? right(y0) : left(y0), x01 = i % 2 === 0 ? x00 - w : x00 + w,
                    x10 = i % 2 === 0 ? right(y1) : left(y1);
                return `M${x00},${y0}L${x10},${y1}L${x01},${y0}L${x00},${y0}`;
            }
            return '';
        }
    }

    private renderFunnel3D() {
        const that = this, { pa, pc, xb, xt } = this.getLinearEquationSet2();

        const layers = this.renderLayers(layer, shadow)
            .call(g => {
                g
                    .append("path")
                    .attr("fill", d => d3.color(this.colorScale(d.stage)).darker(0.7) as any)
                    .attr("d", bottom)
            });

        const
            x1 = (this.width - this.funnelWidth.max * 1 / 3) / 2, y1 = 0,
            x2 = (this.width - this.funnelWidth.max) / 2 + this.funnelWidth.max, y2 = this.offset,
            a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        this.renderNumbers(layers, (d: any) => {
            if (this.streamlined) {
                const
                    y1 = this.yScale(d.vs), y2 = this.yScale(d.ve),
                    py = y1 + (y2 - y1) / 2, px = xt(py);
                return `translate(${px},${py}) skewY(${a})`;
            }
            else {
                const py = this.yScale(d.vs + d.value / 2), px = xt(py);
                return `translate(${px},${py}) skewY(${a})`;
            }
        }
        );

        this.attachEvents(layers);
        function layer(d: any) {
            const
                ys = that.yScale(d.vs), ye = that.yScale(d.ve) - 10,
                y00 = ys, y01 = ye, x00 = xb(y00), x01 = xb(y01),
                p0 = pc(ys), p1 = pc(ye);
            return `M${x00},${y00}L${p0.x},${p0.y}L${p1.x},${p1.y}L${x01},${y01}L${x00},${y00}`;
        }

        function shadow(d: any) {
            const
                ys = that.yScale(d.vs), ye = that.yScale(d.ve) - 10,
                y00 = ys, y01 = ye, x00 = xb(y00), x01 = xb(y01),
                p0 = pa(ys), p1 = pa(ye);

            return `M${x00},${y00}L${p0.x},${p0.y}L${p1.x},${p1.y}L${x01},${y01}L${x00},${y00}`;
        }

        function bottom(d: any) {
            const
                y = that.yScale(d.ve) - 10,
                y00 = y, x00 = xb(y00),
                p0 = pa(y), p1 = pc(y);

            return `M${x00},${y00}L${p0.x},${p0.y}L${p1.x},${p1.y}L${x00},${y00}`;
        }

    }

    private attachEvents(target: any) {
        target
            .on("pointerenter", (e: any, d: any) => {
                this.showTooltip(e, d);
                if (this.onHover) this.onHover(d);
            })
            .on("pointermove", (e: any, d: any) => {
                this.moveTooltip(e);
            })
            .on("pointerleave", () => {
                this.hideTooltip();
            });
    }

    calcTextLength(text: String) {
        return this.textBox.text(text).node().getBBox().width;
    }

    hideTooltip() {
        if (this.infoBox) this.infoBox.style("visibility", "hidden");
    }

    moveTooltip(e: any) {
        const svg = this.getSVG();
        if (svg) {
            // convert to SVG coordinates
            const
                p = svg.createSVGPoint(),
                box = this.infoBox.node().getBBox(),
                gr = this.g.node().getBoundingClientRect();
            p.x = e.clientX;
            p.y = e.clientY;
            const converted = p.matrixTransform(this.g.node().getScreenCTM().inverse());

            const
                left = converted.x + box.width + gr.left > this.width ? converted.x - box.width : converted.x,
                top = converted.y + box.height + gr.top > this.height ? converted.y - box.height : converted.y;

            this.infoBox.attr("transform", `translate(${left + 10},${top + 10})`);
        }
    }

    showTooltip(e: any, d: any) {
        const info = [d.stage, d3.format(",")(d.value), d3.format(".2%")(d.pct)];

        let max = 0;
        info.forEach(s => {
            const l = this.calcTextLength(s);
            if (l > max) max = l;
        })

        if (!this.infoBox)
            this.infoBox = this.g
                .append("g")
                .attr("fill", this.tooltip.color)
                .call(g => g.append("rect")
                    .attr("class", "ibbg")
                    .attr("opacity", this.tooltip.boxOpacity)
                    .attr("stroke", "#aaa")
                    .attr("stroke-width", 0.5)
                    .attr("rx", 4).attr("ry", 4)
                    .attr("x", -5).attr("y", -5)
                    .attr("fill", this.tooltip.boxColor));

        const spacing = 1.1;
        this.infoBox
            .style("visibility", "visible")
            .select(".ibbg")
            .attr("width", max + 20).attr("height", spacing * this.charBox.height * info.length + 5);

        this.infoBox
            .selectAll("text")
            .data(info)
            .join((enter: any) => {
                enter
                    .append("text")
                    .attr("dy", (d: any, i: any) => `${spacing * i + 1}em`)
                    .attr("font-weight", (d: any, i: any) => i === 0 ? "bold" : "")
                    .text((d: any) => d);
            },
                (update: any) => update.text((d: any) => d),
                (exit: any) => exit.remove()
            );

        this.moveTooltip(e);
    }


    private renderChart(): void {
        this.g = this.container.append('g').attr('font-family', this.font.fontFamily);

        this.renderLabels();
        if (this.options.style === '3d') {
            this.renderFunnel3D();
        } else {
            this.renderFunnel2D();
        }
    }

    private xScale(x1: number, y1: number, x2: number, y2: number) {
        const
            m = (y2 - y1) / (x2 - x1),
            b = y1 - m * x1;

        return (y: number) => (y - b) / m;
    }

    private getLinearEquationSet2() {
        const mb = (x1: any, y1: any, x2: any, y2: any) => {
            const m = (y2 - y1) / (x2 - x1), b = y1 - m * x1;
            return { m, b };
        };

        // Second line
        const xb = (y: any) => {
            const
                x1 = (this.width - this.funnelWidth.max * 1 / 3) / 2, y1 = 0,
                x2 = (this.width - this.funnelWidth.min) / 2 * 1.05, y2 = this.height;
            return this.xScale(x1, y1, x2, y2)(y);
        };

        // Text line
        const xt = (y: number) => {
            const
                xa = (this.width - this.funnelWidth.max * 1 / 3) / 2,
                xb = (this.width - this.funnelWidth.max) / 2 + this.funnelWidth.max,
                x1 = xa + (xb - xa) / 2, y1 = 0;
            const
                xc = (this.width - this.funnelWidth.min) / 2 * 1.05,
                xd = (this.width - this.funnelWidth.min) / 2 + this.funnelWidth.min,
                x2 = xc + (xd - xc) / 2, y2 = this.height;

            return this.xScale(x1, y1, x2, y2)(y);
        };

        const p = (x11: any, x12: any, x22: any, y: any) => {
            // Line 1
            const y11 = 0, y12 = this.height;
            // Line 2
            const x21 = xb(y), y21 = y, y22 = y21 + this.offset;

            const
                l1 = mb(x11, y11, x12, y12),
                l2 = mb(x21, y21, x22, y22);

            const
                px = (l2.b - l1.b) / (l1.m - l2.m),
                py = l1.m * px + l1.b;

            return { x: px, y: py };
        }

        // Left line
        const pa = (y: number) => p(
            (this.width - this.funnelWidth.max) / 2,
            (this.width - this.funnelWidth.min) / 2,
            (this.width - this.funnelWidth.max) / 2,
            y);

        // Right line
        const pc = (y: number) => p(
            (this.width - this.funnelWidth.max) / 2 + this.funnelWidth.max,
            (this.width - this.funnelWidth.min) / 2 + this.funnelWidth.min,
            (this.width - this.funnelWidth.max) / 2 + this.funnelWidth.max,
            y);

        return { pa, pc, xb, xt };
    }



    private getSVG() {
        let curr = this.container.node();
        while (curr && curr.tagName !== "svg")
            curr = curr.parentElement as any;
        return curr;
    }

    private getCharBox() {
        this.charBox = this.textBox.text("M").node().getBBox();
    }

}

import * as d3 from 'd3';
export const pieImages = [
    { name: "Mosaic", image: '../../../assets/datasets/browsers/Mosaic.png' },
    { name: "Safari", image: "../../../assets/datasets/browsers/Safari.png" },
    { name: "Netscape", image: "../../../assets/datasets/browsers/Netscape.png" },
    { name: "Opera", image: "../../../assets/datasets/browsers/opera.png" },
    { name: "Chrome", image: "../../../assets/datasets/browsers/Chrome.png" },
    { name: "Mozilla", image: "../../../assets/datasets/browsers/Mozilla.png" },
    { name: "Firefox", image: "../../../assets/datasets/browsers/Firefox.png" },
    { name: "Internet Explorer", image: "../../../assets/datasets/browsers/IE.png" },
    { name: "Edge", image: "../../../assets/datasets/browsers/Edge.png" },
];
const startDate = new Date("1994-03-25").getTime();
const endDate = Date.now();


const browserArray = []
export async function getBrowserList() {
    const bcsv = await fetch('assets/web_browsers_1994-2023.csv');
    const data = await bcsv.text();
    let csvToRowArray = data.split("\n");
    for (let index = 1; index < csvToRowArray.length - 1; index++) {
        let row = csvToRowArray[index].split(",");
        browserArray.push({ 'date': row[0], 'name': row[1], 'value': parseInt(row[2].trim()) });
    }
    return browserArray;
}

export async function filterBrowserList() {
    const browserList = await getBrowserList();
    browserList.filter((browser) => new Date(browser.date).getTime() >= startDate && new Date(browser.date).getTime() <= endDate);

    return browserList;
}

export async function transformedBrowserList() {
    const transformedList = await filterBrowserList();
    transformedList.map((browserObject) => {

        let imageObject = pieImages.find((imageObject) => browserObject.name === imageObject.name);
        return { ...browserObject, ...imageObject };
    });

    return transformedList;
}


function getImageLinks() {
    return new Map(pieImages.map(item => [item.name, item.image]))
}

async function getBrowserNames() {
    const list = await transformedBrowserList();
    return new Set(list.map((item) => item.name))
}


export async function getDateValues() {
    const list = await transformedBrowserList();

    return Array.from(d3.rollup(list, ([d]) => d.value, (d) => + new Date(d.date), (d) => d.name))
        .map(([date, data]) => [(new Date(date)), data])
    // .sort(([a], [b]) => d3.ascending(a, b));
}

export async function getKeyFrames() {
    const values = await getDateValues();

    const keyframes = [];


    const k = 100;
    let ka, a, kb, b;
    for ([[ka, a], [kb, b]] of d3.pairs(values)) {
        for (let i = 0; i < k; ++i) {
            const t = i / k;

            const ranks = await rank((name) => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t);

            keyframes.push([
                new Date(ka * (1 - t) + kb * t),
                ranks
            ]);
        }
        const frame = await rank((name) => b.get(name) || 0);

        keyframes.push([new Date(kb), frame]);

        return keyframes;
    }
}

async function rank(value) {
    const namesList = await getBrowserNames();

    const data = Array.from(namesList, (name) => ({ name: name, image: getImageLinks().get(name), rank: name.rank, value: value(name) || 0 }));

    for (let i = 0; i < data.length; ++i) {
        data[i].rank = i;
    }
    return data;
}

function wrap(text, wrapWidth) {
    text.each(() => {
        var text = d3.select("text"),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("dx", 0).attr("dy", `${dy}em`);
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > wrapWidth) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("dx", -tspan.node().getComputedTextLength()).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
    return 0;
}
import * as d3 from 'd3';
export const pieImages = [
    { name: "Mosaic", image: '../../../assets/browsers/Mosaic.png' },
    { name: "Safari", image: "../../../assets/browsers/Safari.png" },
    { name: "Netscape", image: "../../../assets/browsers/Netscape.png" },
    { name: "Opera", image: "../../../assets/browsers/opera.png" },
    { name: "Chrome", image: "../../../assets/browsers/Chrome.png" },
    { name: "Mozilla", image: "../../../assets/browsers/Mozilla.png" },
    { name: "Firefox", image: "../../../assets/browsers/Firefox.png" },
    { name: "Internet Explorer", image: "../../../assets/browsers/IE.png" },
    { name: "Edge", image: "../../../assets/browsers/Edge.png" },
];
const startDate = new Date("1994-01-01").getTime();
const endDate = new Date("2023-01-01").getTime();


const browserArray: any = []
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

    browserList.map((browser: any) => new Date(browser.date).getTime() >= startDate && new Date(browser.date).getTime() <= endDate);

    return browserList;
}

export async function transformedBrowserList() {
    const transformedList = await filterBrowserList();
    transformedList.map((browserObject: any) => {

        let imageObject = pieImages.find((imageObject: any) => browserObject.name === imageObject.name);
        return { ...browserObject, ...imageObject };
    });

    return transformedList;
}


function getImageLinks() {
    return new Map(pieImages.map(item => [item.name, item.image]))
}

async function getBrowserNames() {
    const list = await transformedBrowserList();
    return new Set(list.map((item: any) => item.name))
}


export async function getDateValues() {
    const list = await transformedBrowserList();
    const dateValues = Array.from(d3.rollup(list, ([d]: any) => d.value, (d: any) => new Date(d.date), (d: any) => d.name))
        .map(([date, data]) => [(new Date(date)), data])
        .sort(([a], [b]) => d3.ascending(a.toLocaleString(), b.toLocaleString()));
    return dateValues
}

export async function getKeyFrames() {
    const values = await getDateValues();
    const keyframes: any = [];


    const k = 100;
    let ka: any, a: any, kb: any, b: any;
    for ([[ka, a], [kb, b]] of d3.pairs(values)) {
        for (let i = 0; i < k; ++i) {
            const t = i / k;

            keyframes.push([
                new Date(ka * (1 - t) + kb * t),
                await rank((name: any) => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
            ]);
        }
        keyframes.push([new Date(kb), await rank((name: any) => b.get(name) || 0)]);

        return keyframes;
    }
}

async function rank(value: any) {
    return getBrowserNames().then(namesList => {
        const data = Array.from(namesList, (name: any) => {

            return ({ name: name, image: getImageLinks().get(name), rank: 0, value: value(name) || 0 })
        });
        for (let i = 0; i < data.length; ++i) {
            data[i].rank = i;
        }

        return data;
    })
}

function wrap(text: { each: (arg0: () => void) => void; }, wrapWidth: number) {
    text.each(() => {
        var text = d3.select("text"),
            words = text.text().split(/\s+/).reverse(),
            word,
            line: string[] = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("dx", 0).attr("dy", `${dy}em`);
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node()!.getComputedTextLength() > wrapWidth) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("dx", -tspan.node()!.getComputedTextLength()).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
    return 0;
}
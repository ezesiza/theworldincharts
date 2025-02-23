/* 
const externalPoints = (points: any[]) => points.filter(point => {
    return point[1] === Math.max(...points.map(p => p[1])) || // max y
        point[1] === Math.min(...points.map(p => p[1])) || // min y
        point[0] === Math.max(...points.map(p => p[0])) || // max x
        point[0] === Math.min(...points.map(p => p[0]));   // min x

});

// const bounds = (voronoi: any) => voronoi.map((d: any) => d.polygon).flat()
//     .filter((vertex: any) => { return vertex[0] === x0 || vertex[0] === x1 || vertex[1] === y0 || vertex[1] === y1 })

function isCurved(points: any): boolean {
    let curvedSection = [];
    let isCurved = false;

    for (let i = 0; i < points.length - 1; i++) {
        if (points[i][0] > points[i + 1][0] && // x is decreasing
            points[i][1] < points[i + 1][1]) {  // y is increasing
            isCurved = curvedSection.length === 0 ? false : true;

        }
    }

    return isCurved
}

function findCurvedPoints(points: any[]) {
    let curvedSection = [];
    let startIndex = 0;

    // Find sequence where both conditions are met:
    // - x values are decreasing
    // - y values are increasing
    for (let i = 0; i < points.length - 1; i++) {
        if (points[i][0] > points[i + 1][0] && // x is decreasing
            points[i][1] < points[i + 1][1]) {  // y is increasing
            if (curvedSection.length === 0) {
                startIndex = i;
            }
            curvedSection.push(points[i]);
        } else if (curvedSection.length > 0) {
            // Add the last point of the curve
            curvedSection.push(points[i]);
            break;
        }
    }


    return curvedSection;
}

let points = [
    [4.0642032110437905, 361.135288873567],
    [6.054191537546801, 382.18716641774495],
    [9.3621114047234, 403.07255048955494],
    [13.974907964102798, 423.7090160196902],
    [19.874376615051354, 444.01512030660734],
    [21.16303069511873, 447.594494711728],
    [81.33796816260849, 389.83360774617285],
    [3.7865994099146434, 352.30179269090854]
];

let p = [
    [130.65572173720824, 533.4570441327866],
    [152.21624906494236, 533.8365982608667],
    [158.68469544821014, 518.5781229407031],
    [154.23729795761344, 511.55961605464745],
    [138.48695060440537, 510.0577037572416],
    [128.2389141391627, 517.9439303402139]
]

const points2 = [
    [55.7992202760217, 159.6407008100698],    // index 0 - starting point of curve
    [45.035171497235496, 177.84171329736267],  // index 1
    [35.43521413993777, 196.68269045919664],   // index 2
    [27.037234850014674, 216.08927556633725],  // index 3
    [19.874376615051336, 235.98487969339257],  // index 4
    [13.974907964102808, 256.2909839803097],   // index 5
    [13.471370730207719, 258.5436800696889],   // index 6 - ending point of curve
    [97.90953468698626, 284.5446950667652],    // index 7
    [106.77387225790856, 183.78498575903114],  // index 8
    [59.34093914028428, 154.42921976011075]    // index 9
  ];
let ext = externalPoints(points2);
console.log(ext[0], ext[ext.length - 1]);
// console.log(bounds(points));
console.log(isCurved(points));
console.log(findCurvedPoints(points)); */

function isCurved(pts: any): boolean {
    let points = pts.sort((a: any, b: any) => a[0] - b[0]).sort((a: any, b: any) => a[1] - b[1]);
    let curvedSection = [];
    let isCurved = false;
    let startIndex = 0;

    for (let i = 0; i < points.length - 1; i++) {
        if (points[i][0] > points[i + 1][0] && // x is decreasing
            points[i][1] < points[i + 1][1]) {  // y is increasing
            if (curvedSection.length === 0) {
                startIndex = i;
            }
            curvedSection.push(points[i]);
        } else if (curvedSection.length > 0) {
            // Add the last point of the curve
            // curvedSection.push(points[i]);
            break;
        }
    }

    console.log(curvedSection);
    return isCurved
}

function findCurvedPart(points: string | any[]) {
    function angleBetween(p1: number[], p2: number[], p3: number[]) {
        let v1 = [p2[0] - p1[0], p2[1] - p1[1]];
        let v2 = [p3[0] - p2[0], p3[1] - p2[1]];
        let dot = v1[0] * v2[0] + v1[1] * v2[1];
        let mag1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
        let mag2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2);
        return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
    }

    let curvedSegments = [];
    for (let i = 1; i < points.length - 1; i++) {
        let angle = angleBetween(points[i - 1], points[i], points[i + 1]);
        if (angle < 150) {  // Threshold for curvature
            curvedSegments.push(points[i]);
        }
    }
    curvedSegments
    return curvedSegments;
}

const points = [
    [55.7992202760217, 159.6407008100698],
    [45.035171497235496, 177.84171329736267],
    [35.43521413993777, 196.68269045919664],
    [27.037234850014674, 216.08927556633725],
    [19.874376615051336, 235.98487969339257],
    [13.974907964102808, 256.2909839803097],
    [13.471370730207719, 258.5436800696889],
    [97.90953468698626, 284.5446950667652],
    [106.77387225790856, 183.78498575903114],
    [59.34093914028428, 154.42921976011075]
];

console.log(findCurvedPart(points));
console.log(isCurved(points));

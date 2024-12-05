import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, map } from 'rxjs';
import { pieImages } from '../components/models';
import * as topojson from "topojson-client";
import * as d3 from 'd3';

import * as world from 'assets/datasets/countries-110m.json';
import * as industry from 'assets/datasets/industryrelation.json';

export class Browser {
    date: string;
    name: string;
    value: number;

    constructor(date: string, name: string, value: number) {
        this.date = date;
        this.name = name;
        this.value = value;
    }
}

export class Energy {
    source: string;
    target: string;
    value: number;

    constructor(source: string, target: string, value: number) {
        this.source = source;
        this.target = target;
        this.value = value;
    }
}


@Injectable({ providedIn: "root" })
export class LoadDataService {


    startDate = new Date("1994-01-01").getTime();
    // endDate = Date.now();
    endDate = new Date("2023-01-01").getTime();
    browserSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);


    constructor(private http: HttpClient) { }

    public browserArray: Browser[] = [];
    public energyArray: Energy[] = [];
    public aiDataArray: any[] = [];

    getWatch(): Observable<any> {
        return this.http.get('assets/datasets/trit.json')
    }

    getIndustryData() {
        return this.http.get('assets/datasets/industryrelation.json')
    }

    getAiData() {
        return this.http.get('assets/datasets/aiddata.csv', { responseType: 'text' }).pipe(
            map((d: any) => {

                let csvToRowArray = d.split("\n");
                for (let index = 1; index < csvToRowArray.length - 1; index++) {
                    let row = csvToRowArray[index].split(",");

                    this.aiDataArray.push({
                        country: row[1],
                        year: parseInt(row[2]),
                        donations: parseInt(row[3].trim()),
                        receipts: parseInt(row[4]),
                        net_donations: parseInt(row[5])
                    });
                }
                // group entities by name and year
                const entities = d3.group(this.aiDataArray, (d: any) => d.country, d => d.year);

                // attach data to each country in properties
                const countries = topojson.feature(world as any, world.objects.countries as any) as any;

                countries.features.forEach((country: any) => {

                    if ((entities.get((`"${country.properties.name}"`)) === undefined)) {
                        return
                    } else {
                        country.properties.data = entities.get((`"${country.properties.name}"`));
                    }
                })

                return { aiDataArray: this.aiDataArray, countries };
            })
        )
    }

    getEnergyData(): Observable<Energy[]> {
        return this.http.get('assets/datasets/energy.csv', { responseType: 'text' }).pipe(
            map(data => {
                let csvToRowArray = data.split("\n");
                for (let index = 1; index < csvToRowArray.length - 1; index++) {
                    let row = csvToRowArray[index].split(",");
                    this.energyArray.push({ source: row[0], target: row[1], value: parseInt(row[2].trim()) });
                }
                return this.energyArray;
            })
        );
    }

    getEnergyNodes() {
        return this.getEnergyData().pipe(
            map(item => {
                return {
                    nodes: Array.from(new Set(item.flatMap((l: { source: any; target: any; }) => [l.source, l.target])), name => ({ name, category: String(name).replace(/ .*/, "") })),
                    links: item
                }
            })
        )
    }


    getBrowsersList(): Observable<any> {
        return this.http.get('assets/datasets/web_browsers_1994-2023.csv', { responseType: 'text' }).pipe(
            map(data => {
                let csvToRowArray = data.split("\n");
                for (let index = 1; index < csvToRowArray.length - 1; index++) {
                    let row = csvToRowArray[index].split(",");
                    this.browserArray.push({ date: row[0], name: row[1], value: parseInt(row[2].trim()) });
                }
                return this.browserArray;
            }),
            catchError((error) => {
                console.log(error);
                return error;
            })
        );
    }

    filterBrowserList(): Observable<any[]> {
        return this.getBrowsersList().pipe(
            filter((browser: any) => {
                return browser.map((item: any) => {
                    if (new Date(item.date).getTime() >= this.startDate && new Date(item.date).getTime() <= this.endDate) return item
                })
            })
        )
    }

    transformedBrowserList() {
        return this.filterBrowserList().pipe(
            map(browserObject => {
                return browserObject.map(item => {
                    let imageObject = pieImages.find((imageObject: any) => item.name === imageObject.name);
                    return { ...item, ...imageObject };
                })
            })
        )
    }

    getImageLinks() {
        return new Map(pieImages.map(item => [item.name, item.image]))
    }

    getBrowserNames() {
        return this.transformedBrowserList().pipe(
            map(browser => new Set(browser.map(item => item.name)))
        )
    }

    getDateValues() {
        return this.transformedBrowserList().pipe(
            map(item => {
                return {
                    dateValues: Array.from(d3.rollup(item, ([d]) => d.value, d => + new Date(d.date), d => d.name))
                        .map(([date, data]) => [(new Date(date)), data])
                        .sort(([a], [b]) => d3.ascending(a as any, b as any)),
                    browserNames: new Set(item.map(browser => browser.name))
                }
            })
        )
    }


    getKeyFrames() {
        return this.getDateValues().pipe(map(data => {
            const keyframes = [];
            const k = 100;
            let ka: any, a: any, kb: any, b: any;
            for ([[ka, a], [kb, b]] of d3.pairs(data.dateValues)) {
                for (let i = 0; i < k; ++i) {
                    const t = i / k;

                    keyframes.push([
                        new Date(ka * (1 - t) + kb * t),
                        this.rank((name: any) => {
                            return (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t
                        }, data.browserNames)
                    ]);
                }
                keyframes.push([new Date(kb), this.rank((name: any) => b.get(name) || 0, data.browserNames)]);
            }
            return keyframes;
        }));
    }

    rank(value: any, names: any) {
        let data = Array.from(names, (name: any) => ({ name: name, image: this.getImageLinks().get(name), rank: 0, value: value(name) || 0 }));
        for (let i = 0; i < data.length; ++i) {
            data[i].rank = i;
        }
        return data;
    }
}
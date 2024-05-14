import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs';
import * as d3 from 'd3';


@Injectable({ providedIn: "root" })
export class RaceBarService {

    textContent: string | undefined;

    startDate = new Date("1994-01-01").getTime();
    endDate = new Date("2023-01-01").getTime();

    constructor(private http: HttpClient) { }


    getProducts() {
        const productsArray: any[] = [];
        return this.http.get('assets/category-brands.csv', { responseType: 'text' }).pipe(
            map(data => {
                let csvToRowArray = data.split("\n");
                for (let index = 1; index < csvToRowArray.length - 1; index++) {
                    let row = csvToRowArray[index].split(",");
                    productsArray.push({ date: row[0], name: row[1], category: row[2], value: parseInt(row[3].trim()) });
                }
                return productsArray;
            }),
            catchError((error) => {
                console.log(error);
                return error;
            })
        );
    }

    getDateValues() {
        return this.getProducts().pipe(
            map((item: any) => {

                return {
                    products: item,
                    dataValues: Array.from(d3.rollup(item, ([d]) => d.value, (d) => (d.date), (d: any) => d.name))
                        .map(([date, data]) =>
                            [new Date(date), data]
                        )
                        .sort(([a], [b]) => d3.ascending(a as any, b as any)),
                    productNames: new Set(item.map((product: any) => product.name))
                }
            })
        )
    }

    getNameFrames() {
        return this.getKeyFrames().pipe(map(frame => d3.group(frame.keyframes.flatMap(([, data]: any) => data), (d: any) => d.name)))
    }

    getKeyFrames() {
        return this.getDateValues().pipe(map(data => {

            const keyframes: any = [];
            const k = 10;
            let ka: any, a: any, kb: any, b: any;
            for ([[ka, a], [kb, b]] of d3.pairs(data.dataValues)) {
                for (let i = 0; i < k; ++i) {
                    const t = i / k;

                    keyframes.push([
                        new Date(ka * (1 - t) + kb * t),
                        this.rank((name: any) => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t, data.productNames)
                    ]);
                }
                keyframes.push([new Date(kb), this.rank((name: any) => b.get(name) || 0, data.productNames)]);
            }
            return {
                products: data.products,
                keyframes,
                next: new Map(keyframes.flatMap(([, data]: any) => d3.pairs(data))),
                prev: new Map(keyframes.flatMap(([, data]: any) => d3.pairs(data, (a, b) => [b, a])))
            }
        }));
    }

    rank(value: any, names: any) {
        let data = Array.from(names, (name: any) => ({ name: name, rank: 0, value: value(name) }));
        data.sort((a, b) => d3.descending(a.value, b.value));

        for (let i = 0; i < data.length; ++i) {
            data[i].rank = Math.min(12, i);
        }
        return data;
    }

}
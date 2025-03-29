import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VoronoiState } from '../store/voronoi.types';
import * as d3 from 'd3';

export const selectVoronoiState = createFeatureSelector<VoronoiState>('voronoi');

export const selectCountries = createSelector(
    selectVoronoiState,
    (state) => state.countries
);

export const selectCompanies = createSelector(
    selectVoronoiState,
    (state) => state.companies
);

export const selectNestedCompanyData = (filterBy: string) => createSelector(
    selectCompanies,
    (companies) => {
        const nested = d3.group(companies, (d: any) => d[filterBy]);
        const companyHierarchy = d3.hierarchy(nested, (d: any) => {
            if (typeof d.values === 'function') {
                if (d.length === 2) {
                    return d[1];
                }
            } else {
                return d.values;
            }
        }).sum((d: any) => Number(d.SharePrice));

        return companies.length > 0 && { companyHierarchy, data: companies };
    }
);

// Add other selectors for dateValues, keyFrames, etc.

export const selectDateValues = createSelector(
    selectCountries,
    (countries) => {
        return {
            products: countries,
            dataValues: Array.from(d3.rollup(countries, ([d]) => d.value, (d) => (d.date), (d: any) => d.name))
                .map(([date, data]) => [new Date(date), data])
                .sort(([a], [b]) => d3.ascending(a as any, b as any)),
            productNames: new Set(countries.map((product: any) => product.name))
        };
    }
);

const rank = (value: any, names: any) => {
    let data = Array.from(names, (name: any) => ({ name: name, rank: 0, value: value(name) }));
    data.sort((a, b) => d3.descending(a.value, b.value));

    for (let i = 0; i < data.length; ++i) {
        data[i].rank = Math.min(12, i);
    }
    return data;
};

export const selectKeyFrames = createSelector(
    selectDateValues,
    (dateValues) => {
        const keyframes: any = [];
        const k = 10;
        let ka: any, a: any, kb: any, b: any;

        for ([[ka, a], [kb, b]] of d3.pairs(dateValues.dataValues)) {
            for (let i = 0; i < k; ++i) {
                const t = i / k;
                keyframes.push([
                    new Date(ka * (1 - t) + kb * t),
                    rank(
                        (name: any) => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t,
                        dateValues.productNames
                    )
                ]);
            }
            keyframes.push([new Date(kb), rank((name: any) => b.get(name) || 0, dateValues.productNames)]);
        }

        return {
            products: dateValues.products,
            keyframes,
            next: new Map(keyframes.flatMap(([, data]: any) => d3.pairs(data))),
            prev: new Map(keyframes.flatMap(([, data]: any) => d3.pairs(data, (a, b) => [b, a])))
        };
    }
);

export const selectNameFrames = createSelector(
    selectKeyFrames,
    (keyFramesData) => {
        return d3.group(
            keyFramesData.keyframes.flatMap(([, data]: any) => data),
            (d: any) => d.name
        );
    }
);
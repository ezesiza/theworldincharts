export interface VoronoiState {
    countries: any[];
    companies: any[];
    countrySelected: any;
    loading: boolean;
    error: string | null;
}

export const initialVoronoiState: VoronoiState = {
    countries: [],
    companies: [],
    countrySelected: null,
    loading: false,
    error: null
};

export interface VoronoiState {
    countries: any[];
    companies: any[];
    loading: boolean;
    error: string | null;
}
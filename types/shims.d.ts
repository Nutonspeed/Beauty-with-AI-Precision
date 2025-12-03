declare class AdvancedTreatmentRecommender {
  constructor();
  recommend(input: any): any;
  recommendTreatments?(input: any): any;
}

declare module 'AdvancedTreatmentRecommender' {
  export = AdvancedTreatmentRecommender;
}

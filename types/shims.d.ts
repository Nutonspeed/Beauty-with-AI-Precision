declare class AdvancedProgramRecommender {
  constructor();
  recommend(input: any): any;
  recommendPrograms?(input: any): any;
}

declare module 'AdvancedProgramRecommender' {
  export = AdvancedProgramRecommender;
}
